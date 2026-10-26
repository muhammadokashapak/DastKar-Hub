import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Package, Heart, Award, Star, ShoppingBag, Trash2 } from 'lucide-react';
import { useAuth } from '../lib/authContext';
import { useCart } from '../lib/cartContext';
import { useWishlist } from '../lib/wishlistContext';
import { api } from '../lib/api';
import { Order, Product } from '../types';
import { getProductImage, handleImageError, getFallbackForTitle } from '../lib/craftImages';

export const CustomerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { wishlist, removeFromWishlist, wishlistCount } = useWishlist();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist'>(
    tabParam === 'wishlist' ? 'wishlist' : 'orders'
  );

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewStatus, setReviewStatus] = useState('');
  const [movedMessage, setMovedMessage] = useState<string | null>(null);

  useEffect(() => {
    if (tabParam === 'wishlist') {
      setActiveTab('wishlist');
    } else if (tabParam === 'orders') {
      setActiveTab('orders');
    }
  }, [tabParam]);

  const handleTabChange = (tab: 'orders' | 'wishlist') => {
    setActiveTab(tab);
    setSearchParams({ tab });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    api.getOrders()
      .then((res) => {
        setOrders(res.data || []);
      })
      .catch((err) => {
        console.error('Failed to load orders', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleMoveToCart = (product: Product) => {
    addToCart(product, 1);
    removeFromWishlist(product.id);
    setMovedMessage(`"${product.title}" moved to your shopping bag!`);
    setTimeout(() => setMovedMessage(null), 3500);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewOrder || !reviewOrder.items?.[0]?.product_id) return;
    try {
      await api.submitReview(reviewOrder.order_number, {
        product_id: reviewOrder.items[0].product_id,
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviewStatus('Review submitted successfully! Shukriya for supporting Pakistani artisans.');
      setTimeout(() => {
        setReviewOrder(null);
        setReviewStatus('');
      }, 2000);
    } catch (err: any) {
      setReviewStatus(err.message || 'Failed to submit review');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-5 sm:space-y-8">
      {/* Welcome Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#EBE5DA] flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 shadow-2xs">
        <div>
          <h1 className="font-serif text-xl sm:text-2xl font-bold text-gray-900">
            Welcome back, {user?.name || 'Patron'}!
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Track your artisan craft orders, manage saved pieces, and view patron rewards
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <span className="px-2.5 sm:px-3 py-1 rounded-full bg-amber-50 text-[#C25E34] border border-amber-200 font-semibold truncate max-w-xs">
            Patron Account: {user?.email || 'Guest Patron'}
          </span>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => handleTabChange('orders')}
          className={`text-left bg-white p-5 rounded-2xl border transition-all flex items-center space-x-4 shadow-2xs ${
            activeTab === 'orders' ? 'border-[#C25E34] ring-2 ring-[#C25E34]/10' : 'border-[#EBE5DA] hover:border-gray-300'
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#C25E34] flex items-center justify-center shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold font-serif text-gray-900">{orders.length}</div>
            <div className="text-xs text-gray-500">Total Craft Orders</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('wishlist')}
          className={`text-left bg-white p-5 rounded-2xl border transition-all flex items-center space-x-4 shadow-2xs ${
            activeTab === 'wishlist' ? 'border-[#C25E34] ring-2 ring-[#C25E34]/10' : 'border-[#EBE5DA] hover:border-gray-300'
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <Heart className="w-6 h-6 fill-rose-500" />
          </div>
          <div>
            <div className="text-2xl font-bold font-serif text-gray-900">{wishlistCount}</div>
            <div className="text-xs text-gray-500">Wishlist Pieces</div>
          </div>
        </button>

        <div className="bg-white p-5 rounded-2xl border border-[#EBE5DA] flex items-center space-x-4 shadow-2xs">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold font-serif text-gray-900">240</div>
            <div className="text-xs text-gray-500">Patron Points</div>
          </div>
        </div>
      </div>

      {/* Notification banner if item moved */}
      {movedMessage && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center justify-between animate-in fade-in">
          <span>{movedMessage}</span>
          <Link to="/cart" className="font-bold underline ml-2 hover:text-emerald-950">
            View Bag →
          </Link>
        </div>
      )}

      {/* Tab Navigation */}
      <div role="tablist" aria-label="Customer Account Tabs" className="flex items-center space-x-2 border-b border-[#EBE5DA] pb-2">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'orders'}
          onClick={() => handleTabChange('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-[#C25E34] text-white shadow-2xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          My Orders ({orders.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'wishlist'}
          onClick={() => handleTabChange('wishlist')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
            activeTab === 'wishlist'
              ? 'bg-[#C25E34] text-white shadow-2xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          <span>Saved Wishlist ({wishlistCount})</span>
        </button>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'orders' ? (
        <div className="bg-white rounded-2xl border border-[#EBE5DA] overflow-hidden shadow-2xs">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-gray-900">Recent Orders</h2>
            <span className="text-xs text-gray-500">{orders.length} orders recorded</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-gray-400">Loading orders...</div>
          ) : orders.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {orders.map((ord) => (
                <div key={ord.id} className="p-5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center space-x-3">
                      <span className="font-mono font-bold text-gray-900">{ord.order_number}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-500">{new Date(ord.placed_at || ord.created_at).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className={`px-2.5 py-0.5 rounded-full font-semibold capitalize text-[11px] ${
                        ord.status === 'delivered'
                          ? 'bg-emerald-50 text-emerald-800'
                          : ord.status === 'shipped'
                          ? 'bg-sky-50 text-sky-800'
                          : 'bg-amber-50 text-amber-800'
                      }`}>
                        {ord.status.replace('_', ' ')}
                      </span>
                      <span className="font-bold text-gray-900 font-sans">
                        PKR {Number(ord.total_amount).toLocaleString('en-PK')}
                      </span>
                    </div>
                  </div>

                  {/* Items preview in order */}
                  <div className="space-y-2 pt-1">
                    {ord.items?.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-xs bg-[#FAF8F5] p-2.5 rounded-xl border border-[#EBE5DA]">
                        <div className="flex items-center space-x-3">
                          <img
                            src={item.product_image || getFallbackForTitle(item.product_title)}
                            alt={item.product_title}
                            onError={(e) => handleImageError(e, item.product_title)}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-semibold text-gray-900">{item.product_title}</p>
                            <p className="text-[11px] text-gray-500">Maker: {item.seller?.business_name || 'Artisan'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-sans font-bold text-gray-800">
                            PKR {Number(item.subtotal).toLocaleString('en-PK')}
                          </span>
                          <span className="text-[11px] text-gray-400 block">Qty: {item.quantity}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end space-x-3 pt-1">
                    {ord.status === 'delivered' && (
                      <button
                        type="button"
                        onClick={() => setReviewOrder(ord)}
                        className="px-3 py-1.5 bg-amber-50 text-[#C25E34] border border-amber-200 text-xs font-semibold rounded-lg hover:bg-amber-100 transition-colors flex items-center space-x-1"
                      >
                        <Star className="w-3.5 h-3.5" />
                        <span>Review Artisan</span>
                      </button>
                    )}
                    <span className="text-xs text-gray-400">
                      Payment: <span className="uppercase text-gray-600 font-medium">{ord.payment_method}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center space-y-3">
              <Package className="w-10 h-10 text-gray-300 mx-auto" />
              <p className="text-sm font-serif font-bold text-gray-800">No Orders Placed Yet</p>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                When you purchase handmade crafts directly from our Pakistani artisans, your order tracking will appear here.
              </p>
              <Link
                to="/products"
                className="inline-block px-4 py-2 bg-[#C25E34] text-white text-xs font-semibold rounded-lg hover:bg-[#A0441E] transition-colors"
              >
                Explore Authentic Crafts
              </Link>
            </div>
          )}
        </div>
      ) : (
        /* Saved Wishlist Tab */
        <div className="bg-white rounded-2xl border border-[#EBE5DA] overflow-hidden shadow-2xs">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-bold text-gray-900">Your Saved Crafts</h2>
              <p className="text-xs text-gray-500">Heirloom pieces and handicrafts you bookmarked for later</p>
            </div>
            <span className="text-xs font-medium text-gray-500">{wishlist.length} crafts saved</span>
          </div>

          {wishlist.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {wishlist.map((craft) => {
                const img = getProductImage(craft);
                const isOutOfStock = craft.stock_quantity !== undefined && craft.stock_quantity <= 0;

                return (
                  <div key={craft.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <Link to={`/products/${craft.slug}`} className="shrink-0">
                        <img
                          src={img}
                          alt={craft.title}
                          onError={(e) => handleImageError(e, craft.title)}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-[#EBE5DA] hover:opacity-90 transition-opacity"
                        />
                      </Link>
                      <div className="space-y-1">
                        <span className="text-[11px] font-semibold text-[#C25E34] block">
                          By {craft.seller?.business_name || 'Independent Maker'}
                        </span>
                        <Link to={`/products/${craft.slug}`} className="block">
                          <h3 className="font-serif text-base font-bold text-gray-900 hover:text-[#C25E34] transition-colors">
                            {craft.title}
                          </h3>
                        </Link>
                        <div className="flex items-center space-x-3 text-xs">
                          <span className="font-bold text-gray-900">
                            PKR {Number(craft.base_price).toLocaleString('en-PK')}
                          </span>
                          {isOutOfStock ? (
                            <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">
                              Out of Stock
                            </span>
                          ) : (
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-medium">
                              In Stock
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0">
                      {!isOutOfStock && (
                        <button
                          type="button"
                          onClick={() => handleMoveToCart(craft)}
                          className="px-4 py-2 bg-[#C25E34] hover:bg-[#A0441E] text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-colors shadow-2xs"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Move to Bag</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeFromWishlist(craft.id)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                        title="Remove from saved crafts"
                        aria-label={`Remove ${craft.title} from wishlist`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center space-y-3">
              <Heart className="w-10 h-10 text-gray-300 mx-auto" />
              <p className="text-sm font-serif font-bold text-gray-800">Your Wishlist is Empty</p>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Explore handloom textiles, pottery, camel bone inlay and brassware, and bookmark your favorites here.
              </p>
              <Link
                to="/products"
                className="inline-block px-4 py-2 bg-[#C25E34] text-white text-xs font-semibold rounded-lg hover:bg-[#A0441E] transition-colors"
              >
                Browse Artisan Crafts
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Review Modal */}
      {reviewOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-serif text-lg font-bold text-gray-900">
              Review Artisan Craft ({reviewOrder.order_number})
            </h3>
            <p className="text-xs text-gray-500">
              Share your feedback to support independent Pakistani makers and guide other patrons.
            </p>

            {reviewStatus && (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-lg border border-emerald-200">
                {reviewStatus}
              </div>
            )}

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Rating</label>
                <div className="flex space-x-1 text-amber-500">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= reviewRating ? 'fill-amber-500 text-amber-500' : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Your Review</label>
                <textarea
                  rows={3}
                  required
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="How was the craftsmanship, packing, and finish of this piece?"
                  className="w-full text-xs p-3 bg-[#FAF8F5] border border-[#E5E0D5] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#C25E34]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewOrder(null)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#C25E34] text-white text-xs font-semibold rounded-lg hover:bg-[#A0441E]"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
