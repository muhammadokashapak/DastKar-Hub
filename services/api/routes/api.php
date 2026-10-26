<?php

use App\Http\Controllers\Api\v1\AdminController;
use App\Http\Controllers\Api\v1\AuthController;
use App\Http\Controllers\Api\v1\CategoryController;
use App\Http\Controllers\Api\v1\DiscoveryController;
use App\Http\Controllers\Api\v1\DisputeController;
use App\Http\Controllers\Api\v1\NotificationController;
use App\Http\Controllers\Api\v1\OrderController;
use App\Http\Controllers\Api\v1\PayoutController;
use App\Http\Controllers\Api\v1\ProductController;
use App\Http\Controllers\Api\v1\SellerController;
use App\Http\Controllers\Api\v1\SellerDashboardController;
use App\Http\Controllers\Api\v1\VerificationController;
use App\Http\Controllers\Api\v1\WebhookController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Authentication (Rate limited against brute-force attacks)
    Route::post('/auth/register', [AuthController::class, 'register'])->middleware('throttle:10,1');
    Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:6,1');

    // Public Catalog
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/{slug}', [CategoryController::class, 'show']);
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/featured', [ProductController::class, 'featured']);
    Route::get('/products/{slug}', [ProductController::class, 'show']);
    Route::get('/makers', [SellerController::class, 'index']);
    Route::get('/makers/{slug}', [SellerController::class, 'show']);

    // Internal Marketplace Discovery & Ranking Engine
    Route::prefix('discovery')->group(function () {
        Route::get('/trending', [DiscoveryController::class, 'trending']);
        Route::get('/new-arrivals', [DiscoveryController::class, 'newArrivals']);
        Route::get('/best-sellers', [DiscoveryController::class, 'bestSellers']);
        Route::get('/recommended', [DiscoveryController::class, 'recommended']);
        Route::get('/new-makers', [DiscoveryController::class, 'newMakers']);
        Route::get('/config', [DiscoveryController::class, 'config']);
        Route::post('/events', [DiscoveryController::class, 'recordEvent'])->middleware('throttle:120,1');
    });

    // Cart / Checkout Quote (Accessible to both guests & logged in)
    Route::post('/checkout/quote', [OrderController::class, 'quote']);

    // Webhooks for Payment Gateways and Courier Dispatch (Rate limited, exempt from sanctum auth)
    Route::prefix('webhooks')->middleware('throttle:60,1')->group(function () {
        Route::post('/payment/{provider}', [WebhookController::class, 'paymentWebhook']);
        Route::post('/courier/{provider}', [WebhookController::class, 'courierWebhook']);
    });

    // Authenticated Routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);

        // Notifications
        Route::get('/notifications', [NotificationController::class, 'index']);
        Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllRead']);

        // Buyer Orders, Addresses, Reviews & Disputes
        Route::post('/checkout/process', [OrderController::class, 'checkout']);
        Route::get('/orders', [OrderController::class, 'index']);
        Route::get('/orders/{orderNumber}', [OrderController::class, 'show']);
        Route::post('/orders/{orderNumber}/review', [OrderController::class, 'submitReview']);
        Route::get('/addresses', [OrderController::class, 'addresses']);
        Route::post('/addresses', [OrderController::class, 'saveAddress']);

        // Disputes
        Route::get('/disputes', [DisputeController::class, 'index']);
        Route::post('/orders/{orderNumber}/dispute', [DisputeController::class, 'store']);

        // Seller Hub Routes
        Route::prefix('seller')->group(function () {
            Route::get('/stats', [SellerDashboardController::class, 'stats']);
            Route::get('/products', [SellerDashboardController::class, 'products']);
            Route::post('/products', [SellerDashboardController::class, 'storeProduct']);
            Route::put('/products/{id}', [SellerDashboardController::class, 'updateProduct']);
            Route::delete('/products/{id}', [SellerDashboardController::class, 'deleteProduct']);
            Route::post('/ai/generate-listing', [SellerDashboardController::class, 'generateAiListing'])->middleware('throttle:30,1');
            Route::get('/orders', [SellerDashboardController::class, 'orders']);
            Route::patch('/orders/{id}/status', [SellerDashboardController::class, 'updateOrderStatus']);
            Route::post('/orders/{id}/shipment', [SellerDashboardController::class, 'createShipment']);

            // Verification
            Route::get('/verification', [VerificationController::class, 'status']);
            Route::post('/verification', [VerificationController::class, 'store']);

            // Payouts & Financial Ledger
            Route::get('/payouts', [PayoutController::class, 'sellerPayouts']);
            Route::get('/disputes', [DisputeController::class, 'sellerDisputes']);
        });

        // Admin Console Routes
        Route::prefix('admin')->group(function () {
            Route::get('/stats', [AdminController::class, 'stats']);
            Route::post('/sellers/{id}/verify', [AdminController::class, 'verifySeller']);
            Route::get('/audit-logs', [AdminController::class, 'auditLogs']);

            // Verification moderation
            Route::get('/verifications', [VerificationController::class, 'adminIndex']);
            Route::post('/verifications/{id}/review', [VerificationController::class, 'review']);

            // Payouts management
            Route::get('/payouts', [PayoutController::class, 'adminPayouts']);
            Route::post('/payouts/{id}/disburse', [PayoutController::class, 'disburse']);

            // Disputes resolution
            Route::get('/disputes', [DisputeController::class, 'adminDisputes']);
            Route::post('/disputes/{id}/resolve', [DisputeController::class, 'resolve']);
        });
    });
});
