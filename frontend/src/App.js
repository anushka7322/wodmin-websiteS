import React, { Suspense, lazy } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FloatingWhatsApp from "@/components/layout/FloatingWhatsApp";
import ScrollToTop from "@/components/layout/ScrollToTop";

const Home = lazy(() => import("@/pages/Home"));
const About = lazy(() => import("@/pages/About"));
const Categories = lazy(() => import("@/pages/Categories"));
const CategoryDetail = lazy(() => import("@/pages/CategoryDetail"));
const Collections = lazy(() => import("@/pages/Collections"));
const CollectionDetail = lazy(() => import("@/pages/CollectionDetail"));
const Products = lazy(() => import("@/pages/Products"));
const ProductDetail = lazy(() => import("@/pages/ProductDetail"));
const Wholesale = lazy(() => import("@/pages/Wholesale"));
const Dealer = lazy(() => import("@/pages/Dealer"));
const Gallery = lazy(() => import("@/pages/Gallery"));
const Blogs = lazy(() => import("@/pages/Blogs"));
const BlogDetail = lazy(() => import("@/pages/BlogDetail"));
const Faqs = lazy(() => import("@/pages/Faqs"));
const Contact = lazy(() => import("@/pages/Contact"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const Terms = lazy(() => import("@/pages/Terms"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const Wishlist = lazy(() => import("@/pages/Wishlist"));
const Compare = lazy(() => import("@/pages/Compare"));

// Admin
const AdminLogin = lazy(() => import("@/pages/admin/Login"));
const AdminLayout = lazy(() => import("@/pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("@/pages/admin/Dashboard"));
const AdminProducts = lazy(() => import("@/pages/admin/Products"));
const AdminResource = lazy(() => import("@/pages/admin/ResourceManager"));
const AdminEnquiries = lazy(() => import("@/pages/admin/EnquiriesList"));
const AdminBanner = lazy(() => import("@/pages/admin/Banner"));

const Loader = () => (
  <div className="container-wodmin py-24 text-center text-brand-mocha" data-testid="route-loader">Loading…</div>
);

function PublicShell() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  if (isAdmin) {
    return (
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="banner" element={<AdminBanner />} />
            <Route path="categories" element={<AdminResource resource="categories" />} />
            <Route path="collections" element={<AdminResource resource="collections" />} />
            <Route path="blogs" element={<AdminResource resource="blogs" />} />
            <Route path="testimonials" element={<AdminResource resource="testimonials" />} />
            <Route path="faqs" element={<AdminResource resource="faqs" />} />
            <Route path="gallery" element={<AdminResource resource="gallery" />} />
            <Route path="enquiries" element={<AdminEnquiries resource="enquiries" />} />
            <Route path="wholesale" element={<AdminEnquiries resource="wholesale-enquiries" />} />
            <Route path="dealers" element={<AdminEnquiries resource="dealer-applications" />} />
            <Route path="callbacks" element={<AdminEnquiries resource="callback-requests" />} />
            <Route path="newsletter" element={<AdminEnquiries resource="newsletter" />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    );
  }
  return (
    <>
      <Header />
      <main>
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/category/:slug" element={<CategoryDetail />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/collection/:slug" element={<CollectionDetail />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/wholesale" element={<Wholesale />} />
            <Route path="/dealer" element={<Dealer />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/blog/:slug" element={<BlogDetail />} />
            <Route path="/faqs" element={<Faqs />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}

function App() {
  return (
    <div className="App min-h-screen bg-brand-cream">
      <BrowserRouter>
        <ScrollToTop />
        <PublicShell />
        <Toaster richColors position="top-right" />
      </BrowserRouter>
    </div>
  );
}

export default App;
