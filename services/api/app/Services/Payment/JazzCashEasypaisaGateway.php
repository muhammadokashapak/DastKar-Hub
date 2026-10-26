<?php

namespace App\Services\Payment;

use App\Models\Order;
use App\Models\Payment;

class JazzCashEasypaisaGateway implements PaymentGatewayInterface
{
    protected string $merchantId;
    protected string $password;
    protected string $integritySalt;

    public function __construct()
    {
        $this->merchantId = config('services.jazzcash.merchant_id', 'MC12345_TEST');
        $this->password = config('services.jazzcash.password', 'test_pass_sec');
        $this->integritySalt = config('services.jazzcash.integrity_salt', 'salt_key_dastkar_secure_2026');
    }

    public function createPayment(Order $order, array $params = []): array
    {
        $txnRef = 'TXN-' . date('YmdHis') . '-' . rand(100, 999);
        $amountFormatted = number_format($order->total_amount, 2, '.', '');

        // Generate HMAC signature for digital wallet security
        $rawSignatureString = "{$this->integritySalt}&{$amountFormatted}&{$order->order_number}&{$txnRef}&{$this->merchantId}";
        $checksum = hash_hmac('sha256', $rawSignatureString, $this->integritySalt);

        return [
            'status' => 'pending',
            'provider' => 'jazzcash_easypaisa',
            'provider_reference' => $txnRef,
            'amount' => (float) $amountFormatted,
            'currency' => 'PKR',
            'redirect_url' => "https://sandbox.jazzcash.com.pk/CustomerPortal/transactionPage?pp_TxnRefNo={$txnRef}",
            'metadata' => [
                'merchant_id' => $this->merchantId,
                'checksum' => $checksum,
                'channel' => $params['channel'] ?? 'MWALLET',
            ],
        ];
    }

    public function verifyPayment(string $reference, array $payload = []): array
    {
        $responseCode = $payload['pp_ResponseCode'] ?? '000';
        $isPaid = ($responseCode === '000' || ($payload['status'] ?? '') === 'paid');

        return [
            'is_paid' => $isPaid,
            'status' => $isPaid ? 'paid' : 'failed',
            'provider_reference' => $reference,
            'message' => $isPaid ? 'Payment successful' : 'Transaction failed or cancelled by user',
        ];
    }

    public function refundPayment(Payment $payment, float $amount, string $reason = ''): array
    {
        $refundTxn = 'REF-JC-' . strtoupper(substr(uniqid(), -8));

        return [
            'success' => true,
            'refund_reference' => $refundTxn,
            'amount' => $amount,
            'status' => 'completed',
        ];
    }

    public function parseWebhook(array $payload, string $signature = ''): array
    {
        // Validate webhook signature against integrity salt
        $txnRef = $payload['pp_TxnRefNo'] ?? $payload['provider_reference'] ?? '';
        $amount = $payload['pp_Amount'] ?? '';
        $orderNumber = $payload['pp_BillReference'] ?? $payload['order_number'] ?? '';

        $calculatedHash = hash_hmac('sha256', "{$this->integritySalt}&{$amount}&{$orderNumber}&{$txnRef}&{$this->merchantId}", $this->integritySalt);

        $isTestMode = ($payload['test_mode'] ?? false) && app()->environment('local', 'testing');
        $isValid = $isTestMode || (!empty($signature) && hash_equals($calculatedHash, $signature));

        return [
            'valid' => $isValid,
            'order_reference' => $orderNumber,
            'provider_reference' => $txnRef,
            'is_paid' => ($payload['pp_ResponseCode'] ?? '') === '000' || ($payload['status'] ?? '') === 'paid',
            'status' => (($payload['pp_ResponseCode'] ?? '') === '000' || ($payload['status'] ?? '') === 'paid') ? 'paid' : 'failed',
        ];
    }
}
