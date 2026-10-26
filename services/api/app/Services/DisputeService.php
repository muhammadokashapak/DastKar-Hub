<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\Dispute;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class DisputeService
{
    protected PaymentService $paymentService;
    protected PayoutService $payoutService;

    public function __construct(PaymentService $paymentService, PayoutService $payoutService)
    {
        $this->paymentService = $paymentService;
        $this->payoutService = $payoutService;
    }

    /**
     * Create dispute on an order.
     */
    public function createDispute(User $buyer, Order $order, array $data): Dispute
    {
        if ($order->buyer_id !== $buyer->id) {
            throw ValidationException::withMessages(['order' => 'You can only raise disputes on your own orders.']);
        }

        if (!in_array($order->status, ['shipped', 'delivered', 'confirmed'])) {
            throw ValidationException::withMessages(['order' => 'Disputes can only be raised for confirmed, shipped or delivered orders.']);
        }

        // Attribute dispute to specific order item's artisan seller if specified
        $sellerId = null;
        if (!empty($data['order_item_id'])) {
            $item = $order->items()->where('id', $data['order_item_id'])->first();
            if ($item) {
                $sellerId = $item->seller_id ?? $item->product?->seller_id;
            }
        }
        if (!$sellerId) {
            $firstItem = $order->items()->first();
            $sellerId = $firstItem?->seller_id ?? $firstItem?->product?->seller_id ?? 1;
        }

        return DB::transaction(function () use ($buyer, $order, $sellerId, $data) {
            $dispute = Dispute::create([
                'order_id' => $order->id,
                'buyer_id' => $buyer->id,
                'seller_id' => $sellerId,
                'reason' => $data['reason'],
                'description' => $data['description'],
                'evidence_images_json' => $data['evidence_images'] ?? [],
                'status' => 'opened',
            ]);

            $order->update(['status' => 'disputed']);

            // Notify seller
            $seller = $dispute->seller?->user;
            if ($seller) {
                NotificationService::send(
                    $seller->id,
                    'dispute_opened',
                    'Dispute Raised by Buyer',
                    "Buyer has raised a dispute regarding order #{$order->order_number}: '{$data['reason']}'.",
                    "/seller/disputes",
                    ['dispute_id' => $dispute->id]
                );
            }

            AuditLog::create([
                'user_id' => $buyer->id,
                'action' => 'dispute.opened',
                'entity_type' => 'Dispute',
                'entity_id' => $dispute->id,
                'changes_json' => [
                    'order_id' => $order->id,
                    'reason' => $data['reason'],
                ],
            ]);

            return $dispute;
        });
    }

    /**
     * Resolve dispute (admin action).
     */
    public function resolveDispute(Dispute $dispute, string $resolution, float $amount, ?string $adminNotes, User $admin): Dispute
    {
        return DB::transaction(function () use ($dispute, $resolution, $amount, $adminNotes, $admin) {
            $dispute->update([
                'status' => in_array($resolution, ['refund_full', 'refund_partial']) ? 'resolved' : 'rejected',
                'resolution' => $resolution,
                'resolution_amount' => $amount,
                'admin_notes' => $adminNotes,
                'resolved_by' => $admin->id,
                'resolved_at' => now(),
            ]);

            if (in_array($resolution, ['refund_full', 'refund_partial']) && $amount > 0) {
                $order = $dispute->order;
                $refund = $this->paymentService->processRefund(
                    $order,
                    $amount,
                    "Dispute resolution: {$resolution}. Notes: {$adminNotes}",
                    $dispute->id
                );

                // Deduct from seller ledger
                $this->payoutService->deductRefund($refund, $dispute->seller_id);
            }

            // Notify buyer
            NotificationService::send(
                $dispute->buyer_id,
                'dispute_resolved',
                'Dispute Outcome',
                "Your dispute for order #{$dispute->order->order_number} has been resolved: {$resolution}.",
                "/account/orders/{$dispute->order->order_number}",
                ['dispute_id' => $dispute->id, 'resolution' => $resolution]
            );

            AuditLog::create([
                'user_id' => $admin->id,
                'action' => 'dispute.resolved',
                'entity_type' => 'Dispute',
                'entity_id' => $dispute->id,
                'changes_json' => [
                    'resolution' => $resolution,
                    'amount' => $amount,
                    'notes' => $adminNotes,
                ],
            ]);

            return $dispute;
        });
    }
}
