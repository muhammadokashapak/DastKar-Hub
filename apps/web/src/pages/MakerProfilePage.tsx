import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShieldCheck,
  MapPin,
  Star,
  ChevronRight,
  MessageCircle,
  Package,
  Sparkles,
  Share2,
  Check
} from 'lucide-react';
import { api } from '../lib/api';
import { SellerProfile } from '../types';
import { ProductCard } from '../components/commerce/ProductCard';

export const MakerProfilePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [maker, setMaker] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api.getMakerBySlug(slug)
      .then((res) => {
        setMaker(res.data);
      })
      .catch((err) => {
        console.error('Failed to load maker', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse space-y-4">
        <div className="h-60 bg-gray-200 rounded-2xl" />
        <div className="h-32 bg-gray-200 rounded-2xl" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!maker) {
    return (
      <div className="max-w-md mx-auto my-16 text-center space-y-4 bg-white p-8 rounded-2xl border border-gray-200">
        <h2 className="text-xl font-bold font-serif text-gray-900">Artisan Storefront Not Found</h2>
        <p className="text-xs text-gray-500">The artisan workshop you are looking for may have been archived or moved.</p>
        <Link
          to="/makers"
          className="inline-block px-5 py-2.5 bg-[#C25E34] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs"
        >
          Browse Verified Makers
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 space-y-6">
      {/* Daraz-Style Breadcrumb Navigation */}
      <div className="flex items-center space-x-1.5 text-xs text-gray-500">
        <Link to="/" className="hover:text-[#C25E34] transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <Link to="/makers" className="hover:text-[#C25E34] transition-colors">Artisans Directory</Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-gray-900 font-semibold truncate max-w-[200px]">{maker.business_name}</span>
      </div>

      {/* Daraz Official Store Header Card */}
      <div className="bg-white rounded-2xl border border-[#EBE5DA] overflow-hidden shadow-xs">
        {/* Cover Photo Banner */}
        <div className="relative h-44 sm:h-64 bg-[#2D2A26] overflow-hidden">
          {maker.cover_url ? (
            <img
              src={maker.cover_url}
              alt={maker.business_name}
              className="w-full h-full object-cover opacity-90"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-amber-900 via-[#C25E34] to-amber-950 flex items-center justify-center text-white/30 font-serif text-3xl font-bold">
              {maker.business_name}
            </div>
          )}

          {/* Top Right Badges */}
          <div className="absolute top-3 right-3 flex items-center space-x-2">
            <button
              type="button"
              onClick={handleShare}
              className="p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-xs transition-colors cursor-pointer text-xs flex items-center space-x-1"
              title="Share Storefront"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="text-[11px] font-medium hidden sm:inline">{copiedLink ? 'Copied' : 'Share'}</span>
            </button>
            <span className="px-3 py-1 bg-white/95 backdrop-blur-xs rounded-full text-xs font-bold text-emerald-800 flex items-center space-x-1 shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="capitalize">{maker.verification_status || 'Verified'} Guild</span>
            </span>
          </div>
        </div>

        {/* Store Profile Info Bar (Clean spacing without overlapping the cover photo) */}
        <div className="p-4 sm:p-6 bg-white">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
            {/* Left: Avatar + Title + Provenance */}
            <div className="flex items-start space-x-4">
              {/* Overlapping Avatar */}
              <div className="-mt-14 sm:-mt-18 relative z-10 shrink-0">
                {maker.avatar_url ? (
                  <img
                    src={maker.avatar_url}
                    alt={maker.business_name}
                    className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl border-4 border-white object-cover object-top bg-white shadow-md"
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl border-4 border-white bg-[#FAF0EB] text-[#C25E34] font-bold text-3xl sm:text-4xl flex items-center justify-center shadow-md">
                    {maker.business_name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Title & Metadata cleanly in the white section */}
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                    {maker.business_name}
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-[#C25E34]">
                    Master Workshop
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-gray-500">
                  <span className="flex items-center text-gray-600">
                    <MapPin className="w-3.5 h-3.5 text-[#C25E34] mr-1 shrink-0" />
                    <span>{maker.location_city}, {maker.location_region || 'Pakistan'}</span>
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="flex items-center text-amber-700 font-semibold">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 mr-1" />
                    <span>{Number(maker.rating_average || 5.0).toFixed(1)} / 5.0 ({maker.rating_count || 38} reviews)</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Daraz-Style Seller Metrics & Follow CTA */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 shrink-0 self-start md:self-auto">
              {/* Daraz Seller Scorecard */}
              <div className="flex items-center space-x-3 bg-[#FAF8F5] px-3.5 py-2 rounded-xl border border-[#EBE5DA] text-xs">
                <div className="text-center">
                  <div className="font-extrabold text-[#C25E34] text-sm">98%</div>
                  <div className="text-[10px] text-gray-500">Positive Rating</div>
                </div>
                <div className="w-px h-6 bg-gray-200" />
                <div className="text-center">
                  <div className="font-extrabold text-emerald-700 text-sm">100%</div>
                  <div className="text-[10px] text-gray-500">Ship on Time</div>
                </div>
                <div className="w-px h-6 bg-gray-200" />
                <div className="text-center">
                  <div className="font-bold text-gray-900 text-sm">{maker.completed_orders || 142}</div>
                  <div className="text-[10px] text-gray-500">Orders Sent</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsFollowing(!isFollowing)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-2xs ${
                    isFollowing
                      ? 'bg-gray-100 text-gray-700 border border-gray-300'
                      : 'bg-[#C25E34] hover:bg-[#A0441E] text-white'
                  }`}
                >
                  {isFollowing ? '✓ Following' : '+ Follow Store'}
                </button>
                <Link
                  to="/contact"
                  className="px-3.5 py-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#C25E34]" />
                  <span>Chat</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Heritage Story & Bio */}
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Workshop Provenance &amp; Cultural Heritage
            </h2>
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed max-w-4xl">
              {maker.bio || 'Generational Pakistani craft masters preserving indigenous materials, earthen firing techniques, and hand-finished folk aesthetics.'}
            </p>
            {maker.craft_description && (
              <div className="text-xs text-amber-950 bg-amber-50/80 p-2.5 rounded-xl border border-amber-200/80 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#C25E34] shrink-0" />
                <span><strong>Specialty Techniques:</strong> {maker.craft_description}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Handcrafted Products Catalog (Dense Daraz 6-Column Grid) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#EBE5DA]">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-gray-900">
              Handcrafted Creations ({maker.products?.length || 0})
            </h2>
            <p className="text-xs text-gray-500">Direct from {maker.business_name} workshop in {maker.location_city}</p>
          </div>
          <span className="self-start sm:self-auto text-[10px] sm:text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full">
            0% Middleman Markup &bull; Direct Artisan Payouts
          </span>
        </div>

        {maker.products && maker.products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {maker.products.map((p) => (
              <ProductCard key={p.id} product={{ ...p, seller: maker }} compact={true} />
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-2xl border border-[#EBE5DA] text-center space-y-2">
            <Package className="w-10 h-10 text-gray-300 mx-auto" />
            <h3 className="font-serif text-base font-bold text-gray-700">Workshop Inventory In Production</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              New handcrafted pottery and handloom pieces are currently being cured and fired. Check back soon!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
