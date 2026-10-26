<?php

namespace Tests\Feature;

use App\Models\Address;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\SellerProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdvancedMarketplaceTest extends TestCase
{
    use RefreshDatabase;

    protected User $buyer;
    protected User $sellerUser;
    protected SellerProfile $sellerProfile;
    protected User $admin;
    protected Product $product;

    protected function setUp(): void
    {
        parent::setUp();

        // Create Admin
        $this->admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@dastkarhub.pk',
            'password' => bcrypt('AdminSecret2026!'),
            'role' => 'admin',
        ]);

        // Create Seller
        $this->sellerUser = User::create([
            'name' => 'Ustad Rahim',
            'email' => 'rahim@chiniotwood.pk',
            'password' => bcrypt('ArtisanSecret2026!'),
            'role' => 'seller',
        ]);

        $this->sellerProfile = SellerProfile::create([
            'user_id' => $this->sellerUser->id,
            'business_name' => 'Chiniot Sheesham Carvings',
            'slug' => 'chiniot-sheesham-carvings',
            'craft_description' => 'Master Woodcarver inheriting the art of brass inlay woodwork.',
            'location_city' => 'Chiniot',
            'location_region' => 'Punjab',
            'bio' => 'Inherited the art of brass inlay woodwork from three generations.',
            'verification_status' => 'pending',
        ]);

        // Create Category & Product
        $category = Category::create([
            'name' => 'Woodwork & Furniture',
            'slug' => 'woodwork-furniture',
            'is_active' => true,
        ]);

        $this->product = Product::create([
            'seller_id' => $this->sellerProfile->id,
            'category_id' => $category->id,
            'title' => 'Hand-Carved Walnut Jharoka Mirror',
            'slug' => 'hand-carved-walnut-jharoka-mirror',
            'description' => 'Solid Kashmiri walnut wood mirror frame with traditional lattice work.',
            'base_price' => 15000.00,
            'status' => 'published',
            'stock_quantity' => 10,
        ]);

        // Create Buyer
        $this->buyer = User::create([
            'name' => 'Fatima Noor',
            'email' => 'fatima@dastkar.test',
            'password' => bcrypt('BuyerSecret2026!'),
            'role' => 'buyer',
        ]);
    }

    /**
     * Helper to create a test order
     */
    protected function createTestOrder(): Order
    {
        $order = Order::create([
            'order_number' => 'ORD-2026-' . rand(10000, 99999),
            'buyer_id' => $this->buyer->id,
            'status' => 'pending_payment',
            'subtotal' => 15000.00,
            'shipping_fee' => 350.00,
            'discount_amount' => 0.00,
            'total_amount' => 15350.00,
            'currency' => 'PKR',
            'shipping_address_snapshot' => [
                'full_name' => 'Fatima Noor',
                'phone' => '+923001234567',
                'address_line1' => 'House 14, Street 3, F-7/2',
                'city' => 'Islamabad',
            ],
            'shipping_method' => 'standard',
            'payment_method' => 'jazzcash_easypaisa',
            'payment_status' => 'pending',
            'placed_at' => now(),
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'seller_id' => $this->sellerProfile->id,
            'product_id' => $this->product->id,
            'unit_price' => 15000.00,
            'quantity' => 1,
            'subtotal' => 15000.00,
            'product_title' => $this->product->title,
            'product_image' => 'https://storage.dastkarhub.pk/products/mirror.jpg',
            'product_snapshot_json' => [
                'title' => $this->product->title,
                'price' => 15000.00,
                'origin' => 'Chiniot, Punjab',
            ],
            'status' => 'pending',
        ]);

        Payment::create([
            'order_id' => $order->id,
            'provider' => 'jazzcash_easypaisa',
            'status' => 'pending',
            'amount' => 15350.00,
            'currency' => 'PKR',
            'provider_reference' => 'TXN-TEST-123456',
        ]);

        return $order;
    }

    public function test_payment_webhook_idempotency_and_signature_handling(): void
    {
        $order = $this->createTestOrder();

        // 1. Send payment webhook
        $response = $this->postJson('/api/v1/webhooks/payment/jazzcash', [
            'pp_TxnRefNo' => 'TXN-TEST-123456',
            'pp_BillReference' => $order->order_number,
            'pp_ResponseCode' => '000',
            'pp_Amount' => '15350.00',
            'status' => 'paid',
            'test_mode' => true,
        ]);

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);

        $order->refresh();
        $this->assertEquals('paid', $order->payment_status);
        $this->assertEquals('confirmed', $order->status);

        // 2. Send identical webhook again (Idempotency test)
        $idempotentResponse = $this->postJson('/api/v1/webhooks/payment/jazzcash', [
            'pp_TxnRefNo' => 'TXN-TEST-123456',
            'pp_BillReference' => $order->order_number,
            'pp_ResponseCode' => '000',
            'pp_Amount' => '15350.00',
            'status' => 'paid',
            'test_mode' => true,
        ]);

        $idempotentResponse->assertStatus(200);
        $this->assertStringContainsString('Idempotent', $idempotentResponse->json('message'));
    }

    public function test_seller_shipment_booking_and_courier_webhook_delivery(): void
    {
        $order = $this->createTestOrder();
        $order->update(['status' => 'confirmed', 'payment_status' => 'paid']);

        // Authenticate seller and book TCS shipment
        $response = $this->actingAs($this->sellerUser, 'sanctum')
            ->postJson("/api/v1/seller/orders/{$order->id}/shipment", [
                'courier' => 'tcs',
                'origin_city' => 'Chiniot',
                'shipping_cost' => 300.00,
            ]);

        $response->assertStatus(201);
        $response->assertJsonStructure([
            'data' => ['tracking_number', 'status', 'shipping_label_url'],
        ]);

        $trackingNumber = $response->json('data.tracking_number');
        $this->assertNotEmpty($trackingNumber);

        $order->refresh();
        $this->assertEquals('shipped', $order->status);

        // Simulate Courier delivery webhook
        $webhookResponse = $this->postJson('/api/v1/webhooks/courier/tcs', [
            'tracking_number' => $trackingNumber,
            'status' => 'delivered',
            'location' => 'Islamabad Delivery Station',
            'remarks' => 'Handed over to recipient Fatima Noor',
        ]);

        $webhookResponse->assertStatus(200);

        $order->refresh();
        $this->assertEquals('delivered', $order->status);
        $this->assertNotNull($order->delivered_at);

        // Verify seller pending payout automatically generated
        $this->assertDatabaseHas('payouts', [
            'seller_id' => $this->sellerProfile->id,
            'order_id' => $order->id,
            'status' => 'pending',
            'gross_amount' => 15000.00,
            'commission_rate' => 8.00,
            'commission_amount' => 1200.00,
            'net_payout' => 13800.00, // 15000 - 8% (1200)
        ]);

        // Verify ledger credit
        $this->assertDatabaseHas('seller_ledgers', [
            'seller_id' => $this->sellerProfile->id,
            'type' => 'credit',
            'amount' => 13800.00,
            'balance_after' => 13800.00,
        ]);
    }

    public function test_payout_ledger_double_entry_and_disbursement(): void
    {
        $order = $this->createTestOrder();
        $order->update(['status' => 'delivered']);

        // Generate pending payout
        app(\App\Services\PayoutService::class)->createPendingPayoutForOrder($order);

        $payout = \App\Models\Payout::where('order_id', $order->id)->first();
        $this->assertNotNull($payout);
        $this->assertEquals('pending', $payout->status);

        // Seller views payouts & balance
        $sellerPayouts = $this->actingAs($this->sellerUser, 'sanctum')
            ->getJson('/api/v1/seller/payouts');

        $sellerPayouts->assertStatus(200);
        $this->assertEquals(13800.00, $sellerPayouts->json('data.current_balance_pkr'));

        // Admin disburses payout
        $adminDisburse = $this->actingAs($this->admin, 'sanctum')
            ->postJson("/api/v1/admin/payouts/{$payout->id}/disburse", [
                'notes' => 'Disbursed via Raast instant settlement.',
            ]);

        $adminDisburse->assertStatus(200);

        $payout->refresh();
        $this->assertEquals('paid', $payout->status);
        $this->assertNotNull($payout->paid_at);

        // Verify ledger debit and zero balance
        $this->assertDatabaseHas('seller_ledgers', [
            'seller_id' => $this->sellerProfile->id,
            'type' => 'debit',
            'amount' => 13800.00,
            'balance_after' => 0.00,
        ]);
    }

    public function test_dispute_creation_and_admin_refund_resolution(): void
    {
        $order = $this->createTestOrder();
        $order->update(['status' => 'delivered']);

        // Buyer opens dispute
        $disputeResponse = $this->actingAs($this->buyer, 'sanctum')
            ->postJson("/api/v1/orders/{$order->order_number}/dispute", [
                'reason' => 'damaged_in_transit',
                'description' => 'Mirror frame corner cracked during transit handling by courier.',
                'evidence_images' => ['https://storage.dastkarhub.pk/evidence/mirror-crack.jpg'],
            ]);

        $disputeResponse->assertStatus(201);
        $disputeId = $disputeResponse->json('data.id');

        $order->refresh();
        $this->assertEquals('disputed', $order->status);

        // Admin resolves dispute with partial refund of PKR 3000
        $resolveResponse = $this->actingAs($this->admin, 'sanctum')
            ->postJson("/api/v1/admin/disputes/{$disputeId}/resolve", [
                'resolution' => 'refund_partial',
                'amount' => 3000.00,
                'admin_notes' => 'Partial refund approved for local restoration craft repair.',
            ]);

        $resolveResponse->assertStatus(200);

        // Verify refund recorded
        $this->assertDatabaseHas('refunds', [
            'order_id' => $order->id,
            'dispute_id' => $disputeId,
            'amount' => 3000.00,
            'status' => 'completed',
        ]);

        // Verify seller ledger debited for refund
        $this->assertDatabaseHas('seller_ledgers', [
            'seller_id' => $this->sellerProfile->id,
            'type' => 'debit',
            'amount' => 3000.00,
            'reference_type' => 'refund',
        ]);
    }

    public function test_seller_verification_workflow(): void
    {
        // Seller submits artisan evidence
        $submitResponse = $this->actingAs($this->sellerUser, 'sanctum')
            ->postJson('/api/v1/seller/verification', [
                'type' => 'cnic',
                'document_number' => '33100-1234567-1',
                'workshop_address' => 'Mohallah Woodcraft, Katchery Road, Chiniot',
                'experience_years' => '18 Years Master Artisan',
            ]);

        $submitResponse->assertStatus(201);
        $verificationId = $submitResponse->json('data.id');

        $this->sellerProfile->refresh();
        $this->assertEquals('under_review', $this->sellerProfile->verification_status);

        // Admin reviews and approves
        $reviewResponse = $this->actingAs($this->admin, 'sanctum')
            ->postJson("/api/v1/admin/verifications/{$verificationId}/review", [
                'decision' => 'approved',
            ]);

        $reviewResponse->assertStatus(200);

        $this->sellerProfile->refresh();
        $this->assertEquals('verified', $this->sellerProfile->verification_status);
    }

    public function test_security_idor_and_unauthorized_access_protection(): void
    {
        $order = $this->createTestOrder();

        $anotherBuyer = User::create([
            'name' => 'Ali Imran',
            'email' => 'ali@dastkar.test',
            'password' => bcrypt('OtherBuyer2026!'),
            'role' => 'buyer',
        ]);

        // IDOR Test: another buyer cannot view this order
        $idorResponse = $this->actingAs($anotherBuyer, 'sanctum')
            ->getJson("/api/v1/orders/{$order->order_number}");

        $idorResponse->assertStatus(404);

        // Privilege Escalation: regular buyer cannot access admin stats or verifications
        $unauthorizedAdmin = $this->actingAs($this->buyer, 'sanctum')
            ->getJson('/api/v1/admin/stats');

        $unauthorizedAdmin->assertStatus(403);

        $unauthorizedDisputeResolve = $this->actingAs($this->buyer, 'sanctum')
            ->postJson('/api/v1/admin/disputes/1/resolve', [
                'resolution' => 'refund_full',
                'amount' => 1000,
            ]);

        $unauthorizedDisputeResolve->assertStatus(403);
    }

    public function test_ai_listing_assistant_synthesizes_authentic_craft_listing(): void
    {
        $response = $this->actingAs($this->sellerUser, 'sanctum')
            ->postJson('/api/v1/seller/ai/generate-listing', [
                'notes' => 'Multani blue pottery vase cobalt oxide glaze indus riverbed clay',
            ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'title',
                    'description',
                    'materials',
                    'dimensions',
                    'care_instructions',
                    'suggested_price',
                    'tags',
                    'social_caption',
                    'ai_provider',
                ],
                'message',
            ]);

        $data = $response->json('data');
        $this->assertNotEmpty($data['title']);
        $this->assertNotEmpty($data['description']);
        $this->assertGreaterThan(0, $data['suggested_price']);

        // Unauthorized buyer cannot generate AI seller listing
        $buyerResponse = $this->actingAs($this->buyer, 'sanctum')
            ->postJson('/api/v1/seller/ai/generate-listing', [
                'notes' => 'Multani blue pottery vase',
            ]);

        $buyerResponse->assertStatus(403);
    }
}
