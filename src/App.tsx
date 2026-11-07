import { lazy, Suspense } from "react";
import { Routes, Route, useParams } from "react-router-dom";
import { Navigate } from "@/lib/langRouting";
import { Layout } from "@/components/layout/Layout";
import { HomePage } from "@/pages/HomePage";

import { SELF_GUIDED_PATH, IR_QUIZ_PATH, MENO_QUIZ_PATH, FREE_ASSESSMENT_SLUG, LIV_AT_WORK_PATH, CORPORATE_PRODUCT_SLUG, BIO_PATH, INSULIN_RESET_GUIDE_PATH, TRACKER_PATH } from "@/lib/routes";

const DIYPlansPage = lazy(() => import("@/pages/DIYPlansPage").then((m) => ({ default: m.DIYPlansPage })));
const DIYProductPage = lazy(() => import("@/pages/DIYProductPage").then((m) => ({ default: m.DIYProductPage })));
const ShopPage = lazy(() => import("@/pages/ShopPage").then((m) => ({ default: m.ShopPage })));
const CoachingPage = lazy(() => import("@/pages/CoachingPage").then((m) => ({ default: m.CoachingPage })));
const CoachingProductPage = lazy(() => import("@/pages/CoachingProductPage").then((m) => ({ default: m.CoachingProductPage })));
const ConsultationsPage = lazy(() => import("@/pages/ConsultationsPage").then((m) => ({ default: m.ConsultationsPage })));
const BlogPage = lazy(() => import("@/pages/BlogPage").then((m) => ({ default: m.BlogPage })));
const BlogPostPage = lazy(() => import("@/pages/BlogPostPage").then((m) => ({ default: m.BlogPostPage })));
const WhyUsPage = lazy(() => import("@/pages/WhyUsPage").then((m) => ({ default: m.WhyUsPage })));
const ContactPage = lazy(() => import("@/pages/ContactPage").then((m) => ({ default: m.ContactPage })));
const RecommendedProductsPage = lazy(() => import("@/pages/RecommendedProductsPage").then((m) => ({ default: m.RecommendedProductsPage })));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage })));
const DynamicPage = lazy(() => import("@/pages/DynamicPage").then((m) => ({ default: m.DynamicPage })));
const CheckoutPage = lazy(() => import("@/pages/CheckoutPage").then((m) => ({ default: m.CheckoutPage })));
const CheckoutSuccessPage = lazy(() => import("@/pages/CheckoutSuccessPage").then((m) => ({ default: m.CheckoutSuccessPage })));
const CheckoutCancelPage = lazy(() => import("@/pages/CheckoutCancelPage").then((m) => ({ default: m.CheckoutCancelPage })));
const ApplyPage = lazy(() => import("@/pages/ApplyPage").then((m) => ({ default: m.ApplyPage })));
const CollectionPage = lazy(() => import("@/pages/CollectionPage").then((m) => ({ default: m.CollectionPage })));
const AdminLayout = lazy(() => import("@/components/admin/AdminLayout").then((m) => ({ default: m.AdminLayout })));
const ProtectedRoute = lazy(() => import("@/components/admin/ProtectedRoute").then((m) => ({ default: m.ProtectedRoute })));
const AdminLoginPage = lazy(() => import("@/pages/admin/AdminLoginPage").then((m) => ({ default: m.AdminLoginPage })));
const AdminProductsPage = lazy(() => import("@/pages/admin/AdminProductsPage").then((m) => ({ default: m.AdminProductsPage })));
const AdminProductFormPage = lazy(() => import("@/pages/admin/AdminProductFormPage").then((m) => ({ default: m.AdminProductFormPage })));
const AdminCollectionsPage = lazy(() => import("@/pages/admin/AdminCollectionsPage").then((m) => ({ default: m.AdminCollectionsPage })));
const AdminCollectionFormPage = lazy(() => import("@/pages/admin/AdminCollectionFormPage").then((m) => ({ default: m.AdminCollectionFormPage })));
const AdminPagesPage = lazy(() => import("@/pages/admin/AdminPagesPage").then((m) => ({ default: m.AdminPagesPage })));
const AdminPageBuilderPage = lazy(() => import("@/pages/admin/AdminPageBuilderPage").then((m) => ({ default: m.AdminPageBuilderPage })));
const AdminPageTextPage = lazy(() => import("@/pages/admin/AdminPageTextPage").then((m) => ({ default: m.AdminPageTextPage })));
const AdminConsultationsPage = lazy(() => import("@/pages/admin/AdminConsultationsPage").then((m) => ({ default: m.AdminConsultationsPage })));
const AdminPaymentsPage = lazy(() => import("@/pages/admin/AdminPaymentsPage").then((m) => ({ default: m.AdminPaymentsPage })));
const AdminCoachingPage = lazy(() => import("@/pages/admin/AdminCoachingPage").then((m) => ({ default: m.AdminCoachingPage })));
const AdminImportPage = lazy(() => import("@/pages/admin/AdminImportPage").then((m) => ({ default: m.AdminImportPage })));
const AdminInquiriesPage = lazy(() => import("@/pages/admin/AdminInquiriesPage").then((m) => ({ default: m.AdminInquiriesPage })));
const AdminEmailsPage = lazy(() => import("@/pages/admin/AdminEmailsPage").then((m) => ({ default: m.AdminEmailsPage })));
const AdminNewsletterPage = lazy(() => import("@/pages/admin/AdminNewsletterPage").then((m) => ({ default: m.AdminNewsletterPage })));
const AdminBlogPage = lazy(() => import("@/pages/admin/AdminBlogPage").then((m) => ({ default: m.AdminBlogPage })));
const AdminBlogFormPage = lazy(() => import("@/pages/admin/AdminBlogFormPage").then((m) => ({ default: m.AdminBlogFormPage })));
const AdminAccreditationsPage = lazy(() => import("@/pages/admin/AdminAccreditationsPage").then((m) => ({ default: m.AdminAccreditationsPage })));
const AdminNutritionIssuesPage = lazy(() => import("@/pages/admin/AdminNutritionIssuesPage").then((m) => ({ default: m.AdminNutritionIssuesPage })));
const AdminRecommendedProductsPage = lazy(() => import("@/pages/admin/AdminRecommendedProductsPage").then((m) => ({ default: m.AdminRecommendedProductsPage })));
const AdminB2bPillarsPage = lazy(() => import("@/pages/admin/AdminB2bPillarsPage").then((m) => ({ default: m.AdminB2bPillarsPage })));
const InsulinResetGuidePage = lazy(() => import("@/pages/InsulinResetGuidePage").then((m) => ({ default: m.InsulinResetGuidePage })));
const TrackerPage = lazy(() => import("@/pages/TrackerPage").then((m) => ({ default: m.TrackerPage })));
const LivAtWorkPage = lazy(() => import("@/pages/LivAtWorkPage").then((m) => ({ default: m.LivAtWorkPage })));
const InsulinQuizPage = lazy(() => import("@/pages/InsulinQuizPage").then((m) => ({ default: m.InsulinQuizPage })));
const MenopauseQuizPage = lazy(() => import("@/pages/MenopauseQuizPage").then((m) => ({ default: m.MenopauseQuizPage })));
const BioPage = lazy(() => import("@/pages/BioPage").then((m) => ({ default: m.BioPage })));
const AdminQuizLeadsPage = lazy(() => import("@/pages/admin/AdminQuizLeadsPage").then((m) => ({ default: m.AdminQuizLeadsPage })));

const publicRoutes = (
  <>
        <Route index element={<HomePage />} />

        <Route path={SELF_GUIDED_PATH.slice(1)} element={<DIYPlansPage />} />
        <Route path={`${SELF_GUIDED_PATH.slice(1)}/:slug`} element={<DIYProductPage />} />
        {/* Old /diy-plans addresses (also 301-redirected in vercel.json) */}
        <Route path="diy-plans" element={<Navigate to={SELF_GUIDED_PATH} replace />} />
        <Route path="diy-plans/:slug" element={<LegacyDiyRedirect />} />

        <Route path="shop" element={<ShopPage />} />
        <Route path="shop/:slug" element={<DIYProductPage />} />

        <Route path="coaching" element={<CoachingPage />} />
        <Route path="coaching/:slug" element={<CoachingProductPage />} />

        {/* Retired free assessment product: its traffic goes to the quiz */}
        <Route path={"apply/"+FREE_ASSESSMENT_SLUG} element={<Navigate to={IR_QUIZ_PATH} replace />} />
        <Route path={"coaching/"+FREE_ASSESSMENT_SLUG} element={<Navigate to={IR_QUIZ_PATH} replace />} />
        <Route path="apply/:slug" element={<ApplyPage />} />

        <Route path="consultations" element={<ConsultationsPage />} />

        <Route path="blog" element={<BlogPage />} />
        <Route path="blog/:slug" element={<BlogPostPage />} />

        <Route path="about" element={<DynamicPage slug="about" />} />
        <Route path="my-story" element={<DynamicPage slug="my-story" />} />
        <Route path="why-us" element={<WhyUsPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="how-it-works" element={<DynamicPage slug="how-it-works" />} />
        <Route path="faq" element={<DynamicPage slug="faq" />} />
        <Route path="partners" element={<DynamicPage slug="partners" />} />
        <Route path={LIV_AT_WORK_PATH.slice(1)} element={<LivAtWorkPage />} />
        {/* The old B2B page and the corporate coaching product now live on one landing page */}
        <Route path="b2b" element={<Navigate to={LIV_AT_WORK_PATH} replace />} />
        <Route path={"coaching/" + CORPORATE_PRODUCT_SLUG} element={<Navigate to={LIV_AT_WORK_PATH} replace />} />
        <Route path={"apply/" + CORPORATE_PRODUCT_SLUG} element={<Navigate to={LIV_AT_WORK_PATH} replace />} />
        <Route path="recommended" element={<RecommendedProductsPage />} />
        <Route path="collections/:slug" element={<CollectionPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="checkout/success" element={<CheckoutSuccessPage />} />
        <Route path="checkout/cancel" element={<CheckoutCancelPage />} />
        <Route path="privacy" element={<DynamicPage slug="privacy-policy" />} />
        <Route path="terms" element={<DynamicPage slug="refund-policy" />} />
        <Route path="coaching-agreement" element={<DynamicPage slug="coaching-agreement" />} />

        {/* Dynamic, admin-built pages */}
        <Route path="p/link-in-bio" element={<Navigate to={BIO_PATH} replace />} />
        <Route path="p/:slug" element={<DynamicPage />} />

        <Route path="*" element={<NotFoundPage />} />
  </>
);

export function App() {
  return (
    <Suspense fallback={null}>
    <Routes>
      {/* Lead-gen quiz: standalone (no site header/footer), linked from ads and social only */}
      <Route path={IR_QUIZ_PATH} element={<InsulinQuizPage />} />
      <Route path={`/ar${IR_QUIZ_PATH}`} element={<InsulinQuizPage />} />
      <Route path={MENO_QUIZ_PATH} element={<MenopauseQuizPage />} />
      <Route path={`/ar${MENO_QUIZ_PATH}`} element={<MenopauseQuizPage />} />

      {/* Link-in-bio: standalone (no site header/footer) */}
      <Route path={BIO_PATH} element={<BioPage />} />
      <Route path={`/ar${BIO_PATH}`} element={<BioPage />} />

      {/* Email-gated free guide: standalone (no site header/footer) */}
      <Route path={INSULIN_RESET_GUIDE_PATH} element={<InsulinResetGuidePage />} />
      <Route path={`/ar${INSULIN_RESET_GUIDE_PATH}`} element={<InsulinResetGuidePage />} />

      {/* Book tracker downloads: standalone (no site header/footer) */}
      <Route path={TRACKER_PATH} element={<TrackerPage />} />
      <Route path={`/ar${TRACKER_PATH}`} element={<TrackerPage />} />

      {/* Public site: English at the root, Arabic mirrored under /ar */}
      <Route element={<Layout />}>{publicRoutes}</Route>
      <Route path="ar" element={<Layout />}>{publicRoutes}</Route>

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
        <Route path="pages/text/:slug" element={<AdminPageTextPage />} />
        <Route path="pages/:id" element={<AdminPageBuilderPage />} />
        <Route path="coaching" element={<AdminCoachingPage />} />
        <Route path="consultations" element={<AdminConsultationsPage />} />
        <Route path="payments" element={<AdminPaymentsPage />} />
        <Route path="import" element={<AdminImportPage />} />
        <Route path="inquiries" element={<AdminInquiriesPage />} />
        <Route path="quiz-leads" element={<AdminQuizLeadsPage />} />
        <Route path="emails" element={<AdminEmailsPage />} />
        <Route path="newsletter" element={<AdminNewsletterPage />} />
        <Route path="blog" element={<AdminBlogPage />} />
        <Route path="blog/:id" element={<AdminBlogFormPage />} />
        <Route path="accreditations" element={<AdminAccreditationsPage />} />
        <Route path="nutrition-issues" element={<AdminNutritionIssuesPage />} />
        <Route path="recommended" element={<AdminRecommendedProductsPage />} />
        <Route path="b2b-pillars" element={<AdminB2bPillarsPage />} />
      </Route>
    </Routes>
    </Suspense>
  );
}

function LegacyDiyRedirect() {
  const { slug = "" } = useParams();
  return <Navigate to={`${SELF_GUIDED_PATH}/${slug}`} replace />;
}
