<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\Order;
use App\Models\Shipment;
use App\Services\Logistics\CourierInterface;
use App\Services\Logistics\TcsCourierProvider;
use App\Services\Logistics\TraxCourierProvider;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class LogisticsService
{
    public function resolveCourier(string $courier): CourierInterface
    {
        return match (strtolower($courier)) {
            'trax' => new TraxCourierProvider(),
            'tcs', 'express' => new TcsCourierProvider(),
            default => new TcsCourierProvider(),
        };
    }

    /**
     * Create shipment and book with courier partner.
     */
    public function createShipment(Order $order, int $sellerId, string $courier = 'tcs', array $params = []): Shipment
    {
        $provider = $this->resolveCourier($courier);
        $booking = $provider->bookShipment($order, $params);

        return DB::transaction(function () use ($order, $sellerId, $courier, $booking) {
            $shipment = Shipment::create([
                'order_id' => $order->id,
                'seller_id' => $sellerId,
                'courier' => $courier,
                'tracking_number' => $booking['tracking_number'],
                'status' => 'booked',
                'shipping_cost' => $booking['shipping_cost'] ?? 250.00,
                'shipping_label_url' => $booking['shipping_label_url'] ?? null,
                'origin_city' => $booking['origin_city'] ?? 'Karachi',
                'destination_city' => $booking['destination_city'] ?? 'Lahore',
                'shipped_at' => now(),
                'tracking_history_json' => $booking['tracking_history'] ?? [],
            ]);

            // Update order status to shipped
            $order->update(['status' => 'shipped']);

            // Notify buyer
            NotificationService::send(
                $order->buyer_id,
                'order_shipped',
                'Artisan Order Shipped',
                "Your parcel for order #{$order->order_number} has been dispatched via " . strtoupper($courier) . " (Tracking: {$shipment->tracking_number}).",
                "/account/orders/{$order->order_number}",
                ['order_id' => $order->id, 'tracking_number' => $shipment->tracking_number]
            );

            AuditLog::create([
                'user_id' => auth()->id() ?? $order->buyer_id,
                'action' => 'shipment.created',
                'entity_type' => 'Shipment',
                'entity_id' => $shipment->id,
                'changes_json' => [
                    'order_id' => $order->id,
                    'courier' => $courier,
                    'tracking_number' => $shipment->tracking_number,
                ],
            ]);

            return $shipment;
        });
    }

    /**
     * Handle courier status webhook.
     */
    public function handleWebhook(string $courier, array $payload, string $signature = ''): array
    {
        Log::info("Logistics webhook received from courier: {$courier}", ['payload' => $payload]);

        $provider = $this->resolveCourier($courier);
        $parsed = $provider->parseWebhook($payload, $signature);

        if (empty($parsed['tracking_number'])) {
            return [
                'success' => false,
                'message' => 'Tracking number missing in payload',
                'status_code' => 400,
            ];
        }

        $shipment = Shipment::where('tracking_number', $parsed['tracking_number'])->first();
        if (!$shipment) {
            return [
                'success' => false,
                'message' => 'Shipment not found for tracking number ' . $parsed['tracking_number'],
                'status_code' => 404,
            ];
        }

        DB::transaction(function () use ($shipment, $parsed) {
            $history = $shipment->tracking_history_json ?? [];
            $history[] = [
                'status' => $parsed['status'],
                'location' => $parsed['location'] ?? 'In transit hub',
                'timestamp' => $parsed['timestamp'] ?? now()->toIso8601String(),
                'remarks' => $parsed['remarks'] ?? 'Updated via Courier Webhook',
            ];

            $updateData = [
                'status' => $parsed['status'],
                'tracking_history_json' => $history,
            ];

            if ($parsed['status'] === 'delivered') {
                $updateData['delivered_at'] = now();
            }

            $shipment->update($updateData);

            $order = $shipment->order;
            if ($order && $parsed['status'] === 'delivered') {
                $order->update([
                    'status' => 'delivered',
                    'delivered_at' => now(),
                ]);

                // Increment seller completed orders count upon genuine delivery
                foreach ($order->items as $orderItem) {
                    if ($orderItem->seller) {
                        $orderItem->seller->increment('completed_orders');
                    }
                }

                // Auto-trigger seller pending payout calculation
                app(PayoutService::class)->createPendingPayoutForOrder($order);

                // Notify buyer
                NotificationService::send(
                    $order->buyer_id,
                    'order_delivered',
                    'Parcel Delivered',
                    "Your authentic handcrafted item for order #{$order->order_number} has been delivered. Please leave a review for the maker!",
                    "/account/orders/{$order->order_number}",
                    ['order_id' => $order->id]
                );
            }
        });

        return [
            'success' => true,
            'message' => 'Shipment tracking updated successfully',
            'tracking_number' => $shipment->tracking_number,
            'status' => $parsed['status'],
            'status_code' => 200,
        ];
    }
}
