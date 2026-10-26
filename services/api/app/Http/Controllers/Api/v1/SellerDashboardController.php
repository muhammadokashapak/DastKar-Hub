<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SellerDashboardController extends Controller
{
    private function getSeller(Request $request)
    {
        $seller = $request->user()->sellerProfile;
        if (!$seller) {
            abort(403, 'You do not have an active seller profile.');
        }
        return $seller;
    }

    public function stats(Request $request): JsonResponse
    {
        $seller = $this->getSeller($request);

        $totalSales = $seller->total_sales;
        $totalOrders = $seller->completed_orders;
        $activeProductsCount = Product::where('seller_id', $seller->id)->where('status', 'published')->count();
        $storeRating = $seller->rating_average;

        // Discovery boost calculation & consistency status
        $boostService = app(\App\Services\Discovery\NewSellerBoostService::class);
        $discoveryBoost = $boostService->getBoostStatus($seller);

        // Recent seller orders
        $recentOrders = OrderItem::with(['order.buyer', 'product.primaryImage'])
            ->where('seller_id', $seller->id)
            ->orderBy('created_at', 'desc')
            ->take(6)
            ->get();

        return response()->json([
            'data' => [
                'seller' => $seller,
                'total_sales' => $totalSales,
                'total_orders' => $totalOrders,
                'active_products_count' => $activeProductsCount,
                'store_rating' => $storeRating,
                'recent_orders' => $recentOrders,
                'discovery_boost' => $discoveryBoost,
            ],
        ]);
    }

    public function products(Request $request): JsonResponse
    {
        $seller = $this->getSeller($request);

        $products = Product::with(['primaryImage', 'images', 'variants', 'category'])
            ->where('seller_id', $seller->id)
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json([
            'data' => $products->items(),
            'meta' => [
                'current_page' => $products->currentPage(),
                'total' => $products->total(),
            ],
        ]);
    }

    public function storeProduct(Request $request): JsonResponse
    {
        $seller = $this->getSeller($request);

        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'title' => 'required|string|max:200',
            'description' => 'required|string',
            'base_price' => 'required|numeric|min:50',
            'compare_at_price' => 'nullable|numeric|gte:base_price',
            'stock_quantity' => 'required|integer|min:0',
            'production_days' => 'nullable|integer|min:1',
            'materials' => 'nullable|string|max:250',
            'dimensions' => 'nullable|string|max:150',
            'care_instructions' => 'nullable|string',
            'is_customizable' => 'nullable|boolean',
            'image_urls' => 'required|array|min:1',
            'image_urls.*' => 'required|string',
        ]);

        $title = htmlspecialchars(strip_tags($validated['title']), ENT_QUOTES, 'UTF-8');
        $description = htmlspecialchars(strip_tags($validated['description']), ENT_QUOTES, 'UTF-8');
        $slug = Str::slug($title) . '-' . rand(1000, 9999);

        $product = Product::create([
            'seller_id' => $seller->id,
            'category_id' => $validated['category_id'],
            'title' => $title,
            'slug' => $slug,
            'description' => $description,
            'base_price' => $validated['base_price'],
            'compare_at_price' => $validated['compare_at_price'] ?? null,
            'stock_quantity' => $validated['stock_quantity'],
            'production_days' => $validated['production_days'] ?? 2,
            'materials' => !empty($validated['materials']) ? htmlspecialchars(strip_tags($validated['materials']), ENT_QUOTES, 'UTF-8') : null,
            'dimensions' => !empty($validated['dimensions']) ? htmlspecialchars(strip_tags($validated['dimensions']), ENT_QUOTES, 'UTF-8') : null,
            'care_instructions' => !empty($validated['care_instructions']) ? htmlspecialchars(strip_tags($validated['care_instructions']), ENT_QUOTES, 'UTF-8') : null,
            'is_customizable' => $validated['is_customizable'] ?? false,
            'status' => 'published',
            'published_at' => now(),
        ]);

        foreach ($validated['image_urls'] as $idx => $url) {
            ProductImage::create([
                'product_id' => $product->id,
                'image_url' => $url,
                'is_primary' => $idx === 0,
                'sort_order' => $idx + 1,
            ]);
        }

        return response()->json([
            'data' => $product->load(['primaryImage', 'images']),
            'message' => 'Craft product published successfully.',
        ], 201);
    }

    public function updateProduct(Request $request, int $id): JsonResponse
    {
        $seller = $this->getSeller($request);
        $product = Product::where('seller_id', $seller->id)->findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:200',
            'description' => 'sometimes|string',
            'base_price' => 'sometimes|numeric|min:50',
            'compare_at_price' => 'nullable|numeric',
            'stock_quantity' => 'sometimes|integer|min:0',
            'status' => 'sometimes|string|in:draft,published,paused,archived',
            'materials' => 'nullable|string',
            'dimensions' => 'nullable|string',
            'care_instructions' => 'nullable|string',
        ]);

        $product->update($validated);

        return response()->json([
            'data' => $product->fresh(['primaryImage', 'images', 'category']),
            'message' => 'Product updated.',
        ]);
    }

    public function deleteProduct(Request $request, int $id): JsonResponse
    {
        $seller = $this->getSeller($request);
        $product = Product::where('seller_id', $seller->id)->findOrFail($id);
        $product->delete();

        return response()->json(['message' => 'Product deleted successfully.']);
    }

    public function orders(Request $request): JsonResponse
    {
        $seller = $this->getSeller($request);

        $query = OrderItem::with(['order.buyer', 'product.primaryImage'])
            ->where('seller_id', $seller->id);

        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        $items = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json([
            'data' => $items->items(),
            'meta' => [
                'current_page' => $items->currentPage(),
                'total' => $items->total(),
            ],
        ]);
    }

    public function updateOrderStatus(Request $request, int $orderItemId): JsonResponse
    {
        $seller = $this->getSeller($request);

        $validated = $request->validate([
            'status' => 'required|string|in:accepted,processing,shipped,delivered,cancelled',
        ]);

        $item = OrderItem::where('seller_id', $seller->id)->findOrFail($orderItemId);
        $oldStatus = $item->status;
        $item->update(['status' => $validated['status']]);

        // If all items in the order are shipped/delivered, update parent order
        $order = $item->order;
        if ($validated['status'] === 'shipped') {
            $order->update(['status' => 'shipped']);
        } elseif ($validated['status'] === 'delivered') {
            $order->update(['status' => 'delivered', 'delivered_at' => now()]);
        }

        AuditLog::create([
            'actor_id' => $request->user()->id,
            'action' => 'seller.order_item_status_change',
            'entity_type' => 'OrderItem',
            'entity_id' => $item->id,
            'before_json' => ['status' => $oldStatus],
            'after_json' => ['status' => $validated['status']],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'data' => $item->fresh('order'),
            'message' => "Order item status updated to {$validated['status']}.",
        ]);
    }

    /**
     * Book courier shipment for an order
     */
    public function createShipment(Request $request, int $orderId): JsonResponse
    {
        $seller = $this->getSeller($request);

        $validated = $request->validate([
            'courier' => 'required|string|in:tcs,trax',
            'origin_city' => 'nullable|string|max:100',
            'shipping_cost' => 'nullable|numeric|min:0',
        ]);

        $order = Order::with('items')->findOrFail($orderId);

        // Verify seller has items in this order
        $hasItems = $order->items->where('seller_id', $seller->id)->isNotEmpty();
        if (!$hasItems) {
            return response()->json(['message' => 'Unauthorized. You have no items in this order.'], 403);
        }

        $logisticsService = app(\App\Services\LogisticsService::class);
        $shipment = $logisticsService->createShipment(
            $order,
            $seller->id,
            $validated['courier'],
            $validated
        );

        return response()->json([
            'data' => $shipment,
            'message' => "Shipment successfully booked with {$validated['courier']}. Consignment Tracking: {$shipment->tracking_number}",
        ], 201);
    }

    /**
     * AI-Assisted Listing Draft Synthesis (Phase 4 AI Roadmap)
     */
    public function generateAiListing(Request $request): JsonResponse
    {
        $this->getSeller($request);

        $validated = $request->validate([
            'notes' => 'required|string|min:3|max:500',
            'category_id' => 'nullable|exists:categories,id',
        ]);

        $aiService = app(\App\Services\AiListingService::class);
        $draft = $aiService->generateListing($validated['notes'], $validated['category_id'] ?? null);

        return response()->json([
            'data' => $draft,
            'message' => 'AI listing draft synthesized successfully. Review and approve before publishing.',
        ]);
    }
}

