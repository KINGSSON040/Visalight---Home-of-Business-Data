import { PlausibleEvent, ThankYouPanel } from "@/components/content/ThankYouPanel";
import { Container } from "@/components/layout/Container";
import { t } from "@/lib/content/copy";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata(t("thanks.applicationTitle"), t("thanks.applicationText"), "/tack/ansokan", {
  index: false,
});

export default function ApplicationThanksPage() {
  return (
    <Container>
      <PlausibleEvent name="ansokan" />
      <ThankYouPanel
        title={t("thanks.applicationTitle")}
        text={t("thanks.applicationText")}
        nextLabel={t("thanks.next")}
        promise={t("thanks.responsePromise")}
        homeLabel={t("cta.home")}
      />
    </Container>
  );
}
