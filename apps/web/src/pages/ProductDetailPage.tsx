import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  Clock,
  Sparkles,
  ShoppingBag,
  Heart,
  Store,
  Award
} from 'lucide-react';
import { api } from '../lib/api';
import { Product, ProductVariant } from '../types';
import { useCart } from '../lib/cartContext';
import { useWishlist } from '../lib/wishlistContext';
import { ProductCard } from '../components/commerce/ProductCard';
import { getProductImage, handleImageError } from '../lib/craftImages';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [customizationValues, setCustomizationValues] = useState<Record<string, string>>({});
  const [activeImage, setActiveImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'care' | 'reviews'>('details');

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const navigate = useNavigate();

  const isWishlisted = product ? isInWishlist(product.id) : false;
  const isOutOfStock = product?.stock_quantity !== undefined && product.stock_quantity <= 0;
  const maxQuantity = product?.stock_quantity !== undefined && product.stock_quantity > 0 ? product.stock_quantity : 99;

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api.getProductBySlug(slug)
      .then((res) => {
        const p = res.data.product;
        setProduct(p);
        setRelated(res.data.related || []);
        const primary = p.primary_image?.image_url || p.images?.[0]?.image_url || '';
        setActiveImage(primary);
        if (p.variants && p.variants.length > 0) {
          setSelectedVariant(p.variants[0]);
        }
      })
      .catch((err) => {
        console.error('Failed to load product', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
          <div className="aspect-square bg-gray-200 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-6 bg-gray-200 rounded w-1/3" />
            <div className="h-24 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto my-16 text-center space-y-3 bg-white p-8 rounded-xl border border-gray-200">
        <h2 className="text-xl font-bold font-serif text-gray-800">Product Not Found</h2>
        <p className="text-xs text-gray-500">The craft piece you are looking for may have been archived.</p>
        <Link to="/products" className="inline-block px-4 py-2 bg-[#C25E34] text-white text-xs font-semibold rounded-lg">
          Browse Catalog
        </Link>
      </div>
    );
  }

  const currentPrice = selectedVariant ? selectedVariant.price : product.base_price;

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedVariant, customizationValues);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedVariant, customizationValues);
    navigate('/checkout');
  };

  const allImages = useMemo(() => {
    const raw = product.images && product.images.length > 0
      ? product.images.map(img => img.image_url)
      : [product.primary_image?.image_url || getProductImage(product)];
    const filtered = raw.filter(
      (u): u is string =>
        Boolean(u) &&
        !u.includes('1590483256037') &&
        !u.includes('1611591475152') &&
        !u.includes('1576020799627')
    );
    return filtered.length > 0 ? filtered : [getProductImage(product)];
  }, [product]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-32 md:pb-10 space-y-6 sm:space-y-10">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-1.5 text-xs text-gray-500 overflow-x-auto pb-1 scrollbar-none">
        <Link to="/" className="hover:text-gray-900 shrink-0">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        <Link to="/products" className="hover:text-gray-900 shrink-0">Catalog</Link>
        {product.category && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <Link to={`/products?category=${product.category.slug}`} className="hover:text-gray-900 shrink-0">
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        <span className="text-gray-900 font-medium truncate max-w-xs">{product.title}</span>
      </div>

      {/* Main Product Layout (Daraz 3-Column Structure) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* Col 1 (5 cols): Image Gallery */}
        <div className="lg:col-span-5 space-y-3">
          <div className="aspect-square bg-[#F7F4EE] rounded-2xl overflow-hidden border border-[#EBE5DA] relative shadow-xs">
            <img
              src={activeImage || allImages[0]}
              alt={product.title}
              onError={(e) => handleImageError(e, product.title)}
              className="w-full h-full object-cover object-center"
            />
            {product.is_customizable && (
              <span className="absolute top-3 left-3 px-2.5 py-1 bg-amber-900/80 backdrop-blur-xs text-amber-100 text-xs font-semibold rounded-md">
                Customizable by Maker
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div className="flex items-center space-x-2.5 overflow-x-auto pb-1 scroll-touch scrollbar-none">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImage(img)}
                  aria-label={`View thumbnail image ${idx + 1}`}
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                    activeImage === img ? 'border-[#C25E34] shadow-xs' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.title} — view ${idx + 1}`}
                    onError={(e) => handleImageError(e, product.title)}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Col 2 (4 cols): Product Buying Actions */}
        <div className="lg:col-span-4 space-y-4 bg-white p-5 sm:p-6 rounded-2xl border border-[#EBE5DA] shadow-xs">
          {/* Artisan & Region */}
          <div className="flex items-center justify-between">
            <Link
              to={`/makers/${product.seller?.slug}`}
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#C25E34] hover:underline"
            >
              <Store className="w-3.5 h-3.5" />
              <span>By {product.seller?.business_name}</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </Link>
            <span className="text-[11px] text-gray-500 font-medium">
              {product.seller?.location_city}, Pakistan
            </span>
          </div>

          {/* Title */}
          <h1 className="font-serif text-xl sm:text-2xl font-bold text-gray-900 leading-snug">
            {product.title}
          </h1>

          {/* Rating & Stock */}
          <div className="flex items-center space-x-3 text-xs">
            <div className="flex items-center text-amber-500">
              <Star className="w-4 h-4 fill-current" />
              <span className="ml-1 font-bold text-gray-900 text-xs">
                {Number(product.rating_average).toFixed(1)}
              </span>
            </div>
            <span className="text-gray-400">({product.rating_count ?? 0} reviews)</span>
            <span className="text-gray-300">|</span>
            {isOutOfStock ? (
              <span className="text-gray-600 bg-gray-100 px-2 py-0.5 rounded font-medium text-[11px]">
                Out of Stock
              </span>
            ) : (
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium text-[11px]">
                In Stock &amp; Ready
              </span>
            )}
          </div>

          {/* Price (Daraz Style: Rs. in bold terracotta + discount badge) */}
          <div className="pt-2 pb-3 border-y border-gray-100 flex items-baseline flex-wrap gap-2">
            <span className="text-xs text-[#C25E34] font-semibold">Rs.</span>
            <span className="text-2xl sm:text-3xl font-bold font-sans text-[#C25E34]">
              {Number(currentPrice).toLocaleString('en-PK')}
            </span>
            {product.compare_at_price && Number(product.compare_at_price) > Number(currentPrice) && (
              <>
                <span className="text-xs text-gray-400 line-through">
                  Rs. {Number(product.compare_at_price).toLocaleString('en-PK')}
                </span>
                <span className="px-1.5 py-0.5 bg-red-50 text-red-600 text-[10px] font-bold rounded">
                  -{Math.round(((Number(product.compare_at_price) - Number(currentPrice)) / Number(product.compare_at_price)) * 100)}%
                </span>
              </>
            )}
          </div>

          {/* Variant Selection */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                Select Option / Dimensions:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`p-2 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      selectedVariant?.id === v.id
                        ? 'border-[#C25E34] bg-amber-50/60 ring-1 ring-[#C25E34]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold text-gray-900">{v.name}</div>
                    <div className="text-[#C25E34] font-sans font-medium text-[11px]">
                      Rs. {Number(v.price).toLocaleString('en-PK')}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Customization Options */}
          {product.customization_options && product.customization_options.length > 0 && (
            <div className="space-y-2 bg-[#FAF8F5] p-3 rounded-xl border border-[#EBE5DA]">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-gray-900">
                <Sparkles className="w-3.5 h-3.5 text-[#C25E34]" />
                <span>Handmade Customization</span>
              </div>
              {product.customization_options.map((opt) => (
                <div key={opt.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-gray-700">
                    <span className="font-medium text-[11px]">{opt.name}</span>
                    {opt.price_delta > 0 && (
                      <span className="text-[10px] text-gray-500">+Rs. {opt.price_delta}</span>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Inscription, colors, custom notes..."
                    value={customizationValues[opt.name] || ''}
                    onChange={(e) =>
                      setCustomizationValues({
                        ...customizationValues,
                        [opt.name]: e.target.value,
                      })
                    }
                    className="w-full text-xs p-2 bg-white border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#C25E34]"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Quantity & CTA Buttons */}
          <div className="space-y-2.5 pt-1">
            {isOutOfStock ? (
              <div className="p-3 bg-gray-100 rounded-xl text-center border border-gray-200">
                <p className="text-xs font-semibold text-gray-700">Currently Out of Stock</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Being cured and fired in the workshop. Check back soon.</p>
              </div>
            ) : (
              <div className="flex items-center space-x-2.5">
                <div className="flex items-center border border-gray-300 rounded-xl bg-gray-50">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                    className="px-2.5 py-1.5 text-gray-600 hover:text-gray-900 text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    −
                  </button>
                  <span className="px-2.5 py-1.5 text-xs font-semibold text-gray-900 min-w-8 text-center">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                    disabled={quantity >= maxQuantity}
                    aria-label="Increase quantity"
                    className="px-2.5 py-1.5 text-gray-600 hover:text-gray-900 text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 py-2.5 px-3 bg-white border border-[#C25E34] text-[#C25E34] hover:bg-amber-50 font-bold text-xs rounded-xl transition-colors flex items-center justify-center space-x-1.5 shadow-2xs cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>

                {/* Wishlist Button */}
                <button
                  type="button"
                  onClick={() => product && toggleWishlist(product)}
                  aria-label={isWishlisted ? `Remove ${product.title} from Wishlist` : `Add ${product.title} to Wishlist`}
                  aria-pressed={isWishlisted}
                  title={isWishlisted ? "Saved in Wishlist" : "Save to Wishlist"}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                    isWishlisted
                      ? 'border-red-200 bg-red-50 text-red-600'
                      : 'border-gray-200 bg-white text-gray-600 hover:text-red-500 hover:border-red-200'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                </button>
              </div>
            )}

            {!isOutOfStock && (
              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full py-3 px-4 bg-[#C25E34] hover:bg-[#A0441E] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors shadow-xs cursor-pointer"
              >
                Buy Now (Fast Checkout)
              </button>
            )}
          </div>
        </div>

        {/* Col 3 (3 cols): Daraz-Style Delivery & Artisan Seller Sidebar */}
        <div className="lg:col-span-3 space-y-4">
          {/* Delivery & Services Box */}
          <div className="bg-white p-4 rounded-2xl border border-[#EBE5DA] space-y-3 text-xs shadow-xs">
            <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider border-b border-gray-100 pb-2">
              Delivery Options
            </h3>
            <div className="space-y-2.5">
              <div className="flex items-start space-x-2.5">
                <Truck className="w-4 h-4 text-[#C25E34] shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-gray-900">Standard Courier Delivery</div>
                  <div className="text-[11px] text-gray-500">3–5 business days nationwide</div>
                  <div className="text-[11px] font-bold text-emerald-700 mt-0.5">Rs. 250 (Free over Rs. 3,000)</div>
                </div>
              </div>

              <div className="flex items-start space-x-2.5 pt-2 border-t border-gray-100">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-gray-900">Cash on Delivery Available</div>
                  <div className="text-[11px] text-gray-500">Pay cash upon courier arrival</div>
                </div>
              </div>
            </div>

            <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider border-b border-gray-100 pb-2 pt-2">
              Service &amp; Warranty
            </h3>
            <div className="space-y-2.5">
              <div className="flex items-start space-x-2.5">
                <RotateCcw className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-gray-900">7-Day Transit Replacement</div>
                  <div className="text-[11px] text-gray-500">Protected against fragile ceramic breakage</div>
                </div>
              </div>

              <div className="flex items-start space-x-2.5">
                <Award className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-gray-900">100% Authentic Handcrafted</div>
                  <div className="text-[11px] text-gray-500">Direct artisan workshop provenance</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sold By / Artisan Workshop Scorecard (Daraz Style) */}
          <div className="bg-white p-4 rounded-2xl border border-[#EBE5DA] space-y-3 text-xs shadow-xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
              <div>
                <span className="text-[10px] text-gray-400 font-medium">Sold by Master Workshop</span>
                <Link
                  to={`/makers/${product.seller?.slug}`}
                  className="font-serif font-bold text-gray-900 text-sm block hover:text-[#C25E34] transition-colors"
                >
                  {product.seller?.business_name || 'Independent Artisan'}
                </Link>
              </div>
              <span className="px-2 py-0.5 bg-amber-50 text-[#C25E34] text-[10px] font-bold rounded">
                Verified
              </span>
            </div>

            {/* Seller Scorecard */}
            <div className="grid grid-cols-3 gap-2 text-center py-1">
              <div>
                <div className="font-extrabold text-[#C25E34] text-sm">98%</div>
                <div className="text-[10px] text-gray-500">Positive Rating</div>
              </div>
              <div>
                <div className="font-extrabold text-emerald-700 text-sm">100%</div>
                <div className="text-[10px] text-gray-500">Ship on Time</div>
              </div>
              <div>
                <div className="font-extrabold text-gray-900 text-sm">100%</div>
                <div className="text-[10px] text-gray-500">Response Rate</div>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100 flex items-center space-x-2">
              <Link
                to={`/makers/${product.seller?.slug}`}
                className="flex-1 py-1.5 bg-[#FAF8F5] hover:bg-gray-100 text-gray-800 text-center font-semibold rounded-lg border border-gray-200 text-xs transition-colors"
              >
                Visit Store
              </Link>
              <Link
                to="/contact"
                className="flex-1 py-1.5 bg-[#C25E34] hover:bg-[#A0441E] text-white text-center font-semibold rounded-lg text-xs transition-colors shadow-2xs"
              >
                Chat Now
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Maker Profile Feature Card matching mockup */}
      {product.seller && (
        <div className="bg-[#F8F5EE] border border-[#E7DECF] rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <img
              src={product.seller.avatar_url || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=200&q=80'}
              alt={product.seller.business_name}
              className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-xs shrink-0"
            />
            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="font-serif font-bold text-base text-gray-900">{product.seller.business_name}</h3>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-xs text-gray-600 mt-1 max-w-lg leading-relaxed">
                {product.seller.bio || product.seller.craft_description}
              </p>
              <div className="flex items-center space-x-3 text-xs text-gray-500 mt-2">
                <span>{product.seller.location_city}, Pakistan</span>
                <span>•</span>
                <span>{product.seller.completed_orders} orders completed</span>
              </div>
            </div>
          </div>

          <Link
            to={`/makers/${product.seller.slug}`}
            className="px-5 py-2.5 bg-white border border-[#D5CABB] text-gray-800 hover:border-[#C25E34] hover:text-[#C25E34] rounded-xl text-xs font-semibold shadow-2xs transition-colors shrink-0"
          >
            Visit Artisan Storefront
          </Link>
        </div>
      )}

      {/* Description & Reviews Tabs */}
      <div className="bg-white rounded-2xl border border-[#EBE5DA] overflow-hidden">
        <div role="tablist" aria-label="Product Information Tabs" className="flex border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-500 overflow-x-auto scrollbar-none">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'details'}
            onClick={() => setActiveTab('details')}
            className={`px-6 py-4 transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'details' ? 'border-[#C25E34] text-[#C25E34] bg-[#FAF8F5]' : 'border-transparent hover:text-gray-800'
            }`}
          >
            Craft Details & Provenance
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'care'}
            onClick={() => setActiveTab('care')}
            className={`px-6 py-4 transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'care' ? 'border-[#C25E34] text-[#C25E34] bg-[#FAF8F5]' : 'border-transparent hover:text-gray-800'
            }`}
          >
            Materials & Care
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'reviews'}
            onClick={() => setActiveTab('reviews')}
            className={`px-6 py-4 transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'reviews' ? 'border-[#C25E34] text-[#C25E34] bg-[#FAF8F5]' : 'border-transparent hover:text-gray-800'
            }`}
          >
            Customer Reviews ({product.reviews?.length ?? 0})
          </button>
        </div>

        <div role="tabpanel" className="p-6 text-sm text-gray-700 leading-relaxed">
          {activeTab === 'details' && (
            <div className="space-y-4 max-w-3xl">
              <p>{product.description}</p>
              {product.dimensions && (
                <p>
                  <strong className="text-gray-900">Dimensions:</strong> {product.dimensions}
                </p>
              )}
              {product.production_days && (
                <p className="flex items-center space-x-1.5 text-xs text-amber-900 bg-amber-50 p-3 rounded-lg border border-amber-200">
                  <Clock className="w-4 h-4 text-amber-700" />
                  <span>
                    Each piece is handcrafted. Please allow {product.production_days} days for the artisan to prepare and inspect your piece before dispatch.
                  </span>
                </p>
              )}
            </div>
          )}

          {activeTab === 'care' && (
            <div className="space-y-3 max-w-3xl">
              <p>
                <strong className="text-gray-900">Materials Used:</strong> {product.materials || 'Indigenous Natural Materials'}
              </p>
              <p>
                <strong className="text-gray-900">Care Instructions:</strong> {product.care_instructions || 'Dust gently with soft cloth. Avoid harsh chemical cleaners.'}
              </p>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {product.reviews && product.reviews.length > 0 ? (
                product.reviews.map((rev) => (
                  <div key={rev.id} className="border-b border-gray-100 pb-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-full bg-amber-100 text-[#C25E34] font-bold text-xs flex items-center justify-center">
                          {rev.buyer?.name ? rev.buyer.name.charAt(0) : 'A'}
                        </div>
                        <span className="font-semibold text-gray-900 text-xs">
                          {rev.buyer?.name || 'Verified Patron'}
                        </span>
                        <span className="text-emerald-700 text-[10px] font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                          Verified Purchase
                        </span>
                      </div>
                      <div className="flex text-amber-500">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-600">{rev.comment}</p>
                    {rev.seller_response && (
                      <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#EBE5DA] text-xs text-gray-700 ml-4 space-y-1">
                        <span className="font-bold text-[#C25E34]">Artisan Response:</span>
                        <p className="italic">{rev.seller_response}</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-500">No reviews yet. Be the first to review this handcrafted treasure.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Related Products (Daraz Dense Grid) */}
      {related.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-gray-900">You May Also Like</h2>
            <Link to="/products" className="text-xs font-semibold text-[#C25E34] hover:underline">
              View All Crafts &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {related.map((rp) => (
              <ProductCard key={rp.id} product={rp} compact={true} />
            ))}
          </div>
        </div>
      )}

      {/* Mobile Sticky Action Bar (Fixed flush above MobileBottomNav on small screens) */}
      <div className="fixed bottom-14 left-0 right-0 z-30 md:hidden bg-white/95 backdrop-blur-md border-t border-[#EBE5DA] px-3.5 py-2 shadow-xl flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] text-gray-500 font-medium">Total Price</div>
          <div className="text-base font-bold text-[#C25E34] font-sans truncate">
            Rs. {Number(currentPrice * quantity).toLocaleString('en-PK')}
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {!isOutOfStock ? (
            <>
              <button
                type="button"
                onClick={handleAddToCart}
                className="p-2.5 rounded-xl border border-[#C25E34] text-[#C25E34] hover:bg-amber-50 active:scale-95 transition-all shadow-xs cursor-pointer"
                aria-label="Add to cart"
                title="Add to Cart"
              >
                <ShoppingBag className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                className="py-2.5 px-4 bg-[#C25E34] active:bg-[#a04a25] text-white font-bold text-xs uppercase tracking-wider rounded-xl active:scale-95 transition-all shadow-md cursor-pointer"
              >
                Buy Now
              </button>
            </>
          ) : (
            <span className="text-xs text-gray-500 font-semibold bg-gray-100 px-3 py-1.5 rounded-lg">
              Out of Stock
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
