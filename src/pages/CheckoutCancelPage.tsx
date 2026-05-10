import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SEO } from "@/components/seo/SEO";

export function CheckoutCancelPage() {
  const { t } = useTranslation();
  return (
    <>
      <SEO title="Checkout cancelled" description="Checkout cancelled" path="/checkout/cancel" />
      <Section variant="default" pad="md" className="bg-editorial">
        <Container>
          <div className="mx-auto max-w-xl py-20 text-center">
            <div className="text-eyebrow uppercase mb-4 text-ink-muted">
              {t("checkout.cancelEyebrow", { defaultValue: "Checkout cancelled" })}
            </div>
            <h1 className="display-serif text-display-lg tracking-tightest">
              {t("checkout.cancelTitle", { defaultValue: "No charge was made." })}
            </h1>
            <p className="mt-6 text-ink-muted">
              {t("checkout.cancelLede", {
                defaultValue:
                  "Your cart is still saved — pick up where you left off whenever you're ready.",
              })}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/checkout"
                className="inline-flex rounded-full bg-forest-500 px-6 py-3 text-sm font-semibold text-bone-50 hover:bg-forest-600"
              >
                Return to checkout
              </Link>
              <Link
                to="/diy-plans"
                className="inline-flex rounded-full border border-ink/15 px-6 py-3 text-sm font-semibold hover:bg-bone-100"
              >
                Keep browsing
              </Link>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
