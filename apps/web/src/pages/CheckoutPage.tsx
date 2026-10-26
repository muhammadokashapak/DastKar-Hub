import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  CreditCard,
  Banknote,
  Smartphone,
  Building,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { useCart } from '../lib/cartContext';
import { useAuth } from '../lib/authContext';
import { api } from '../lib/api';
import { Order } from '../types';
import { getProductImage, handleImageError } from '../lib/craftImages';

const PAKISTAN_CITIES = [
  'Karachi',
  'Lahore',
  'Islamabad',
  'Rawalpindi',
  'Multan',
  'Faisalabad',
  'Peshawar',
  'Quetta',
  'Sialkot',
  'Gujranwala',
  'Hyderabad',
  'Bahawalpur',
  'Sargodha',
  'Sukkur',
  'Chiniot',
  'Abbottabad',
  'Mardan',
  'Swat',
  'Gilgit',
  'Skardu',
  'Mirpur (AJK)',
  'Muzaffarabad',
  'Hala',
  'Kashmore',
  'Dera Ghazi Khan',
  'Gujrat',
  'Other City',
];

export const CheckoutPage: React.FC = () => {
  const { items, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'jazzcash' | 'easypaisa' | 'card' | 'bank_transfer'>('cod');

  const [address, setAddress] = useState({
    full_name: user?.name || '',
    phone: user?.phone || '',
    address_line1: '',
    address_line2: '',
    city: 'Karachi',
    postal_code: '',
  });

  const [customCity, setCustomCity] = useState('');
  const [notes, setNotes] = useState('');
  const [quote, setQuote] = useState<any>(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch quote
  const fetchQuote = useCallback(() => {
    if (items.length === 0 && !completedOrder) {
      navigate('/cart');
      return;
    }

    setLoadingQuote(true);
    setQuoteError(null);
    const quotePayload = {
      items: items.map((i) => ({
        product_id: i.product.id,
        variant_id: i.variant?.id ?? null,
        quantity: i.quantity,
        customization: i.customization || null,
      })),
      shipping_method: shippingMethod,
    };

    api.getQuote(quotePayload)
      .then((res) => {
        setQuote(res.data);
      })
      .catch((err) => {
        setQuoteError(err.message || 'Failed to calculate courier quote');
      })
      .finally(() => {
        setLoadingQuote(false);
      });
  }, [items, shippingMethod, completedOrder, navigate]);

  useEffect(() => {
    fetchQuote();
  }, [fetchQuote]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!user) {
      navigate('/auth?redirect=/checkout');
      return;
    }

    const effectiveCity = address.city === 'Other City' ? customCity.trim() : address.city;
    if (!address.full_name || !address.phone || !address.address_line1 || !effectiveCity) {
      setErrorMsg('Please complete all required shipping address fields.');
      return;
    }

    setSubmitting(true);
    try {
      const orderPayload = {
        items: items.map((i) => ({
          product_id: i.product.id,
          variant_id: i.variant?.id ?? null,
          quantity: i.quantity,
          customization: i.customization || null,
        })),
        shipping_method: shippingMethod,
        payment_method: paymentMethod,
        shipping_address: {
          ...address,
          city: effectiveCity,
        },
        notes,
      };

      const res = await api.placeOrder(orderPayload);
      setCompletedOrder(res.data);
      clearCart();
    } catch (err: any) {
      setErrorMsg(err.message || 'Order processing failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (completedOrder) {
    return (
      <div className="max-w-2xl mx-auto my-12 px-4 space-y-6">
        <div className="bg-white rounded-2xl border border-[#EBE5DA] p-8 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
            Order Confirmed &amp; Sent to Artisans
          </span>
          <h1 className="font-serif text-3xl font-bold text-gray-900">
            Shukriya for Supporting Pakistani Crafts!
          </h1>
          <p className="text-xs text-gray-600 max-w-md mx-auto leading-relaxed">
            Your handcrafted order has been assigned to the makers. You will receive SMS &amp; courier tracking updates as each piece is prepared.
          </p>

          <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#EBE5DA] text-xs text-left space-y-2 max-w-md mx-auto">
            <div className="flex justify-between">
              <span className="text-gray-500">Order Number:</span>
              <span className="font-mono font-bold text-gray-900">{completedOrder.order_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total Amount:</span>
              <span className="font-bold text-gray-900 font-sans">
                PKR {Number(completedOrder.total_amount).toLocaleString('en-PK')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Payment Method:</span>
              <span className="uppercase font-semibold text-amber-800">{completedOrder.payment_method.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Destination:</span>
              <span className="text-gray-800">{completedOrder.shipping_address_snapshot?.city}, Pakistan</span>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/account/orders"
              className="w-full sm:w-auto px-6 py-2.5 bg-[#C25E34] text-white text-xs font-semibold rounded-xl hover:bg-[#A0441E] transition-colors shadow-2xs"
            >
              View Order Tracking
            </Link>
            <Link
              to="/products"
              className="w-full sm:w-auto px-6 py-2.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-200 transition-colors"
            >
              Continue Exploring
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-5 sm:space-y-6">
      {/* Checkout Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-3 sm:pb-4">
        <div>
          <h1 className="font-serif text-xl sm:text-3xl font-bold text-gray-900">
            Secure Artisan Checkout
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">Direct from makers across Pakistan to your doorstep</p>
        </div>
        <div className="flex items-center space-x-1.5 text-xs text-emerald-800 bg-emerald-50 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-emerald-200 font-medium">
          <Lock className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">256-bit Encrypted</span>
        </div>
      </div>

      {/* Guest / Auth Explanation Banner if not logged in */}
      {!user && (
        <div className="p-3.5 sm:p-5 bg-amber-50/90 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-start space-x-3 sm:space-x-3.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-[#C25E34] flex items-center justify-center shrink-0 mt-0.5">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">
                Account Required for Artisan Protection &amp; Tracking
              </h3>
              <p className="text-xs text-gray-600 mt-0.5 leading-relaxed max-w-xl">
                Because each item is handmade directly by independent Pakistani artisans, having an account ensures direct courier tracking, order provenance, and artisan dispute protection.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 shrink-0 w-full sm:w-auto">
            <Link
              to="/auth?mode=login&redirect=/checkout"
              className="flex-1 sm:flex-initial px-4 py-2 bg-white border border-[#E5E0D5] text-gray-800 font-semibold text-xs rounded-xl hover:bg-gray-50 transition-colors text-center"
            >
              Sign In
            </Link>
            <Link
              to="/auth?mode=register&redirect=/checkout"
              className="flex-1 sm:flex-initial px-4 py-2 bg-[#C25E34] text-white font-semibold text-xs rounded-xl hover:bg-[#A0441E] transition-colors text-center shadow-2xs"
            >
              Create Account
            </Link>
          </div>
        </div>
      )}

      {errorMsg && (
        <div role="alert" className="p-4 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-start">
        {/* Left: Step 1 Address + Step 2 Shipping + Step 3 Payment */}
        <div className="lg:col-span-8 space-y-4 sm:space-y-6">
          {/* Step 1: Shipping Address */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#EBE5DA] space-y-4">
            <div className="flex items-center space-x-2 font-serif text-base font-bold text-gray-900">
              <span className="w-6 h-6 rounded-full bg-[#C25E34] text-white flex items-center justify-center text-xs font-bold font-sans">
                1
              </span>
              <span>Shipping Address</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label htmlFor="address-name" className="font-medium text-gray-700 block">
                  Full Name *
                </label>
                <input
                  id="address-name"
                  type="text"
                  required
                  value={address.full_name}
                  onChange={(e) => setAddress({ ...address, full_name: e.target.value })}
                  placeholder="e.g. Ayesha Siddiqui"
                  className="w-full p-2.5 bg-[#FAF8F5] border border-[#E5E0D5] rounded-xl focus:outline-hidden focus:ring-1 focus:ring-[#C25E34]"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="address-phone" className="font-medium text-gray-700 block">
                  Phone Number (for Courier Delivery) *
                </label>
                <input
                  id="address-phone"
                  type="tel"
                  required
                  value={address.phone}
                  onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                  placeholder="e.g. +92 301 4443322"
                  className="w-full p-2.5 bg-[#FAF8F5] border border-[#E5E0D5] rounded-xl focus:outline-hidden focus:ring-1 focus:ring-[#C25E34]"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label htmlFor="address-line1" className="font-medium text-gray-700 block">
                  Street Address / House No / Area *
                </label>
                <input
                  id="address-line1"
                  type="text"
                  required
                  value={address.address_line1}
                  onChange={(e) => setAddress({ ...address, address_line1: e.target.value })}
                  placeholder="e.g. House 42-B, Street 7, Clifton Block 4"
                  className="w-full p-2.5 bg-[#FAF8F5] border border-[#E5E0D5] rounded-xl focus:outline-hidden focus:ring-1 focus:ring-[#C25E34]"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="address-city" className="font-medium text-gray-700 block">
                  City *
                </label>
                <select
                  id="address-city"
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  className="w-full p-2.5 bg-[#FAF8F5] border border-[#E5E0D5] rounded-xl focus:outline-hidden focus:ring-1 focus:ring-[#C25E34]"
                >
                  {PAKISTAN_CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {address.city === 'Other City' && (
                  <input
                    type="text"
                    required
                    placeholder="Enter your city name"
                    value={customCity}
                    onChange={(e) => setCustomCity(e.target.value)}
                    className="w-full mt-2 p-2.5 bg-white border border-[#E5E0D5] rounded-xl focus:outline-hidden focus:ring-1 focus:ring-[#C25E34]"
                  />
                )}
              </div>

              <div className="space-y-1">
                <label htmlFor="address-postal" className="font-medium text-gray-700 block">
                  Postal Code (Optional)
                </label>
                <input
                  id="address-postal"
                  type="text"
                  value={address.postal_code}
                  onChange={(e) => setAddress({ ...address, postal_code: e.target.value })}
                  placeholder="e.g. 75600"
                  className="w-full p-2.5 bg-[#FAF8F5] border border-[#E5E0D5] rounded-xl focus:outline-hidden focus:ring-1 focus:ring-[#C25E34]"
                />
              </div>

              <div className="sm:col-span-2 space-y-1 pt-1">
                <label htmlFor="order-notes" className="font-medium text-gray-700 block">
                  Order Notes / Delivery Instructions for Artisan (Optional)
                </label>
                <textarea
                  id="order-notes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Leave with security guard, fragile ceramic handling request..."
                  className="w-full p-2.5 bg-[#FAF8F5] border border-[#E5E0D5] rounded-xl focus:outline-hidden focus:ring-1 focus:ring-[#C25E34]"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Shipping Method */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#EBE5DA] space-y-4">
            <div className="flex items-center space-x-2 font-serif text-base font-bold text-gray-900">
              <span className="w-6 h-6 rounded-full bg-[#C25E34] text-white flex items-center justify-center text-xs font-bold font-sans">
                2
              </span>
              <span>Delivery Method</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label
                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start space-x-3 ${
                  shippingMethod === 'standard'
                    ? 'border-[#C25E34] bg-amber-50/50 ring-1 ring-[#C25E34]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="shipping_method"
                  checked={shippingMethod === 'standard'}
                  onChange={() => setShippingMethod('standard')}
                  className="mt-0.5 text-[#C25E34] accent-[#C25E34]"
                />
                <div>
                  <div className="font-semibold text-gray-900">Standard Courier (3–5 Days)</div>
                  <div className="text-gray-500 mt-0.5">Nationwide delivery with tracking</div>
                  <div className="text-[#C25E34] font-bold mt-1">
                    {quote?.shipping_fee === 0 ? 'FREE' : 'PKR 250'}
                  </div>
                </div>
              </label>

              <label
                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start space-x-3 ${
                  shippingMethod === 'express'
                    ? 'border-[#C25E34] bg-amber-50/50 ring-1 ring-[#C25E34]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="shipping_method"
                  checked={shippingMethod === 'express'}
                  onChange={() => setShippingMethod('express')}
                  className="mt-0.5 text-[#C25E34] accent-[#C25E34]"
                />
                <div>
                  <div className="font-semibold text-gray-900">Priority Express (1–2 Days)</div>
                  <div className="text-gray-500 mt-0.5">Expedited courier dispatch</div>
                  <div className="text-[#C25E34] font-bold mt-1">PKR 450</div>
                </div>
              </label>
            </div>
          </div>

          {/* Step 3: Payment Method */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#EBE5DA] space-y-4">
            <div className="flex items-center space-x-2 font-serif text-base font-bold text-gray-900">
              <span className="w-6 h-6 rounded-full bg-[#C25E34] text-white flex items-center justify-center text-xs font-bold font-sans">
                3
              </span>
              <span>Payment Option</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center space-x-3 ${
                  paymentMethod === 'cod'
                    ? 'border-[#C25E34] bg-amber-50/50 ring-1 ring-[#C25E34]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment_method"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="text-[#C25E34] accent-[#C25E34]"
                />
                <Banknote className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-semibold text-gray-900 block">Cash on Delivery (COD)</span>
                  <span className="text-[11px] text-gray-500">Pay cash when courier delivers</span>
                </div>
              </label>

              <label
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center space-x-3 ${
                  paymentMethod === 'jazzcash'
                    ? 'border-[#C25E34] bg-amber-50/50 ring-1 ring-[#C25E34]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment_method"
                  checked={paymentMethod === 'jazzcash'}
                  onChange={() => setPaymentMethod('jazzcash')}
                  className="text-[#C25E34] accent-[#C25E34]"
                />
                <Smartphone className="w-4 h-4 text-red-600 shrink-0" />
                <div>
                  <span className="font-semibold text-gray-900 block">JazzCash Mobile Wallet</span>
                  <span className="text-[11px] text-gray-500">Pay via JazzCash mobile account</span>
                </div>
              </label>

              <label
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center space-x-3 ${
                  paymentMethod === 'easypaisa'
                    ? 'border-[#C25E34] bg-amber-50/50 ring-1 ring-[#C25E34]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment_method"
                  checked={paymentMethod === 'easypaisa'}
                  onChange={() => setPaymentMethod('easypaisa')}
                  className="text-[#C25E34] accent-[#C25E34]"
                />
                <Smartphone className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-semibold text-gray-900 block">Easypaisa Mobile Wallet</span>
                  <span className="text-[11px] text-gray-500">Pay via Telenor Easypaisa account</span>
                </div>
              </label>

              <label
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center space-x-3 ${
                  paymentMethod === 'card'
                    ? 'border-[#C25E34] bg-amber-50/50 ring-1 ring-[#C25E34]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment_method"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                  className="text-[#C25E34] accent-[#C25E34]"
                />
                <CreditCard className="w-4 h-4 text-sky-600 shrink-0" />
                <div>
                  <span className="font-semibold text-gray-900 block">Debit / Credit Card</span>
                  <span className="text-[11px] text-gray-500">Visa, Mastercard &amp; PayPak</span>
                </div>
              </label>

              <label
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center space-x-3 ${
                  paymentMethod === 'bank_transfer'
                    ? 'border-[#C25E34] bg-amber-50/50 ring-1 ring-[#C25E34]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment_method"
                  checked={paymentMethod === 'bank_transfer'}
                  onChange={() => setPaymentMethod('bank_transfer')}
                  className="text-[#C25E34] accent-[#C25E34]"
                />
                <Building className="w-4 h-4 text-purple-600 shrink-0" />
                <div>
                  <span className="font-semibold text-gray-900 block">Bank Transfer / Raast</span>
                  <span className="text-[11px] text-gray-500">Direct IBFT account payment</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right: Authoritative Order Review Sidebar */}
        <div className="lg:col-span-4 bg-white p-4 sm:p-6 rounded-2xl border border-[#EBE5DA] space-y-5 shadow-2xs">
          <h2 className="font-serif text-lg font-bold text-gray-900 pb-3 border-b border-gray-100">
            Order Review
          </h2>

          <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto pr-1">
            {items.map((item, idx) => (
              <div key={idx} className="py-2.5 flex items-center space-x-3 text-xs">
                <img
                  src={getProductImage(item.product)}
                  alt={item.product.title}
                  onError={(e) => handleImageError(e, item.product.title)}
                  className="w-12 h-12 rounded-lg object-cover bg-gray-50 border border-gray-100 shrink-0"
                />
                <div className="flex-1 truncate">
                  <p className="font-semibold text-gray-900 truncate">{item.product.title}</p>
                  <p className="text-gray-400 text-[11px]">Qty: {item.quantity}</p>
                </div>
                <div className="font-bold text-gray-900 font-sans">
                  PKR {Number(item.unit_price * item.quantity).toLocaleString('en-PK')}
                </div>
              </div>
            ))}
          </div>

          {quoteError && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center justify-between">
              <span>{quoteError}</span>
              <button
                type="button"
                onClick={fetchQuote}
                className="underline font-semibold ml-2 text-red-800 hover:text-red-900 cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          <div className="border-t border-gray-100 pt-3 space-y-2 text-xs text-gray-600">
            <div className="flex justify-between items-center">
              <span>Subtotal</span>
              {loadingQuote ? (
                <div className="w-20 h-4 skeleton-shimmer rounded" />
              ) : (
                <span className="font-semibold text-gray-900">
                  PKR {quote ? Number(quote.subtotal).toLocaleString('en-PK') : Number(items.reduce((acc, i) => acc + i.unit_price * i.quantity, 0)).toLocaleString('en-PK')}
                </span>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span>Courier Shipping</span>
              {loadingQuote ? (
                <div className="w-16 h-4 skeleton-shimmer rounded" />
              ) : (
                <span className="font-semibold text-gray-900">
                  {quote?.shipping_fee === 0 ? (
                    <span className="text-emerald-700 font-bold">FREE</span>
                  ) : (
                    `PKR ${quote?.shipping_fee || 250}`
                  )}
                </span>
              )}
            </div>
            <div className="border-t border-gray-100 pt-2 flex justify-between items-baseline">
              <span className="font-serif text-base font-bold text-gray-900">Final Total</span>
              {loadingQuote ? (
                <div className="w-28 h-7 skeleton-shimmer rounded" />
              ) : (
                <span className="text-2xl font-bold font-sans text-gray-900">
                  PKR {quote ? Number(quote.total_amount).toLocaleString('en-PK') : Number(items.reduce((acc, i) => acc + i.unit_price * i.quantity, 0) + (shippingMethod === 'express' ? 450 : 250)).toLocaleString('en-PK')}
                </span>
              )}
            </div>
          </div>

          {!user ? (
            <div className="space-y-2 pt-1">
              <p className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                Please sign in to place your artisan order. Your address and bag will be kept intact.
              </p>
              <Link
                to="/auth?redirect=/checkout"
                className="w-full py-3 bg-[#C25E34] hover:bg-[#A0441E] text-white text-xs font-bold uppercase tracking-wider rounded-xl block text-center shadow-xs transition-colors"
              >
                Sign In to Place Order
              </Link>
            </div>
          ) : (
            <button
              type="submit"
              disabled={submitting || loadingQuote}
              className="w-full py-3.5 px-4 bg-[#C25E34] hover:bg-[#A0441E] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors shadow-xs disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <span>{submitting ? 'Confirming Order...' : 'Confirm & Place Order'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <div className="pt-2 text-[11px] text-gray-400 text-center space-y-1">
            <div className="flex items-center justify-center space-x-1.5 text-emerald-800 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Direct maker payout protected by DastKar Escrow</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
