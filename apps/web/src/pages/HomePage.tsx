import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  QrCode,
  Truck,
  Sparkles,
  MessageCircle,
  X,
  Send,
  MapPin,
  HeartHandshake,
  CheckCircle2
} from 'lucide-react';
import { api } from '../lib/api';
import { Category, Product, SellerProfile } from '../types';
import { ProductCard } from '../components/commerce/ProductCard';
import QRCode from 'qrcode';
import { MobileBazaarModal } from '../components/common/MobileBazaarModal';

const HERO_SLIDES = [
  {
    title: 'Multani Blue Pottery',
    subtitle: 'Kashigari Masterworks from Generational Workshops',
    description: 'Cobalt glazed floral urns, dining platters, and decorative vases shaped by generational master potters.',
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1200&q=80',
    link: '/products?category=pottery-ceramics',
    badge: 'Heritage Verified Workshop',
    location: 'Multan, Punjab',
  },
  {
    title: 'Royal Chiniot Carvings',
    subtitle: 'Pure Sheesham Rosewood & Hand-hammered Brass Inlay',
    description: 'Heritage coffee tables, mirrors, and spice caskets carved by Chiniot master woodworkers with intricate floral motifs.',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80',
    link: '/products?category=woodwork',
    badge: 'Artisan Guild Certified',
    location: 'Chiniot, Punjab',
  },
  {
    title: 'Swat Pashmina & Sindhi Ajrak',
    subtitle: 'Handspun Woolen Shawls & Natural Indigo Block Prints',
    description: 'Pure valley wool hand-loomed in Swat alongside authentic block-printed Sindhi Ajrak crafted with indigenous vegetable dyes.',
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80',
    link: '/products?category=clothing-textiles',
    badge: 'Fair Trade Cultural Preservation',
    location: 'Swat & Hala',
  },
];

const DEFAULT_CATEGORY_TABS = [
  { name: 'Pottery & Ceramics', slug: 'pottery-ceramics' },
  { name: 'Leather Crafts', slug: 'leather-crafts' },
  { name: 'Woodwork', slug: 'woodwork' },
  { name: 'Clothing & Textiles', slug: 'clothing-textiles' },
  { name: 'Jewelry & Accessories', slug: 'jewelry-accessories' },
  { name: 'Home Décor', slug: 'home-decor' },
];

const getCategoryFallback = (slug: string) => {
  const map: Record<string, string> = {
    'pottery-ceramics': 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=400&q=80',
    'leather-crafts': 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=400&q=80',
    'woodwork': 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80',
    'clothing-textiles': 'https://images.unsplash.com/photo-1606744837616-56c9a5c6a6eb?auto=format&fit=crop&w=400&q=80',
    'jewelry-accessories': 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=400&q=80',
    'home-decor': 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=400&q=80',
    'embroidery': 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=400&q=80',
    'hand-painted-art': 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=400&q=80',
  };
  return map[slug] || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=400&q=80';
};

export const HomePage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [newMakers, setNewMakers] = useState<SellerProfile[]>([]);
  const [featuredMakers, setFeaturedMakers] = useState<SellerProfile[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  // Category Collection Tab State
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>('pottery-ceramics');
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [loadingCategoryProducts, setLoadingCategoryProducts] = useState(false);

  // Floating Chat / Message Drawer State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [messagesList, setMessagesList] = useState([
    {
      sender: 'bot',
      text: 'Salam! Welcome to DastKar Hub. Sourcing directly from Pakistani master artisans. How may we assist your craft discovery today?',
    },
  ]);

  // Mobile Bazaar & QR Scanner Modal State
  const [isMobileBazaarModalOpen, setIsMobileBazaarModalOpen] = useState(false);
  const [heroQrDataUrl, setHeroQrDataUrl] = useState<string>('');

  // Generate genuine scannable QR code for the desktop hero card
  useEffect(() => {
    const target =
      typeof window !== 'undefined'
        ? `${window.location.origin}/products?source=hero_qr`
        : 'https://dastkarhub.pk/products';

    QRCode.toDataURL(target, {
      width: 180,
      margin: 1,
      color: {
        dark: '#B94D28',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    })
      .then(setHeroQrDataUrl)
      .catch((err) => console.error('Failed to generate hero QR code', err));
  }, []);

  // Load primary homepage discovery data
  useEffect(() => {
    setLoading(true);

    Promise.allSettled([
      api.getCategories(),
      api.getTrendingProducts(6),
      api.getRecommendedProducts({ limit: 12 }),
      api.getNewMakers(4),
      api.getMakers(),
    ]).then(([catRes, trendRes, recRes, newMakersRes, makersRes]) => {
      if (catRes.status === 'fulfilled') {
        const cats = catRes.value.data || [];
        setCategories(cats.filter((c: Category) => !c.parent_id));
      }
      if (trendRes.status === 'fulfilled') {
        setTrendingProducts(trendRes.value.data || []);
      }
      if (recRes.status === 'fulfilled') {
        setRecommendedProducts(recRes.value.data || []);
      }
      if (newMakersRes.status === 'fulfilled') {
        setNewMakers(newMakersRes.value.data || []);
      }
      if (makersRes.status === 'fulfilled') {
        setFeaturedMakers((makersRes.value.data || []).slice(0, 4));
      }

      setLoading(false);
    });

    // Discovery impression telemetry
    api.trackDiscoveryEvent({
      event_type: 'product_impression',
      surface: 'homepage_editorial',
    });
  }, []);

  // Load category tab products dynamically
  useEffect(() => {
    setLoadingCategoryProducts(true);
    api
      .getProducts({ category: activeCategoryTab, per_page: 6, sort: 'ranked' })
      .then((res) => {
        setCategoryProducts(res.data || []);
      })
      .catch(() => {
        setCategoryProducts([]);
      })
      .finally(() => {
        setLoadingCategoryProducts(false);
      });
  }, [activeCategoryTab]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userText = chatMessage.trim();
    setMessagesList((prev) => [...prev, { sender: 'user', text: userText }]);
    setChatMessage('');

    setTimeout(() => {
      setMessagesList((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: `Thank you for your message! Our artisan workshop liaison will connect with you regarding: "${userText}". All custom requests are handled directly by master makers.`,
        },
      ]);
    }, 700);
  };

  const displayCategories =
    categories.length > 0
      ? categories.slice(0, 8)
      : [
          {
            name: 'Pottery & Ceramics',
            slug: 'pottery-ceramics',
            image_url:
              'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=300&q=80',
          },
          {
            name: 'Clothing & Textiles',
            slug: 'clothing-textiles',
            image_url:
              'https://images.unsplash.com/photo-1606744837616-56c9a5c6a6eb?auto=format&fit=crop&w=300&q=80',
          },
          {
            name: 'Leather Crafts',
            slug: 'leather-crafts',
            image_url:
              'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=300&q=80',
          },
          {
            name: 'Woodwork',
            slug: 'woodwork',
            image_url:
              'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=300&q=80',
          },
          {
            name: 'Home Décor',
            slug: 'home-decor',
            image_url:
              'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=300&q=80',
          },
          {
            name: 'Jewelry & Accessories',
            slug: 'jewelry-accessories',
            image_url:
              'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=300&q=80',
          },
          {
            name: 'Embroidery & Shawls',
            slug: 'embroidery',
            image_url:
              'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=300&q=80',
          },
          {
            name: 'Brass & Metal Craft',
            slug: 'customized-gifts',
            image_url:
              'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=300&q=80',
          },
        ];

  const currentSlideData = HERO_SLIDES[currentSlide];

  return (
    <div className="space-y-10 sm:space-y-20 pb-20 sm:pb-24 bg-[#F8F5EF] text-[#20242B]">
      {/* 1. Folk & Fable Editorial Hero Section (Generous Padding & Craft Aesthetic) */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 pt-4 sm:pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-center">
          {/* Left Column: Refined Typography & Distinct Dual CTAs */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6">
            <div className="inline-flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-[#FAF0EA] text-[#B94D28] text-[11px] sm:text-xs font-semibold tracking-wider uppercase border border-[#B94D28]/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Direct From Pakistani Master Artisans</span>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <h1 className="font-serif text-2xl sm:text-4xl lg:text-6xl font-bold tracking-tight text-[#20242B] leading-[1.15]">
                Crafted by Hand.{' '}
                <span className="italic font-normal text-[#B94D28] block sm:inline">
                  Rooted in Heritage.
                </span>
              </h1>
              <p className="text-xs sm:text-base text-[#4B5563] leading-relaxed max-w-xl">
                Discover indigenous Multani Blue Pottery, Chiniot Rosewood, Swat Pashmina, and Sindhi Ajrak.
                Every piece connects you directly with generational makers, with zero middleman markup.
              </p>
            </div>

            {/* 2 Clear, Prominent CTAs */}
            <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2.5 sm:gap-3.5 pt-1 sm:pt-2">
              <Link
                to="/products"
                className="px-6 py-3 sm:px-7 sm:py-3.5 rounded-full bg-[#B94D28] hover:bg-[#9C3D1D] text-white font-medium text-xs sm:text-base transition-all shadow-md inline-flex items-center justify-center space-x-2 cursor-pointer active:scale-98"
              >
                <span>Explore Handmade Crafts</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/makers"
                className="px-5 py-3 sm:px-6 sm:py-3.5 rounded-full bg-white hover:bg-[#FAF0EA] text-[#20242B] hover:text-[#B94D28] border border-[#EAE4D8] font-medium text-xs sm:text-base transition-all shadow-xs inline-flex items-center justify-center space-x-2 cursor-pointer active:scale-98"
              >
                <span>Meet the Artisans</span>
              </Link>
            </div>

            {/* Trust Micro-Metrics */}
            <div className="pt-3 sm:pt-4 border-t border-[#EAE4D8] grid grid-cols-3 gap-2 sm:gap-4 text-xs">
              <div>
                <p className="font-serif text-base sm:text-xl font-bold text-[#20242B]">50+ Guilds</p>
                <p className="text-[#6B7280] text-[10px] sm:text-[11px] mt-0.5">Generational Studios</p>
              </div>
              <div>
                <p className="font-serif text-base sm:text-xl font-bold text-[#20242B]">100%</p>
                <p className="text-[#6B7280] text-[10px] sm:text-[11px] mt-0.5">Fair Maker Payouts</p>
              </div>
              <div>
                <p className="font-serif text-base sm:text-xl font-bold text-[#54745C]">★ 4.9 / 5.0</p>
                <p className="text-[#6B7280] text-[10px] sm:text-[11px] mt-0.5">Craft Quality Rating</p>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Craft Frame + Live Scannable QR Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-[#EAE4D8] shadow-xl bg-white aspect-[4/3] sm:aspect-[4/5] max-h-[300px] sm:max-h-[500px]">
              <img
                src={currentSlideData.image}
                alt={currentSlideData.title}
                className="w-full h-full object-cover object-center transition-all duration-700 hover:scale-105"
              />

              {/* Slide Navigation Controls */}
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center space-x-1.5 z-10">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentSlide((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1))
                  }
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/85 backdrop-blur-xs text-[#20242B] hover:bg-white flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                  aria-label="Previous craft slide"
                >
                  <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/85 backdrop-blur-xs text-[#20242B] hover:bg-white flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                  aria-label="Next craft slide"
                >
                  <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>

              {/* Editorial Caption Tag */}
              <div className="absolute inset-x-2.5 bottom-2.5 sm:inset-x-4 sm:bottom-4 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white/95 backdrop-blur-md border border-[#EAE4D8] shadow-lg">
                <div className="flex items-center justify-between text-[10px] sm:text-[11px] mb-0.5 sm:mb-1">
                  <span className="font-semibold text-[#B94D28] uppercase tracking-wider">
                    {currentSlideData.badge}
                  </span>
                  <span className="text-[#6B7280] flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#B94D28]" />
                    {currentSlideData.location}
                  </span>
                </div>
                <h3 className="font-serif text-sm sm:text-base font-bold text-[#20242B] line-clamp-1">
                  {currentSlideData.title}
                </h3>
                <p className="text-[11px] sm:text-xs text-[#4B5563] line-clamp-1 mt-0.5">
                  {currentSlideData.subtitle}
                </p>
              </div>
            </div>

            {/* Mobile View: Quick Scanner Launcher Pill */}
            <div
              onClick={() => setIsMobileBazaarModalOpen(true)}
              className="mt-3 sm:hidden bg-white rounded-xl p-3 border border-[#EAE4D8] shadow-xs flex items-center justify-between gap-2.5 cursor-pointer hover:border-[#B94D28]/40 transition-all"
              role="button"
              tabIndex={0}
              title="Click to launch Mobile Bazaar & Authenticity QR Scanner"
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-9 h-9 bg-[#FAF0EA] rounded-lg text-[#B94D28] flex items-center justify-center shrink-0">
                  <QrCode className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#20242B] truncate">Verify Craft Authenticity Seal</div>
                  <p className="text-[10px] text-[#6B7280] truncate">Tap to test live workshop camera scanner</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-[#FAF0EA] text-[#B94D28] text-[11px] font-bold shrink-0">
                Scan Seal
              </span>
            </div>

            {/* Desktop View: Dedicated Scannable Mobile Bazaar & Authenticity QR Card */}
            <div
              onClick={() => setIsMobileBazaarModalOpen(true)}
              className="mt-4 hidden sm:flex bg-white rounded-2xl p-3.5 sm:p-4 border border-[#EAE4D8] shadow-xs items-center justify-between gap-3 cursor-pointer hover:border-[#B94D28]/40 hover:shadow-md transition-all group"
              role="button"
              tabIndex={0}
              title="Click to launch Mobile Bazaar & Authenticity QR Scanner"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setIsMobileBazaarModalOpen(true);
                }
              }}
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-12 h-12 bg-[#F8F5EF] p-1 rounded-xl border border-[#EAE4D8] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  {heroQrDataUrl ? (
                    <img src={heroQrDataUrl} alt="QR Code" className="w-full h-full object-contain" />
                  ) : (
                    <QrCode className="w-6 h-6 text-[#B94D28]" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-bold text-[#20242B] group-hover:text-[#B94D28] transition-colors">
                      Mobile Bazaar &amp; Authenticity QR
                    </span>
                    <span className="w-2 h-2 rounded-full bg-[#54745C] animate-pulse shrink-0" />
                  </div>
                  <p className="text-[11px] text-[#6B7280] truncate">
                    Scan on your phone or test live camera scanner
                  </p>
                </div>
              </div>
              <span className="px-3 py-1.5 rounded-xl bg-[#FAF0EA] text-[#B94D28] text-xs font-semibold shrink-0 group-hover:bg-[#B94D28] group-hover:text-white transition-colors">
                Open Scanner
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Four-Pillar Trust Strip (Warm Editorial Aesthetics) */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="bg-white rounded-2xl border border-[#EAE4D8] p-4 sm:p-8 shadow-xs grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:space-x-3.5 space-y-2 sm:space-y-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#FAF0EA] text-[#B94D28] flex items-center justify-center shrink-0">
              <HeartHandshake className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h4 className="font-serif text-xs sm:text-sm font-bold text-[#20242B]">Direct Maker Payouts</h4>
              <p className="text-[11px] sm:text-xs text-[#6B7280] mt-0.5 sm:mt-1 leading-relaxed">
                Zero middleman markups. Up to 85% goes directly to artisan families.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:space-x-3.5 space-y-2 sm:space-y-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#FAF0EA] text-[#54745C] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h4 className="font-serif text-xs sm:text-sm font-bold text-[#20242B]">100% Handcrafted</h4>
              <p className="text-[11px] sm:text-xs text-[#6B7280] mt-0.5 sm:mt-1 leading-relaxed">
                Authenticity inspected and certified by regional master guilds.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:space-x-3.5 space-y-2 sm:space-y-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#FAF0EA] text-[#D5A45D] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h4 className="font-serif text-xs sm:text-sm font-bold text-[#20242B]">Escrow Guarantee</h4>
              <p className="text-[11px] sm:text-xs text-[#6B7280] mt-0.5 sm:mt-1 leading-relaxed">
                Funds released to artisans only after you inspect and accept parcel.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:space-x-3.5 space-y-2 sm:space-y-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#FAF0EA] text-[#B94D28] flex items-center justify-center shrink-0">
              <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h4 className="font-serif text-xs sm:text-sm font-bold text-[#20242B]">Fragile Shipping</h4>
              <p className="text-[11px] sm:text-xs text-[#6B7280] mt-0.5 sm:mt-1 leading-relaxed">
                Custom packaging engineered for ceramics, wood, and textiles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Browse Indigenous Craft Categories */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-end justify-between border-b border-[#EAE4D8] pb-3 sm:pb-4">
            <div>
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#B94D28]">
                Explore By Tradition
              </span>
              <h2 className="font-serif text-xl sm:text-3xl font-bold text-[#20242B] mt-0.5 sm:mt-1">
                Browse Indigenous Crafts
              </h2>
            </div>
            <Link
              to="/products"
              className="text-xs font-semibold text-[#B94D28] hover:text-[#9C3D1D] flex items-center gap-1 group"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-6 text-center">
            {displayCategories.map((cat: any, idx: number) => {
              const img = cat.image_url || getCategoryFallback(cat.slug);
              return (
                <Link
                  key={idx}
                  to={`/products?category=${cat.slug}`}
                  className="group flex flex-col items-center p-1 sm:p-2 rounded-xl sm:rounded-2xl hover:bg-white transition-all duration-300"
                >
                  <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full overflow-hidden border border-[#EAE4D8] group-hover:border-[#B94D28] shadow-xs group-hover:shadow-md transition-all duration-300 mb-1.5 sm:mb-2">
                    <img
                      src={img}
                      alt={cat.name}
                      onError={(e) => {
                        const fb = getCategoryFallback(cat.slug);
                        if (e.currentTarget.src !== fb) e.currentTarget.src = fb;
                      }}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <span className="text-[11px] sm:text-xs font-medium text-[#20242B] group-hover:text-[#B94D28] line-clamp-1 transition-colors">
                    {cat.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Featured Master Guilds & Heritage Studios */}
      {featuredMakers.length > 0 && (
        <section className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#EAE4D8] p-4 sm:p-10 shadow-xs space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 sm:gap-4 border-b border-[#EAE4D8] pb-3 sm:pb-5">
              <div>
                <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#B94D28]">
                  The Craftspeople
                </span>
                <h2 className="font-serif text-xl sm:text-3xl font-bold text-[#20242B] mt-0.5 sm:mt-1">
                  Featured Master Guilds &amp; Heritage Studios
                </h2>
                <p className="text-[11px] sm:text-sm text-[#6B7280] mt-0.5 sm:mt-1">
                  Generational artisans preserving recognized Pakistani craft traditions.
                </p>
              </div>
              <Link
                to="/makers"
                className="text-xs font-semibold text-[#B94D28] hover:text-[#9C3D1D] flex items-center gap-1 shrink-0 group self-start sm:self-auto"
              >
                <span>View All Makers</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Mobile Swipeable Carousel / Desktop Grid */}
            <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0 scrollbar-none snap-x">
              {featuredMakers.map((maker) => (
                <Link
                  key={maker.id}
                  to={`/makers/${maker.slug}`}
                  className="min-w-[260px] sm:min-w-0 snap-start flex-1 group bg-[#F8F5EF]/70 hover:bg-white rounded-xl sm:rounded-2xl border border-[#EAE4D8] hover:border-[#B94D28]/40 hover:shadow-lg transition-all duration-300 p-4 sm:p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center space-x-3 sm:space-x-3.5 mb-3 sm:mb-4">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border border-[#EAE4D8] bg-white shrink-0 shadow-2xs">
                        <img
                          src={
                            maker.avatar_url ||
                            'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&crop=face&w=400&h=400&q=80'
                          }
                          alt={maker.business_name}
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&crop=face&w=400&h=400&q=80';
                          }}
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-serif text-xs sm:text-sm font-bold text-[#20242B] group-hover:text-[#B94D28] transition-colors truncate">
                          {maker.business_name}
                        </h3>
                        <p className="text-[10px] sm:text-[11px] text-[#6B7280] flex items-center mt-0.5">
                          <MapPin className="w-3 h-3 text-[#B94D28] mr-1 shrink-0" />
                          <span>{maker.location_city}</span>
                        </p>
                      </div>
                    </div>

                    <p className="text-[11px] sm:text-xs text-[#4B5563] line-clamp-2 leading-relaxed mb-3 sm:mb-4">
                      {maker.craft_description || 'Master generational artisan craft.'}
                    </p>
                  </div>

                  <div className="pt-2.5 sm:pt-3 border-t border-[#EAE4D8] flex items-center justify-between text-xs">
                    <span className="text-[#54745C] font-semibold flex items-center gap-1 text-[10px] sm:text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verified Maker
                    </span>
                    <span className="font-semibold text-[#B94D28] group-hover:translate-x-0.5 transition-transform flex items-center text-[11px] sm:text-xs">
                      Studio <ChevronRight className="w-3 h-3 ml-0.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. Trending Studio Harvest (4:5 Card Grid) */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-end justify-between border-b border-[#EAE4D8] pb-3 sm:pb-4">
            <div>
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#B94D28]">
                Handmade Highlights
              </span>
              <h2 className="font-serif text-xl sm:text-3xl font-bold text-[#20242B] mt-0.5 sm:mt-1">
                Trending Studio Creations
              </h2>
            </div>
            <Link
              to="/products"
              className="text-xs font-semibold text-[#B94D28] hover:text-[#9C3D1D] flex items-center gap-1 group"
            >
              <span>Explore All</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-6">
            {trendingProducts.slice(0, 6).map((item) => (
              <ProductCard key={item.id} product={item} compact={true} />
            ))}
          </div>
        </div>
      </section>

      {/* 6. Meet New Makers (Discovery Boost Feature) */}
      {newMakers.length > 0 && (
        <section className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="bg-[#FAF0EA]/60 rounded-2xl sm:rounded-3xl border border-[#B94D28]/20 p-4 sm:p-10 shadow-xs space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 sm:gap-4 border-b border-[#B94D28]/15 pb-3 sm:pb-5">
              <div>
                <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#B94D28]">
                  Artisan Discovery Boost
                </span>
                <h2 className="font-serif text-xl sm:text-3xl font-bold text-[#20242B] mt-0.5 sm:mt-1">
                  Meet Newly Onboarded Makers
                </h2>
                <p className="text-[11px] sm:text-sm text-[#4B5563] mt-0.5 sm:mt-1">
                  Empowering rural and independent artisan studios across all provinces of Pakistan.
                </p>
              </div>
              <Link
                to="/makers"
                className="text-xs font-semibold text-[#B94D28] hover:underline flex items-center gap-1 shrink-0 self-start sm:self-auto"
              >
                <span>Artisan Directory</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Mobile Swipeable Carousel / Desktop Grid */}
            <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0 scrollbar-none snap-x">
              {newMakers.map((maker) => (
                <div
                  key={maker.id}
                  className="min-w-[260px] sm:min-w-0 snap-start flex-1 bg-white rounded-xl sm:rounded-2xl border border-[#EAE4D8] p-4 sm:p-5 flex flex-col justify-between hover:shadow-lg hover:border-[#B94D28]/40 transition-all duration-300 group"
                >
                  <div>
                    <div className="flex items-center space-x-3 sm:space-x-3.5 mb-3 sm:mb-3.5">
                      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden border border-[#EAE4D8] bg-gray-100 shrink-0">
                        <img
                          src={
                            maker.avatar_url ||
                            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&crop=face&w=400&h=400&q=80'
                          }
                          alt={maker.business_name}
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&crop=face&w=400&h=400&q=80';
                          }}
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-serif text-xs sm:text-sm font-bold text-[#20242B] group-hover:text-[#B94D28] transition-colors truncate">
                          {maker.business_name}
                        </h3>
                        <p className="text-[10px] sm:text-[11px] text-[#6B7280] flex items-center">
                          <MapPin className="w-3 h-3 text-[#B94D28] mr-0.5 shrink-0" />
                          <span className="truncate">{maker.location_city}</span>
                        </p>
                      </div>
                    </div>

                    <p className="text-[11px] sm:text-xs text-[#4B5563] line-clamp-2 leading-relaxed mb-3 sm:mb-4">
                      {maker.bio || 'Preserving indigenous handcrafted traditions with authentic skill.'}
                    </p>
                  </div>

                  <div className="pt-2.5 sm:pt-3 border-t border-[#EAE4D8] flex items-center justify-between text-xs">
                    <span className="text-[#54745C] font-semibold text-[10px] sm:text-[11px] flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verified
                    </span>
                    <Link
                      to={`/makers/${maker.slug}`}
                      className="font-semibold text-[#B94D28] hover:underline flex items-center text-[11px] sm:text-xs"
                    >
                      <span>Visit Studio</span>
                      <ChevronRight className="w-3 h-3 ml-0.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7. Curated Craft Collections (Tabbed Live Filter) */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#EAE4D8] p-4 sm:p-10 shadow-xs space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 border-b border-[#EAE4D8] pb-3 sm:pb-5">
            <div>
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#B94D28]">
                Regional Hubs
              </span>
              <h2 className="font-serif text-xl sm:text-3xl font-bold text-[#20242B] mt-0.5 sm:mt-1">
                Curated Craft Collections
              </h2>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {DEFAULT_CATEGORY_TABS.map((tab) => (
                <button
                  key={tab.slug}
                  onClick={() => setActiveCategoryTab(tab.slug)}
                  className={`px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    activeCategoryTab === tab.slug
                      ? 'bg-[#B94D28] text-white shadow-xs'
                      : 'bg-[#F8F5EF] text-[#20242B] hover:bg-[#FAF0EA]'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>
          </div>

          {loadingCategoryProducts ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-[4/5] bg-[#F8F5EF] animate-pulse rounded-xl sm:rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-6">
              {categoryProducts.map((product) => (
                <ProductCard key={product.id} product={product} compact={true} />
              ))}
            </div>
          )}

          <div className="text-center pt-1 sm:pt-2">
            <Link
              to={`/products?category=${activeCategoryTab}`}
              className="text-xs font-semibold text-[#B94D28] hover:text-[#9C3D1D] inline-flex items-center space-x-1"
            >
              <span>Explore all creations in this craft collection</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 8. "Just For You" — Discovery Ranked 6-Column Grid */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-end justify-between border-b border-[#EAE4D8] pb-3 sm:pb-4">
            <div>
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#B94D28]">
                Handpicked For You
              </span>
              <h2 className="font-serif text-xl sm:text-3xl font-bold text-[#20242B] mt-0.5 sm:mt-1">
                Just For You
              </h2>
            </div>
            <Link
              to="/products"
              className="text-xs font-semibold text-[#B94D28] hover:text-[#9C3D1D] flex items-center gap-1 group"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-5">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                <div key={i} className="aspect-[4/5] bg-white animate-pulse rounded-xl sm:rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-6">
              {recommendedProducts.map((product) => (
                <ProductCard key={product.id} product={product} compact={true} />
              ))}
            </div>
          )}

          <div className="text-center pt-4 sm:pt-6">
            <Link
              to="/products"
              className="px-7 py-2.5 sm:px-8 sm:py-3 bg-white border border-[#B94D28] text-[#B94D28] hover:bg-[#B94D28] hover:text-white rounded-full text-xs font-semibold uppercase tracking-wider transition-all shadow-xs inline-block"
            >
              Load More Crafts
            </Link>
          </div>
        </div>
      </section>

      {/* 9. Floating Messages / Artisan Support Liaison */}
      <div className={`fixed bottom-18 md:bottom-6 right-3 sm:right-6 ${isChatOpen ? 'z-50' : 'z-30'}`}>
        {!isChatOpen ? (
          <button
            type="button"
            onClick={() => setIsChatOpen(true)}
            aria-label="Open artisan chat"
            className="flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white text-[#20242B] rounded-full border border-[#EAE4D8] hover:border-[#B94D28] hover:text-[#B94D28] shadow-lg transition-all hover:scale-105 cursor-pointer text-xs font-semibold"
          >
            <MessageCircle className="w-4 h-4 text-[#B94D28]" />
            <span className="hidden xs:inline">Artisan Chat</span>
            <span className="w-2 h-2 rounded-full bg-[#54745C] animate-pulse" />
          </button>
        ) : (
          <div className="w-[calc(100vw-2rem)] max-w-sm bg-white rounded-2xl shadow-2xl border border-[#EAE4D8] overflow-hidden flex flex-col h-96 animate-in slide-in-from-bottom-5 duration-200">
            {/* Chat Header */}
            <div className="p-3.5 sm:p-4 bg-[#B94D28] text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-white text-[#B94D28] font-bold flex items-center justify-center text-xs">
                  D
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xs">Artisan Workshop Support</h3>
                  <p className="text-[10px] text-amber-100">Direct Craft Liaison</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsChatOpen(false)}
                className="p-1 rounded-lg hover:bg-white/20 transition-colors text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-3.5 overflow-y-auto space-y-3 text-xs bg-[#F8F5EF]">
              {messagesList.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      m.sender === 'user'
                        ? 'bg-[#B94D28] text-white rounded-br-none'
                        : 'bg-white text-[#20242B] border border-[#EAE4D8] rounded-bl-none shadow-2xs'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 border-t border-[#EAE4D8] bg-white flex items-center space-x-2"
            >
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Ask about craft, materials, dimensions..."
                className="flex-1 px-3 py-2 bg-[#F8F5EF] border border-[#EAE4D8] rounded-xl text-xs focus:outline-hidden focus:border-[#B94D28]"
              />
              <button
                type="submit"
                className="p-2 bg-[#B94D28] hover:bg-[#9C3D1D] text-white rounded-xl transition-colors cursor-pointer"
                aria-label="Send message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Real Mobile Bazaar & Authenticity QR Scanner Modal */}
      <MobileBazaarModal
        isOpen={isMobileBazaarModalOpen}
        onClose={() => setIsMobileBazaarModalOpen(false)}
      />
    </div>
  );
};
