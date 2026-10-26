import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, Store, Heart, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../../lib/cartContext';
import { useWishlist } from '../../lib/wishlistContext';
import { useAuth } from '../../lib/authContext';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { totalItems } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, isSeller, isAdmin } = useAuth();

  const pathname = location.pathname;
  const isWishlistTab = location.search.includes('tab=wishlist') || pathname === '/wishlist';

  // 5 refined, high-value mobile tabs for clean spacing on small screens
  const navItems = [
    {
      label: 'Home',
      icon: Home,
      path: '/',
      isActive: pathname === '/',
    },
    {
      label: 'Bazaar',
      icon: Compass,
      path: '/products',
      isActive: pathname.startsWith('/products') && !isWishlistTab,
    },
    {
      label: 'Artisans',
      icon: Store,
      path: '/makers',
      isActive: pathname.startsWith('/makers'),
    },
    {
      label: 'Saved',
      icon: Heart,
      path: '/account/orders?tab=wishlist',
      badge: wishlistCount > 0 ? wishlistCount : null,
      isActive: isWishlistTab,
    },
    {
      label: 'Basket',
      icon: ShoppingBag,
      path: '/cart',
      badge: totalItems > 0 ? totalItems : null,
      isActive: pathname === '/cart',
    },
    {
      label: user ? (isSeller ? 'Studio' : isAdmin ? 'Admin' : 'Account') : 'Sign In',
      icon: User,
      path: user
        ? isSeller
          ? '/seller/dashboard'
          : isAdmin
          ? '/admin/dashboard'
          : '/account/orders'
        : '/auth?mode=login',
      isActive:
        pathname.startsWith('/seller') ||
        pathname.startsWith('/admin') ||
        (pathname.startsWith('/account') && !isWishlistTab) ||
        pathname.startsWith('/auth'),
    },
  ];

  return (
    <aside
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#EAE4D8] shadow-[0_-4px_16px_rgba(32,36,43,0.08)] pb-[max(env(safe-area-inset-bottom),0px)]"
    >
      <div className="grid grid-cols-6 items-center justify-around h-14 px-1 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex flex-col items-center justify-center h-full py-1 text-center transition-all relative group cursor-pointer ${
                item.isActive ? 'text-[#B94D28] font-bold' : 'text-[#6B7280] hover:text-[#20242B] font-medium'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon
                  className={`w-5 h-5 transition-transform group-active:scale-90 ${
                    item.isActive && (item.label === 'Saved' || item.label === 'Basket')
                      ? 'fill-current'
                      : ''
                  }`}
                />
                {item.badge !== null && item.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 px-1 min-w-[15px] h-3.5 bg-[#B94D28] text-white text-[9px] font-extrabold rounded-full flex items-center justify-center shadow-xs">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] tracking-tight mt-0.5 truncate max-w-full ${item.isActive ? 'text-[#B94D28] font-bold' : ''}`}>
                {item.label}
              </span>
              {item.isActive && (
                <span className="w-1 h-1 rounded-full bg-[#B94D28] mt-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </aside>
  );
};
