import React, { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronUp } from 'lucide-react';

/**
 * Global utility to scroll document to top smoothly or instantly.
 */
export const scrollToPageTop = (smooth = false) => {
  const behavior: ScrollBehavior = smooth ? 'smooth' : 'instant';
  try {
    window.scrollTo({ top: 0, left: 0, behavior });
  } catch {
    window.scrollTo(0, 0);
  }
  if (document.documentElement) {
    document.documentElement.scrollTop = 0;
  }
  if (document.body) {
    document.body.scrollTop = 0;
  }
};

/**
 * ScrollToTop Component
 * 1. Resets scroll position to (0, 0) on any route, search param, or hash change.
 * 2. Catches clicks on navigation links (including footer links pointing to the current page).
 * 3. Catches tab switches (elements with role="tab" or [data-tab]).
 * 4. Displays a modern floating "Back to Top" button when scrolled down > 250px on any device.
 */
export const ScrollToTop: React.FC = () => {
  const { pathname, search, hash } = useLocation();
  const [showFloatingButton, setShowFloatingButton] = useState(false);

  // 1. Reset scroll on navigation (route, search query, or hash changes)
  useEffect(() => {
    // If it's a hash anchor on the same page, allow browser default anchor scrolling
    if (hash && hash.length > 1) {
      const el = document.getElementById(hash.substring(1));
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }

    // Otherwise unconditionally scroll to top
    scrollToPageTop(false);

    // Double-check on next animation frame in case async content alters layout
    const rafId = requestAnimationFrame(() => {
      scrollToPageTop(false);
    });

    return () => cancelAnimationFrame(rafId);
  }, [pathname, search, hash]);

  // 2. Global listener for link and tab clicks
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest(
        'a, button[role="tab"], button[data-tab], [role="tab"], footer a, .footer-link'
      );
      if (!target) return;

      const href = target.getAttribute('href');
      // If it's an internal hash link like #specs, do not reset to top
      if (href && href.startsWith('#') && href.length > 1) {
        return;
      }

      // If it's an external link or mailto/tel, ignore
      if (href && (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('http://') || href.startsWith('https://'))) {
        return;
      }

      // For all internal route links and tab clicks, ensure scroll to top
      // Wait a tick for React state/route to register
      setTimeout(() => {
        scrollToPageTop(true);
      }, 20);
    };

    document.addEventListener('click', handleGlobalClick, { passive: true });
    return () => {
      document.removeEventListener('click', handleGlobalClick);
    };
  }, []);

  // 3. Monitor scroll position to show/hide the floating Back to Top button
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
      setShowFloatingButton(scrollY > 280);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBackToTop = useCallback(() => {
    scrollToPageTop(true);
  }, []);

  const isHomePage = pathname === '/';

  return (
    <>
      {/* Floating Back to Top Button (Positioned safely above chat on home page, and above mobile bottom nav) */}
      <button
        type="button"
        onClick={handleBackToTop}
        aria-label="Scroll back to top"
        title="Scroll to top / اوپر جائیں"
        className={`fixed z-40 right-4 sm:right-6 transition-all duration-300 ease-out cursor-pointer flex items-center justify-center rounded-full shadow-lg border border-[#EAE4D8] bg-[#B94D28] hover:bg-[#9C3D1D] text-white hover:scale-110 active:scale-95 hover:shadow-xl focus:outline-hidden focus:ring-2 focus:ring-[#B94D28]/30 ${
          showFloatingButton
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-6 pointer-events-none'
        } ${
          isHomePage
            ? 'bottom-34 md:bottom-20 w-10 h-10 sm:w-11 sm:h-11'
            : 'bottom-20 md:bottom-6 w-10 h-10 sm:w-11 sm:h-11'
        }`}
      >
        <ChevronUp className="w-5 h-5 stroke-[2.5]" />
      </button>
    </>
  );
};

export default ScrollToTop;
