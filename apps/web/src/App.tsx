import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './lib/authContext';
import { CartProvider } from './lib/cartContext';
import { WishlistProvider } from './lib/wishlistContext';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { MobileBottomNav } from './components/layout/MobileBottomNav';

// Pages
import { HomePage } from './pages/HomePage';
import { ProductListPage } from './pages/ProductListPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { MakersDirectoryPage } from './pages/MakersDirectoryPage';
import { MakerProfilePage } from './pages/MakerProfilePage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { CustomerDashboardPage } from './pages/CustomerDashboardPage';
import { SellerDashboardPage } from './pages/SellerDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AuthPage } from './pages/AuthPage';
import { HelpSupportPage } from './pages/HelpSupportPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { ArtisanEthicsCharterPage } from './pages/ArtisanEthicsCharterPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ScrollToTop } from './components/common/ScrollToTop';
import { ArtisanChatWidget } from './components/common/ArtisanChatWidget';

export function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <BrowserRouter>
              <ScrollToTop />
              <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-gray-900 pb-16 md:pb-0">
                <Navbar />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/products" element={<ProductListPage />} />
                    <Route path="/products/:slug" element={<ProductDetailPage />} />
                    <Route path="/makers" element={<MakersDirectoryPage />} />
                    <Route path="/makers/:slug" element={<MakerProfilePage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/account/orders" element={<CustomerDashboardPage />} />
                    <Route path="/wishlist" element={<CustomerDashboardPage />} />
                    <Route path="/seller/dashboard" element={<SellerDashboardPage />} />
                    <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/support" element={<HelpSupportPage />} />
                    <Route path="/help" element={<HelpSupportPage />} />
                    <Route path="/contact" element={<HelpSupportPage />} />
                    <Route path="/terms" element={<TermsPage />} />
                    <Route path="/privacy" element={<PrivacyPolicyPage />} />
                    <Route path="/ethics-charter" element={<ArtisanEthicsCharterPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </main>
                <Footer />
                <ArtisanChatWidget />
                <MobileBottomNav />
              </div>
            </BrowserRouter>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;

