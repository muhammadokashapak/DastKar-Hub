import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart, MapPin, Truck, Mail, Layers } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1C2028] text-gray-300 text-sm mt-auto border-t border-gray-800">
      {/* Artisan Value Bar */}
      <div className="border-b border-gray-800 py-6 sm:py-10 px-3.5 sm:px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
          <div className="flex flex-col sm:flex-row items-start sm:space-x-3.5 space-y-1.5 sm:space-y-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-950/60 border border-amber-800/40 text-amber-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-xs sm:text-base">Authentic Makers</h4>
              <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1 leading-relaxed">
                Created by verified Pakistani artisans preserving generational craft.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:space-x-3.5 space-y-1.5 sm:space-y-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-xs sm:text-base">Regional Heritage</h4>
              <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1 leading-relaxed">
                Multani Kashigari, Chinioti Rosewood, Sindhi Ajrak &amp; Swat Pashmina.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:space-x-3.5 space-y-1.5 sm:space-y-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-sky-950/60 border border-sky-800/40 text-sky-400 flex items-center justify-center shrink-0">
              <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-xs sm:text-base">Safe Delivery</h4>
              <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1 leading-relaxed">
                Specialized craft packaging with courier tracking and Cash on Delivery.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:space-x-3.5 space-y-1.5 sm:space-y-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-rose-950/60 border border-rose-800/40 text-rose-400 flex items-center justify-center shrink-0">
              <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-xs sm:text-base">Maker Economics</h4>
              <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1 leading-relaxed">
                Over 85% goes straight to the independent maker families.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 gap-6 sm:gap-8">
        <div className="col-span-2 sm:col-span-2">
          <Link to="/" className="flex items-center space-x-2.5 mb-4 group">
            <div className="w-8 h-8 rounded-lg bg-[#C25E34] text-white flex items-center justify-center group-hover:bg-[#A0441E] transition-colors">
              <Layers className="w-4 h-4 text-amber-200" />
            </div>
            <span className="text-xl font-serif font-bold text-white tracking-tight">
              DastKar<span className="text-[#C25E34]">Hub</span>
            </span>
          </Link>
          <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
            DastKar Hub is the digital home for Pakistan&apos;s independent makers, bridging indigenous craft workshops with patrons seeking authentic handmade treasures.
          </p>
          <div className="mt-4 flex items-center space-x-3 text-xs text-gray-400">
            <span>Currency:</span>
            <span className="px-2 py-0.5 rounded bg-gray-800 text-amber-300 font-semibold border border-gray-700">
              PKR (₨)
            </span>
            <span className="text-gray-500">|</span>
            <span>Pakistan</span>
          </div>
        </div>

        <div>
          <h5 className="font-semibold text-white text-xs uppercase tracking-wider mb-3">Explore Craft</h5>
          <ul className="space-y-2 text-xs">
            <li><Link to="/products?category=home-decor" className="hover:text-amber-300 transition-colors">Home Décor</Link></li>
            <li><Link to="/products?category=ceramics-pottery" className="hover:text-amber-300 transition-colors">Multani Blue Pottery</Link></li>
            <li><Link to="/products?category=fashion-wearables" className="hover:text-amber-300 transition-colors">Handloom &amp; Ajrak</Link></li>
            <li><Link to="/products?category=jewelry-accessories" className="hover:text-amber-300 transition-colors">Silver &amp; Gemstones</Link></li>
            <li><Link to="/makers" className="hover:text-amber-300 transition-colors">Artisan Directory</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="font-semibold text-white text-xs uppercase tracking-wider mb-3">For Makers</h5>
          <ul className="space-y-2 text-xs">
            <li><Link to="/auth?mode=register&role=seller" className="hover:text-amber-300 transition-colors">Open Maker Storefront</Link></li>
            <li><Link to="/seller/dashboard" className="hover:text-amber-300 transition-colors">Seller Dashboard</Link></li>
            <li><Link to="/makers" className="hover:text-amber-300 transition-colors">Artisan Community</Link></li>
            <li><Link to="/products" className="hover:text-amber-300 transition-colors">Craft Standards</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="font-semibold text-white text-xs uppercase tracking-wider mb-3">Trust &amp; Support</h5>
          <ul className="space-y-2 text-xs">
            <li><Link to="/support" className="hover:text-amber-300 transition-colors">Help &amp; Support</Link></li>
            <li><Link to="/account/orders" className="hover:text-amber-300 transition-colors">Track Order</Link></li>
            <li><Link to="/cart" className="hover:text-amber-300 transition-colors">Shopping Bag</Link></li>
            <li>
              <Link to="/ethics-charter" className="hover:text-amber-300 transition-colors">
                Handcrafted Guarantee
              </Link>
            </li>
            <li>
              <a
                href="mailto:support@dastkarhub.pk"
                className="hover:text-amber-300 flex items-center gap-1.5 transition-colors"
                title="Email DastKar Hub Support"
              >
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>support@dastkarhub.pk</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 py-6 px-4 pb-20 md:pb-6 text-center text-xs text-gray-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 DastKar Hub (Pvt) Ltd. Preserving Pakistan&apos;s Handcrafted Heritage.</p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link to="/terms" className="hover:text-amber-300 transition-colors">
              Terms of Service
            </Link>
            <Link to="/privacy" className="hover:text-amber-300 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/ethics-charter" className="hover:text-amber-300 transition-colors">
              Artisan Ethics Charter
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
