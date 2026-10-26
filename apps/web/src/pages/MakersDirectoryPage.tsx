import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  MapPin,
  Star,
  Package,
  ChevronRight,
  Search,
  SlidersHorizontal,
  RefreshCw,
  Sparkles,
  Award,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { api } from '../lib/api';
import { SellerProfile } from '../types';

const CRAFT_DISCIPLINES = [
  'All Crafts',
  'Pottery & Ceramics',
  'Leather Crafts',
  'Woodwork & Carving',
  'Textiles & Shawls',
  'Fine Art & Painting',
  'Brass & Metalwork',
  'Resin & Keepsakes',
];

const PROVINCES = [
  'All Regions',
  'Punjab',
  'Sindh',
  'Khyber Pakhtunkhwa',
  'Balochistan',
  'Federal',
];

// Curated authentic Pakistani craft visual mapping for makers (matched to database slugs)
const CRAFT_THEME_DATA: Record<string, { cover: string; avatar: string; discipline: string; tags: string[] }> = {
  'hunar-e-resin-custom': {
    cover: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&crop=faces&w=400&h=400&q=80',
    discipline: 'Resin & Calligraphy',
    tags: ['Epoxy Resin', 'Botanicals', 'Urdu Calligraphy'],
  },
  'peshawar-leather-lab': {
    cover: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=80',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&crop=faces&w=400&h=400&q=80',
    discipline: 'Leather Goods & Saddlery',
    tags: ['Vegetable Tanned', 'Saddle Stitch', 'Full Grain'],
  },
  'mitti-clay-contemporary': {
    cover: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1200&q=80',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&crop=faces&w=400&h=400&q=80',
    discipline: 'Ceramics & Stoneware',
    tags: ['Handthrown', 'Woodfired', 'Stoneware'],
  },
  'rang-e-hunar-studio': {
    cover: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?auto=format&fit=crop&w=1200&q=80',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&crop=faces&w=400&h=400&q=80',
    discipline: 'Folk Art & Truck Art',
    tags: ['Highway Poetry', 'Enamel Paint', 'Folk Pop'],
  },
  'swat-handloom-wool-weaves': {
    cover: 'https://images.unsplash.com/photo-1606744837616-56c9a5c6a6eb?auto=format&fit=crop&w=1200&q=80',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&crop=faces&w=400&h=400&q=80',
    discipline: 'Textiles & Handloom',
    tags: ['Swati Wool', 'Pit Loom', 'Organic Fleece'],
  },
  'dastkari-studio-balochi': {
    cover: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&crop=faces&w=400&h=400&q=80',
    discipline: 'Balochi Tribal Crafts',
    tags: ['Mirrorwork', 'Do-Toch Needlework', 'Heritage'],
  },
  'hunar-e-wood-chiniot': {
    cover: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&crop=faces&w=400&h=400&q=80',
    discipline: 'Chinioti & Sheesham Wood',
    tags: ['Solid Rosewood', 'Geometric Inlay', 'Hand Carved'],
  },
  'khushboo-crafts-candle': {
    cover: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1200&q=80',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&crop=faces&w=400&h=400&q=80',
    discipline: 'Botanical Candles & Aromatics',
    tags: ['Soy Wax', 'Pure Essential Oils', 'Hand Poured'],
  },
  'mitti-studio-ceramic-decor': {
    cover: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1200&q=80',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&crop=faces&w=400&h=400&q=80',
    discipline: 'Multani Blue Pottery',
    tags: ['Multani Kashikari', 'Cobalt Glaze', 'Incense Vessels'],
  },
  'hala-artisan-clay-potters': {
    cover: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=80',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&crop=faces&w=400&h=400&q=80',
    discipline: 'Sindhi Glazed Terracotta',
    tags: ['Hala Glaze', 'Floral Terra', 'Lead-Free Clay'],
  },
  'woven-dreams-macrame': {
    cover: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
    avatar: 'https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&crop=faces&w=400&h=400&q=80',
    discipline: 'Macramé & Fiber Art',
    tags: ['Cotton Cord', 'Boho Knotting', 'Wall Tapestry'],
  },
  'peshawar-craft-house-brass': {
    cover: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=1200&q=80',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&crop=faces&w=400&h=400&q=80',
    discipline: 'Khyber Brass & Metalwork',
    tags: ['Openwork Filigree', 'Cast Brass', 'Dhoop Daani'],
  },
  'kashmir-threads-pashmina': {
    cover: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=1200&q=80',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&crop=faces&w=400&h=400&q=80',
    discipline: 'Pashmina & Fine Weaves',
    tags: ['Mountain Cashmere', 'Zari Border', 'Featherlight'],
  },
  'lahore-handmade-studio': {
    cover: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1200&q=80',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&crop=faces&w=400&h=400&q=80',
    discipline: 'Chinioti & Sheesham Wood',
    tags: ['Solid Rosewood', 'Geometric Inlay', 'Hand Carved'],
  },
};

const getCraftTheme = (slug: string) => {
  if (CRAFT_THEME_DATA[slug]) return CRAFT_THEME_DATA[slug];
  for (const [key, val] of Object.entries(CRAFT_THEME_DATA)) {
    if (slug.startsWith(key) || key.startsWith(slug)) return val;
  }
  return null;
};

export const MakersDirectoryPage: React.FC = () => {
  const [makers, setMakers] = useState<SellerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState('All Crafts');
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [selectedTier, setSelectedTier] = useState('All Tiers');
  const [sortBy, setSortBy] = useState<'rating' | 'orders' | 'newest'>('rating');

  useEffect(() => {
    api.getMakers()
      .then((res) => {
        setMakers(res.data || []);
      })
      .catch((err) => {
        console.error('Failed to load makers', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filteredMakers = useMemo(() => {
    return makers
      .filter((maker) => {
        const query = search.toLowerCase().trim();
        const matchesSearch =
          !query ||
          maker.business_name.toLowerCase().includes(query) ||
          (maker.craft_description && maker.craft_description.toLowerCase().includes(query)) ||
          (maker.bio && maker.bio.toLowerCase().includes(query)) ||
          maker.location_city.toLowerCase().includes(query);

        const matchesRegion =
          selectedRegion === 'All Regions' ||
          maker.location_region.toLowerCase() === selectedRegion.toLowerCase();

        const matchesTier =
          selectedTier === 'All Tiers' ||
          (selectedTier === 'Established' && maker.verification_status === 'established') ||
          (selectedTier === 'Verified' && maker.verification_status === 'verified') ||
          (selectedTier === 'Boosted' && Boolean(maker.new_seller_boost_started_at));

        const matchesDiscipline =
          selectedDiscipline === 'All Crafts' ||
          (maker.craft_description &&
            maker.craft_description.toLowerCase().includes(selectedDiscipline.toLowerCase().split(' ')[0]));

        return matchesSearch && matchesRegion && matchesTier && matchesDiscipline;
      })
      .sort((a, b) => {
        if (sortBy === 'orders') return (b.completed_orders || 0) - (a.completed_orders || 0);
        if (sortBy === 'newest') return (b.id || 0) - (a.id || 0);
        return Number(b.rating_average || 0) - Number(a.rating_average || 0);
      });
  }, [makers, search, selectedRegion, selectedTier, selectedDiscipline, sortBy]);

  const clearAllFilters = () => {
    setSearch('');
    setSelectedDiscipline('All Crafts');
    setSelectedRegion('All Regions');
    setSelectedTier('All Tiers');
    setSortBy('rating');
  };

  const hasActiveFilters =
    Boolean(search) ||
    selectedDiscipline !== 'All Crafts' ||
    selectedRegion !== 'All Regions' ||
    selectedTier !== 'All Tiers';

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-6 sm:space-y-10">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-1.5 text-xs text-gray-500 overflow-x-auto pb-1 scrollbar-none">
        <Link to="/" className="hover:text-gray-900 shrink-0">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        <span className="text-gray-900 font-medium truncate">Pakistani Artisan Directory</span>
      </div>

      {/* Hero Header Section */}
      <div className="bg-gradient-to-r from-[#211814] via-[#352119] to-[#211814] text-white rounded-3xl p-6 sm:p-10 border border-amber-900/30 relative overflow-hidden shadow-lg">
        <div className="absolute right-0 top-0 w-80 h-80 bg-[#C25E34]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3 sm:space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <span>🇵🇰 100% Verified Indigenous Artisans</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
            Pakistan&apos;s Master Artisans &amp; Craft Guilds
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-2xl">
            Meet the genuine craftspersons, generational woodcarvers, Multani ceramicists, and textile masters keeping 5,000 years of living heritage alive. Over 90% of every order goes directly to rural artisan livelihood.
          </p>

          <div className="pt-2 flex flex-wrap gap-4 sm:gap-6 text-xs text-amber-200/90 font-medium">
            <span className="flex items-center space-x-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Direct Workshop Fulfillment</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>No Bazaar Exploitation</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Escrow Protected Delivery</span>
            </span>
          </div>
        </div>
      </div>

      {/* Quick Craft Discipline Filter Tabs */}
      <div role="tablist" aria-label="Craft Discipline Tabs" className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {CRAFT_DISCIPLINES.map((discipline) => {
          const isActive = selectedDiscipline === discipline;
          return (
            <button
              key={discipline}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => {
                setSelectedDiscipline(discipline);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#C25E34] text-white shadow-xs'
                  : 'bg-white text-gray-700 border border-[#EBE5DA] hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {discipline}
            </button>
          );
        })}
      </div>

      {/* Advanced Filter & Search Controls Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#EBE5DA] shadow-2xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by artisan name, guild, discipline, or city..."
            className="w-full pl-9 pr-4 py-2.5 bg-[#FAF8F5] border border-[#E5E0D5] rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-hidden focus:ring-1 focus:ring-[#C25E34]"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Province / Region */}
          <div className="flex-1 sm:flex-initial flex items-center space-x-1.5 bg-[#FAF8F5] border border-[#E5E0D5] rounded-xl px-3 py-2 text-xs">
            <MapPin className="w-3.5 h-3.5 text-[#C25E34] shrink-0" />
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="bg-transparent text-gray-800 font-medium focus:outline-hidden cursor-pointer text-xs"
            >
              {PROVINCES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Verification Tier */}
          <div className="flex-1 sm:flex-initial flex items-center space-x-1.5 bg-[#FAF8F5] border border-[#E5E0D5] rounded-xl px-3 py-2 text-xs">
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="bg-transparent text-gray-800 font-medium focus:outline-hidden cursor-pointer text-xs"
            >
              <option value="All Tiers">All Tiers</option>
              <option value="Established">Master Guilds</option>
              <option value="Verified">Verified Makers</option>
              <option value="Boosted">New Rising Artisans (Boosted)</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex-1 sm:flex-initial flex items-center space-x-1.5 bg-[#FAF8F5] border border-[#E5E0D5] rounded-xl px-3 py-2 text-xs">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-gray-800 font-medium focus:outline-hidden cursor-pointer text-xs"
            >
              <option value="rating">Sort: Highest Rated</option>
              <option value="orders">Sort: Most Orders</option>
              <option value="newest">Sort: Newest Artisans</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="px-3 py-2 text-xs font-semibold text-[#C25E34] hover:bg-orange-50 rounded-xl transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
              title="Reset all filters"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Results Count Header */}
      <div className="flex items-center justify-between text-xs text-gray-500 font-medium px-1">
        <span>Showing <strong className="text-gray-900">{filteredMakers.length}</strong> authentic craft guilds</span>
        <span>Empowering rural Pakistani artisans nationwide</span>
      </div>

      {/* Grid of Makers */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-96 bg-gray-200 rounded-3xl" />
          ))}
        </div>
      ) : filteredMakers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMakers.map((maker) => {
            const theme = getCraftTheme(maker.slug);
            const coverImage = theme?.cover || maker.cover_url || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=80';
            const avatarImage = theme?.avatar || maker.avatar_url;
            const craftDiscipline = theme?.discipline || maker.craft_description || 'Authentic Craft';
            const tags = theme?.tags || ['Handmade', 'Generational Craft'];
            const isBoosted = Boolean(maker.new_seller_boost_started_at);

            return (
              <Link
                key={maker.id}
                to={`/makers/${maker.slug}`}
                className="group bg-white rounded-3xl border border-[#EBE5DA] overflow-hidden hover:border-[#C25E34] hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                {/* Visual Cover Banner with Zoom & Generous Height */}
                <div className="h-48 sm:h-52 bg-[#F0EAE1] relative overflow-hidden">
                  <img
                    src={coverImage}
                    alt={maker.business_name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/20" />

                  {/* Top Status Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-semibold text-amber-200 uppercase tracking-wider">
                      {maker.location_region}
                    </span>

                    {isBoosted ? (
                      <div className="px-2.5 py-1 bg-amber-500 text-white rounded-full text-[11px] font-bold flex items-center space-x-1 shadow-sm">
                        <Sparkles className="w-3 h-3" />
                        <span>Rising Maker +20%</span>
                      </div>
                    ) : maker.verification_status === 'established' ? (
                      <div className="px-2.5 py-1 bg-amber-900/90 text-amber-200 rounded-full text-[11px] font-bold flex items-center space-x-1 shadow-sm">
                        <Award className="w-3 h-3 text-amber-400" />
                        <span>Master Guild</span>
                      </div>
                    ) : (
                      <div className="px-2.5 py-1 bg-white/95 backdrop-blur-xs rounded-full text-[11px] font-bold text-emerald-800 flex items-center space-x-1 shadow-xs">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="capitalize">{maker.verification_status} Maker</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col">
                  {/* Avatar & Title Row */}
                  <div className="flex items-start space-x-3.5 -mt-10 sm:-mt-11 mb-3">
                    <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl border-4 border-white bg-white shadow-lg shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
                      {avatarImage ? (
                        <img
                          src={avatarImage}
                          alt={maker.business_name}
                          className="w-full h-full object-cover object-top"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#FAF0EB] text-[#C25E34] font-serif font-bold text-2xl flex items-center justify-center">
                          {maker.business_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 sm:pt-4 flex-1 min-w-0">
                      <h3 className="font-serif font-bold text-base text-gray-900 group-hover:text-[#C25E34] transition-colors leading-snug truncate">
                        {maker.business_name}
                      </h3>
                      <div className="flex items-center space-x-1 text-xs text-gray-500 mt-0.5">
                        <MapPin className="w-3 h-3 text-[#C25E34] shrink-0" />
                        <span className="truncate">{maker.location_city}, {maker.location_region}</span>
                      </div>
                    </div>
                  </div>

                  {/* Craft Discipline Highlight */}
                  <div className="mb-2.5">
                    <span className="inline-block text-[11px] font-semibold text-[#8B3514] bg-[#FAF0EA] px-2.5 py-0.5 rounded-lg border border-[#F2D7C7]">
                      {craftDiscipline}
                    </span>
                  </div>

                  {/* Bio statement */}
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-4">
                    {maker.bio || maker.craft_description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4 mt-auto">
                    {tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] text-gray-500 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-md"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>

                  {/* Footer Metrics & CTA */}
                  <div className="pt-3 border-t border-[#F5F2EB] flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1 font-bold text-amber-700">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{Number(maker.rating_average).toFixed(1)}</span>
                        <span className="text-gray-400 font-normal text-[11px]">({maker.rating_count})</span>
                      </div>
                      <span className="text-gray-300">•</span>
                      <div className="flex items-center space-x-1 text-gray-600">
                        <Package className="w-3.5 h-3.5 text-gray-400" />
                        <span>{maker.completed_orders} orders</span>
                      </div>
                    </div>

                    <span className="text-[#C25E34] font-semibold text-xs flex items-center space-x-1 group-hover:translate-x-0.5 transition-transform">
                      <span>Visit</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-3xl border border-[#EBE5DA] text-center space-y-4 shadow-2xs">
          <p className="text-base font-serif font-bold text-gray-900">No artisans matched your criteria</p>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Try adjusting your search query, clearing province filters, or exploring all traditional craft disciplines.
          </p>
          <button
            type="button"
            onClick={clearAllFilters}
            className="px-5 py-2.5 bg-[#C25E34] text-white text-xs font-semibold rounded-xl hover:bg-[#A0441E] transition-colors cursor-pointer"
          >
            Show All Artisans
          </button>
        </div>
      )}
    </div>
  );
};
