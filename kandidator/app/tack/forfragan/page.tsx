import { PlausibleEvent, ThankYouPanel } from "@/components/content/ThankYouPanel";
import { Container } from "@/components/layout/Container";
import { t } from "@/lib/content/copy";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata(t("thanks.inquiryTitle"), t("thanks.inquiryText"), "/tack/forfragan", {
  index: false,
});

export default function InquiryThanksPage() {
  return (
    <Container>
      <PlausibleEvent name="forfragan" />
      <ThankYouPanel
        title={t("thanks.inquiryTitle")}
        text={t("thanks.inquiryText")}
        nextLabel={t("thanks.next")}
        promise={t("thanks.responsePromise")}
        homeLabel={t("cta.home")}
      />
    </Container>
  );
}
