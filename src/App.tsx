import { Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { HomePage } from "@/pages/HomePage";
import { DIYPlansPage } from "@/pages/DIYPlansPage";
import { DIYProductPage } from "@/pages/DIYProductPage";
import { CoachingPage } from "@/pages/CoachingPage";
import { CoachingProductPage } from "@/pages/CoachingProductPage";
import { ConsultationsPage } from "@/pages/ConsultationsPage";
import { BlogPage } from "@/pages/BlogPage";
import { BlogPostPage } from "@/pages/BlogPostPage";
import { WhyUsPage } from "@/pages/WhyUsPage";
import { ContactPage } from "@/pages/ContactPage";
import { B2BPage } from "@/pages/B2BPage";
import { RecommendedProductsPage } from "@/pages/RecommendedProductsPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { DynamicPage } from "@/pages/DynamicPage";
import { CheckoutPage } from "@/pages/CheckoutPage";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { ProtectedRoute } from "@/components/admin/ProtectedRoute";
import { AdminLoginPage } from "@/pages/admin/AdminLoginPage";
import { AdminProductsPage } from "@/pages/admin/AdminProductsPage";
import { AdminProductFormPage } from "@/pages/admin/AdminProductFormPage";
import { AdminCollectionsPage } from "@/pages/admin/AdminCollectionsPage";
import { AdminCollectionFormPage } from "@/pages/admin/AdminCollectionFormPage";
import { AdminPagesPage } from "@/pages/admin/AdminPagesPage";
import { AdminPageBuilderPage } from "@/pages/admin/AdminPageBuilderPage";
import { AdminConsultationsPage } from "@/pages/admin/AdminConsultationsPage";
import { AdminPaymentsPage } from "@/pages/admin/AdminPaymentsPage";
import { AdminCoachingPage } from "@/pages/admin/AdminCoachingPage";
import { AdminImportPage } from "@/pages/admin/AdminImportPage";
import { AdminInquiriesPage } from "@/pages/admin/AdminInquiriesPage";
import { AdminEmailsPage } from "@/pages/admin/AdminEmailsPage";
import { AdminBlogPage } from "@/pages/admin/AdminBlogPage";
import { AdminBlogFormPage } from "@/pages/admin/AdminBlogFormPage";
import { AdminAccreditationsPage } from "@/pages/admin/AdminAccreditationsPage";

export function App() {
  return (
    <Routes>
      {/* Public site */}
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />

        <Route path="/diy-plans" element={<DIYPlansPage />} />
        <Route path="/diy-plans/:slug" element={<DIYProductPage />} />

        <Route path="/coaching" element={<CoachingPage />} />
        <Route path="/coaching/:slug" element={<CoachingProductPage />} />

        <Route path="/consultations" element={<ConsultationsPage />} />

        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />

        <Route path="/about" element={<DynamicPage slug="about" />} />
        <Route path="/my-story" element={<DynamicPage slug="my-story" />} />
        <Route path="/why-us" element={<WhyUsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/how-it-works" element={<DynamicPage slug="how-it-works" />} />
        <Route path="/faq" element={<DynamicPage slug="faq" />} />
        <Route path="/partners" element={<DynamicPage slug="partners" />} />
        <Route path="/b2b" element={<B2BPage />} />
        <Route path="/recommended" element={<RecommendedProductsPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/privacy" element={<DynamicPage slug="privacy-policy" />} />
        <Route path="/terms" element={<DynamicPage slug="refund-policy" />} />
        <Route path="/coaching-agreement" element={<DynamicPage slug="coaching-agreement" />} />

        {/* Dynamic, admin-built pages */}
        <Route path="/p/:slug" element={<DynamicPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Admin */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminProductsPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="products/:id" element={<AdminProductFormPage />} />
        <Route path="collections" element={<AdminCollectionsPage />} />
        <Route path="collections/:id" element={<AdminCollectionFormPage />} />
        <Route path="pages" element={<AdminPagesPage />} />
        <Route path="pages/:id" element={<AdminPageBuilderPage />} />
        <Route path="coaching" element={<AdminCoachingPage />} />
        <Route path="consultations" element={<AdminConsultationsPage />} />
        <Route path="payments" element={<AdminPaymentsPage />} />
        <Route path="import" element={<AdminImportPage />} />
        <Route path="inquiries" element={<AdminInquiriesPage />} />
        <Route path="emails" element={<AdminEmailsPage />} />
        <Route path="blog" element={<AdminBlogPage />} />
        <Route path="blog/:id" element={<AdminBlogFormPage />} />
        <Route path="accreditations" element={<AdminAccreditationsPage />} />
      </Route>
    </Routes>
  );
}
