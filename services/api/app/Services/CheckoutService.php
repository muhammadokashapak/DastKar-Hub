<?php

namespace App\Services;

use App\Models\Address;
use App\Models\CustomizationOption;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CheckoutService
{
    /**
     * Revalidate items and calculate authoritative pricing
     */
    public function calculateQuote(array $items, string $shippingMethod = 'standard'): array
    {
        $subtotal = 0.00;
        $validatedItems = [];

        foreach ($items as $item) {
            $product = Product::with(['seller', 'primaryImage', 'variants', 'customizationOptions'])
                ->findOrFail($item['product_id']);

            if ($product->status !== 'published') {
                throw ValidationException::withMessages([
                    'items' => ["Product '{$product->title}' is no longer available."],
                ]);
            }

            $unitPrice = (float) $product->base_price;
            $variant = null;

            if (!empty($item['variant_id'])) {
                $variant = ProductVariant::where('product_id', $product->id)
                    ->where('id', $item['variant_id'])
                    ->firstOrFail();

                $unitPrice = (float) $variant->price;
                $availableStock = $variant->stock_quantity;
            } else {
                $availableStock = $product->stock_quantity;
            }

            $qty = (int) ($item['quantity'] ?? 1);
            if ($qty <= 0) {
                $qty = 1;
            }

            if ($qty > $availableStock) {
                throw ValidationException::withMessages([
                    'items' => ["Requested quantity for '{$product->title}' exceeds available stock ({$availableStock})."],
                ]);
            }

            // Calculate structured customization price delta
            $customizationCost = 0.00;
            $customizationData = $item['customization'] ?? null;
            if ($customizationData && is_array($customizationData)) {
                foreach ($customizationData as $optName => $optVal) {
                    $opt = CustomizationOption::where('product_id', $product->id)
                        ->where('name', $optName)
                        ->first();
                    if ($opt && $opt->price_delta > 0 && !empty($optVal)) {
                        $customizationCost += (float) $opt->price_delta;
                    }
                }
            }

            $effectiveUnitPrice = $unitPrice + $customizationCost;
            $lineSubtotal = $effectiveUnitPrice * $qty;
            $subtotal += $lineSubtotal;

            $validatedItems[] = [
                'product' => $product,
                'variant' => $variant,
                'quantity' => $qty,
                'unit_price' => $effectiveUnitPrice,
                'subtotal' => $lineSubtotal,
                'customization' => $customizationData,
            ];
        }

        // Authoritative Pakistani shipping rates
        $shippingFee = ($shippingMethod === 'express') ? 450.00 : 250.00;
        if ($subtotal >= 10000.00 && $shippingMethod === 'standard') {
            $shippingFee = 0.00; // Free standard shipping on orders over PKR 10,000
        }

        $discount = 0.00;
        $total = $subtotal + $shippingFee - $discount;

        return [
            'subtotal' => round($subtotal, 2),
            'shipping_fee' => round($shippingFee, 2),
            'discount_amount' => round($discount, 2),
            'total_amount' => round($total, 2),
            'currency' => 'PKR',
            'validated_items' => $validatedItems,
        ];
    }

    /**
     * Process checkout and save immutable snapshot records
     */
    public function createOrder(User $buyer, array $data): Order
    {
        return DB::transaction(function () use ($buyer, $data) {
            $quote = $this->calculateQuote($data['items'], $data['shipping_method'] ?? 'standard');

            $addressSnapshot = $data['shipping_address'] ?? null;
            if (empty($addressSnapshot) && !empty($data['address_id'])) {
                $address = Address::where('user_id', $buyer->id)->findOrFail($data['address_id']);
                $addressSnapshot = [
                    'full_name' => $address->full_name,
                    'phone' => $address->phone,
                    'address_line1' => $address->address_line1,
                    'address_line2' => $address->address_line2,
                    'city' => $address->city,
                    'state_province' => $address->state_province,
                    'postal_code' => $address->postal_code,
                    'country' => $address->country,
                ];
            }

            if (empty($addressSnapshot['full_name']) || empty($addressSnapshot['address_line1']) || empty($addressSnapshot['city']) || empty($addressSnapshot['phone'])) {
                throw ValidationException::withMessages([
                    'shipping_address' => ['Complete shipping address (name, phone, address, city) is required.'],
                ]);
            }

            $orderNumber = 'DKH-' . date('Y') . '-' . strtoupper(substr(uniqid(), -6));

            $isCod = ($data['payment_method'] ?? 'cod') === 'cod';

            $order = Order::create([
                'order_number' => $orderNumber,
                'buyer_id' => $buyer->id,
                'status' => $isCod ? 'confirmed' : 'pending_payment',
                'subtotal' => $quote['subtotal'],
                'shipping_fee' => $quote['shipping_fee'],
                'discount_amount' => $quote['discount_amount'],
                'total_amount' => $quote['total_amount'],
                'currency' => 'PKR',
                'shipping_address_snapshot' => $addressSnapshot,
                'shipping_method' => $data['shipping_method'] ?? 'standard',
                'payment_method' => $data['payment_method'] ?? 'cod',
                'payment_status' => 'pending',
                'notes' => $data['notes'] ?? null,
                'placed_at' => now(),
            ]);

            foreach ($quote['validated_items'] as $item) {
                $product = $item['product'];
                $variant = $item['variant'];
                $qty = $item['quantity'];

                // Atomic stock lock & validation to prevent race-condition overselling
                if ($variant) {
                    $lockedVariant = ProductVariant::where('id', $variant->id)->lockForUpdate()->first();
                    if (!$lockedVariant || $lockedVariant->stock_quantity < $qty) {
                        throw ValidationException::withMessages([
                            'items' => ["Requested quantity for variant '{$variant->name}' is no longer available."],
                        ]);
                    }
                    $lockedVariant->decrement('stock_quantity', $qty);
                } else {
                    $lockedProduct = Product::where('id', $product->id)->lockForUpdate()->first();
                    if (!$lockedProduct || $lockedProduct->stock_quantity < $qty) {
                        throw ValidationException::withMessages([
                            'items' => ["Requested quantity for '{$product->title}' is no longer available."],
                        ]);
                    }
                    $lockedProduct->decrement('stock_quantity', $qty);
                }

                // Increment seller GMV
                $product->seller->increment('total_sales', $item['subtotal']);

                // Create immutable order item snapshot per A22
                OrderItem::create([
                    'order_id' => $order->id,
                    'seller_id' => $product->seller_id,
                    'product_id' => $product->id,
                    'variant_id' => $variant ? $variant->id : null,
                    'product_title' => $product->title,
                    'product_image' => $product->primaryImage ? $product->primaryImage->image_url : null,
                    'product_snapshot_json' => [
                        'title' => $product->title,
                        'slug' => $product->slug,
                        'base_price' => $product->base_price,
                        'materials' => $product->materials,
                        'artisan_name' => $product->seller->business_name,
                        'artisan_location' => $product->seller->location_city,
                        'variant_name' => $variant ? $variant->name : null,
                    ],
                    'customization_json' => $item['customization'],
                    'quantity' => $qty,
                    'unit_price' => $item['unit_price'],
                    'subtotal' => $item['subtotal'],
                    'status' => 'pending',
                ]);
            }

            Payment::create([
                'order_id' => $order->id,
                'provider' => $data['payment_method'] ?? 'cod',
                'provider_reference' => 'PAY-' . strtoupper(substr(md5(uniqid()), 0, 10)),
                'status' => 'pending',
                'amount' => $quote['total_amount'],
                'currency' => 'PKR',
                'paid_at' => null,
            ]);

            return $order->load(['items.seller', 'payments']);
        });
    }
}
