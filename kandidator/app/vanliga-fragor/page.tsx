import { FaqList } from "@/components/content/FaqList";
import { PageHero } from "@/components/content/PageHero";
import { Container } from "@/components/layout/Container";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { t } from "@/lib/content/copy";
import { getFaq } from "@/lib/content/read";
import type { Audience, FaqItem } from "@/lib/content/types";
import { pageMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema, faqSchema } from "@/lib/seo/schema";

export const metadata = pageMetadata(t("meta.faq.title"), t("meta.faq.description"), "/vanliga-fragor");

const groups: { audience: Audience; title: string }[] = [
  { audience: "arbetsgivare", title: t("faq.employer") },
  { audience: "jobbsokande", title: t("faq.candidate") },
  { audience: "allmant", title: t("faq.general") },
];

export default async function FaqPage() {
  const items = await getFaq();
  const visible: FaqItem[] = groups.flatMap((group) => items.filter((item) => item.audience === group.audience));
  const crumbs = [
    { name: t("nav.home"), href: "/" },
    { name: t("nav.faq"), href: "/vanliga-fragor" },
  ];

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <JsonLd data={faqSchema(visible)} />
      <Container className="pb-16">
        <Breadcrumbs items={crumbs} />
        <PageHero title={t("meta.faq.title")} text={t("meta.faq.description")} />
        <div className="grid gap-10">
          {groups.map((group) => {
            const questions = items.filter((item) => item.audience === group.audience);
            if (questions.length === 0) return null;
            return (
              <section key={group.audience}>
                <h2 className="mb-4 text-3xl">{group.title}</h2>
                <FaqList items={questions} />
              </section>
            );
          })}
        </div>
      </Container>
    </>
  );
}
