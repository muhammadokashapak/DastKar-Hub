import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, ShoppingBag, Check, ShieldCheck } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../lib/cartContext';
import { useWishlist } from '../../lib/wishlistContext';
import { getProductImage, handleImageError } from '../../lib/craftImages';

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, compact = false }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [addedAnim, setAddedAnim] = useState(false);

  const isWishlisted = isInWishlist(product.id);
  const imageUrl = getProductImage(product);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, 1);
    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 1600);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const isOutOfStock = product.stock_quantity !== undefined && product.stock_quantity <= 0;

  // Calculate discount percentage if compare_at_price exists
  const discountPercent =
    product.compare_at_price && Number(product.compare_at_price) > Number(product.base_price)
      ? Math.round(
          ((Number(product.compare_at_price) - Number(product.base_price)) /
            Number(product.compare_at_price)) *
            100
        )
      : null;

  // Badge determination: exactly 1 quiet, editorial tag
  const singleBadge = discountPercent
    ? { label: `-${discountPercent}%`, bg: 'bg-[#B94D28] text-white' }
    : product.is_featured
    ? { label: 'BESTSELLER', bg: 'bg-white/95 text-[#20242B] border border-[#EAE4D8]' }
    : { label: 'HANDMADE', bg: 'bg-white/90 text-[#54745C] border border-[#EAE4D8]' };

  return (
    <div className="group bg-white rounded-xl sm:rounded-2xl border border-[#EAE4D8] overflow-hidden hover:shadow-xl hover:border-[#B94D28]/30 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative">
      {/* 4:5 Vertical Portrait Frame matching Image 4 Reference */}
      <Link
        to={`/products/${product.slug}`}
        className="relative block aspect-[4/5] bg-[#F7F4EE] overflow-hidden cursor-pointer"
      >
        <img
          src={imageUrl}
          alt={product.title}
          onError={(e) => handleImageError(e, product.title)}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Single Quiet Tag (Top Left) */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10 pointer-events-none">
          <span
            className={`px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-[10px] font-semibold tracking-wider uppercase rounded-full shadow-xs backdrop-blur-xs ${singleBadge.bg}`}
          >
            {singleBadge.label}
          </span>
        </div>

        {/* Bookmark / Wishlist Heart Icon (Top Right) */}
        <button
          type="button"
          onClick={handleWishlistToggle}
          aria-label={isWishlisted ? `Remove ${product.title} from Wishlist` : `Save ${product.title} to Wishlist`}
          aria-pressed={isWishlisted}
          className={`absolute top-2 right-2 sm:top-3 sm:right-3 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
            isWishlisted
              ? 'bg-white text-[#B94D28] shadow-md ring-2 ring-[#B94D28]/20 scale-105'
              : 'bg-white/85 backdrop-blur-xs text-[#20242B]/60 hover:text-[#B94D28] hover:bg-white hover:scale-110 shadow-xs'
          }`}
          title={isWishlisted ? 'Saved in Wishlist' : 'Save to Wishlist'}
        >
          <Heart
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${
              isWishlisted ? 'fill-[#B94D28] text-[#B94D28]' : ''
            }`}
          />
        </button>

        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-2xs flex items-center justify-center z-10">
            <span className="px-2.5 py-1 bg-[#20242B] text-white text-[10px] sm:text-xs font-semibold rounded-full tracking-wider uppercase">
              Sold Out
            </span>
          </div>
        )}
      </Link>

      {/* Card Body */}
      <div className="p-2.5 sm:p-4 flex flex-col flex-1">
        {/* Verified Maker + Provenance */}
        <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-[#6B7280] mb-1 sm:mb-1.5 gap-1.5">
          <Link
            to={`/makers/${product.seller?.slug || ''}`}
            onClick={(e) => e.stopPropagation()}
            className="hover:text-[#B94D28] font-medium truncate flex items-center gap-1 transition-colors"
          >
            <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#54745C] shrink-0" />
            <span className="truncate max-w-[100px] sm:max-w-[130px]">
              {product.seller?.business_name || 'Heritage Maker'}
            </span>
          </Link>
          {product.seller?.location_city && (
            <span className="text-[9px] sm:text-[10px] text-[#8C929D] shrink-0 font-medium tracking-wide">
              {product.seller.location_city}
            </span>
          )}
        </div>

        {/* 2-Line Editorial Title */}
        <Link to={`/products/${product.slug}`} className="block mb-1.5 sm:mb-2 group/title">
          <h3
            className={`font-sans text-xs sm:text-sm font-semibold text-[#20242B] group-hover/title:text-[#B94D28] transition-colors line-clamp-2 leading-tight sm:leading-snug ${
              compact ? 'min-h-[2rem] sm:min-h-[2.2rem]' : 'min-h-[2rem] sm:min-h-[2.5rem]'
            }`}
          >
            {product.title}
          </h3>
        </Link>

        {/* Rating & Trust Line */}
        <div className="flex items-center space-x-1 sm:space-x-1.5 text-[10px] sm:text-[11px] mb-2 sm:mb-3">
          <div className="flex items-center text-[#D5A45D]">
            <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
            <span className="ml-0.5 sm:ml-1 font-bold text-[#20242B] text-[10px] sm:text-[11px]">
              {Number(product.rating_average || 4.9).toFixed(1)}
            </span>
          </div>
          <span className="text-[#8C929D]">·</span>
          <span className="text-[#54745C] font-medium truncate">
            {product.rating_count ? `${product.rating_count} reviews` : 'Verified craft'}
          </span>
        </div>

        {/* Price & Primary Action Button */}
        <div className="mt-auto pt-1.5 sm:pt-2 border-t border-[#EAE4D8]/60 flex flex-col gap-2 sm:gap-2.5">
          <div className="flex items-baseline justify-between gap-1">
            <div className="flex items-baseline gap-1">
              <span className="text-[11px] sm:text-xs font-semibold text-[#B94D28]">Rs.</span>
              <span className="text-sm sm:text-lg font-bold text-[#20242B] font-sans tracking-tight">
                {Number(product.base_price).toLocaleString('en-PK')}
              </span>
            </div>
            {discountPercent && (
              <span className="text-[10px] sm:text-xs text-[#8C929D] line-through truncate">
                Rs. {Number(product.compare_at_price).toLocaleString('en-PK')}
              </span>
            )}
          </div>

          {/* Full-width Button matching image 4 reference */}
          <button
            type="button"
            disabled={isOutOfStock}
            onClick={handleQuickAdd}
            aria-label={isOutOfStock ? 'Sold out' : `Add ${product.title} to cart`}
            className={`w-full py-2 sm:py-2.5 px-2 sm:px-3 rounded-lg sm:rounded-xl text-[11px] sm:text-[13px] font-semibold flex items-center justify-center space-x-1.5 sm:space-x-2 transition-all duration-200 cursor-pointer shadow-xs ${
              isOutOfStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                : addedAnim
                ? 'bg-[#54745C] text-white ring-2 ring-[#54745C]/30 scale-[0.99]'
                : 'bg-[#B94D28] text-white hover:bg-[#9C3D1D] active:scale-[0.98]'
            }`}
          >
            {addedAnim ? (
              <>
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                <span>Added to Basket</span>
              </>
            ) : isOutOfStock ? (
              <span>Out of stock</span>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Add to Basket</span>
                <span className="xs:hidden">Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
