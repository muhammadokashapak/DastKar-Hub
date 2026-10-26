import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight, ArrowLeft, ShoppingBag, ShieldCheck, Truck, Heart } from 'lucide-react';
import { useCart } from '../lib/cartContext';
import { useWishlist } from '../lib/wishlistContext';
import { getProductImage, handleImageError } from '../lib/craftImages';

export const CartPage: React.FC = () => {
  const { items, updateQuantity, removeFromCart, totalItems, subtotal } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();

  const estimatedShipping = subtotal >= 10000 ? 0 : items.length > 0 ? 250 : 0;
  const grandTotal = subtotal + estimatedShipping;

  const handleMoveToWishlist = (item: (typeof items)[0], idx: number) => {
    if (!isInWishlist(item.product.id)) {
      toggleWishlist(item.product);
    }
    removeFromCart(idx);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto my-16 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#FAF5EE] text-[#C25E34] flex items-center justify-center mx-auto border border-[#EBE5DA]">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-gray-900">Your Craft Bag is Empty</h2>
        <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
          You haven&apos;t added any artisanal creations yet. Discover handcrafted ceramics, textiles, and woodwork directly from makers.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center space-x-2 px-6 py-3 bg-[#C25E34] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#A0441E] transition-colors shadow-xs"
        >
          <span>Discover Artisans</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-6 sm:space-y-8">
      <div>
        <h1 className="font-serif text-xl sm:text-3xl font-bold text-gray-900">
          Your Craft Bag ({totalItems} {totalItems === 1 ? 'item' : 'items'})
        </h1>
        <p className="text-xs text-gray-500 mt-1">Review your handcrafted order before proceeding to secure checkout</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-[#EBE5DA] divide-y divide-gray-100 overflow-hidden shadow-2xs">
          {items.map((item, idx) => {
            const img = getProductImage(item.product);
            const isWish = isInWishlist(item.product.id);
            return (
              <div key={idx} className="p-3.5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
                  <Link to={`/products/${item.product.slug}`} className="shrink-0">
                    <img
                      src={img}
                      alt={item.product.title}
                      onError={(e) => handleImageError(e, item.product.title)}
                      className="w-16 h-16 sm:w-24 sm:h-24 rounded-xl object-cover bg-gray-50 border border-gray-100 shrink-0 hover:opacity-90 transition-opacity"
                    />
                  </Link>
                  <div className="space-y-1 flex-1">
                    <span className="text-[11px] font-semibold text-[#C25E34] block">
                      {item.product.seller?.business_name || 'Independent Maker'}
                    </span>
                    <Link to={`/products/${item.product.slug}`} className="block">
                      <h3 className="font-serif text-sm sm:text-base font-bold text-gray-900 hover:text-[#C25E34] transition-colors line-clamp-1">
                        {item.product.title}
                      </h3>
                    </Link>
                    {item.variant && (
                      <p className="text-xs text-gray-500">Option: {item.variant.name}</p>
                    )}
                    {item.customization && Object.keys(item.customization).length > 0 && (
                      <div className="text-[11px] text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block">
                        Customized: {Object.entries(item.customization).map(([k, v]) => `${k}: ${v}`).join(', ')}
                      </div>
                    )}
                    <div className="text-xs font-bold text-gray-900 font-sans pt-1">
                      PKR {Number(item.unit_price).toLocaleString('en-PK')}
                    </div>
                  </div>
                </div>

                {/* Counter, Subtotal & Actions */}
                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-4 sm:space-x-6 border-t sm:border-t-0 pt-3 sm:pt-0">
                  <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                    <button
                      type="button"
                      onClick={() => updateQuantity(idx, item.quantity - 1)}
                      aria-label={`Decrease quantity of ${item.product.title}`}
                      className="px-2.5 py-1 text-gray-600 hover:text-gray-900 text-xs font-bold"
                    >
                      −
                    </button>
                    <span className="px-2.5 py-1 text-xs font-semibold text-gray-900 min-w-6 text-center">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(idx, item.quantity + 1)}
                      aria-label={`Increase quantity of ${item.product.title}`}
                      className="px-2.5 py-1 text-gray-600 hover:text-gray-900 text-xs font-bold"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-sm font-bold text-gray-900 font-sans min-w-[80px] text-right">
                    Rs. {Number(item.unit_price * item.quantity).toLocaleString('en-PK')}
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => handleMoveToWishlist(item, idx)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isWish ? 'text-red-500 hover:bg-red-50' : 'text-gray-400 hover:text-red-500 hover:bg-gray-50'
                      }`}
                      title={isWish ? "Saved in Wishlist" : "Move to Wishlist"}
                      aria-label="Move item to wishlist"
                    >
                      <Heart className={`w-4 h-4 ${isWish ? 'fill-red-500 text-red-500' : ''}`} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFromCart(idx)}
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                      title="Remove item"
                      aria-label="Remove item from bag"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-[#EBE5DA] space-y-5 shadow-2xs">
          <h2 className="font-serif text-lg font-bold text-gray-900 pb-3 border-b border-gray-100">
            Order Summary
          </h2>

          <div className="space-y-2.5 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Items Subtotal</span>
              <span className="font-semibold text-gray-900">Rs. {Number(subtotal).toLocaleString('en-PK')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center space-x-1">
                <Truck className="w-3.5 h-3.5 text-gray-400" />
                <span>Estimated Courier Delivery</span>
              </span>
              <span className="font-semibold text-gray-900">
                {estimatedShipping === 0 ? (
                  <span className="text-emerald-700 font-bold">FREE</span>
                ) : (
                  `Rs. ${estimatedShipping}`
                )}
              </span>
            </div>
            <p className="text-[10px] text-gray-400 italic">
              * Exact courier quote verified at checkout based on destination city.
            </p>
            {subtotal < 3000 && (
              <p className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-100 leading-normal">
                Tip: Add Rs. {Number(3000 - subtotal).toLocaleString('en-PK')} more to qualify for FREE nationwide shipping!
              </p>
            )}
          </div>

          <div className="border-t border-gray-100 pt-3 flex justify-between items-baseline">
            <span className="font-serif text-base font-bold text-gray-900">Total</span>
            <div className="text-right">
              <span className="text-xs text-[#C25E34] font-semibold mr-1">Rs.</span>
              <span className="text-2xl font-bold font-sans text-[#C25E34]">
                {Number(grandTotal).toLocaleString('en-PK')}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/checkout')}
            className="w-full py-3.5 px-4 bg-[#C25E34] hover:bg-[#A0441E] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors shadow-xs flex items-center justify-center space-x-2"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <Link
            to="/products"
            className="flex items-center justify-center space-x-1.5 text-center text-xs font-semibold text-gray-500 hover:text-gray-800 hover:underline pt-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Exploring Crafts</span>
          </Link>

          <div className="pt-4 border-t border-gray-100 space-y-2 text-[11px] text-gray-500">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Safe Payments: COD, JazzCash, EasyPaisa &amp; Cards</span>
            </div>
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4 text-sky-600 shrink-0" />
              <span>Dispatched via verified courier with tracking</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
