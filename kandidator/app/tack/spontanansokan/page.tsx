import { PlausibleEvent, ThankYouPanel } from "@/components/content/ThankYouPanel";
import { Container } from "@/components/layout/Container";
import { t } from "@/lib/content/copy";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata(t("thanks.spontaneousTitle"), t("thanks.spontaneousText"), "/tack/spontanansokan", {
  index: false,
});

export default function SpontaneousThanksPage() {
  return (
    <Container>
      <PlausibleEvent name="spontanansokan" />
      <ThankYouPanel
        title={t("thanks.spontaneousTitle")}
        text={t("thanks.spontaneousText")}
        nextLabel={t("thanks.next")}
        promise={t("thanks.responsePromise")}
        homeLabel={t("cta.home")}
      />
    </Container>
  );
}
