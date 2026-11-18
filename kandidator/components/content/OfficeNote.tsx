import { t } from "@/lib/content/copy";

export function OfficeNote() {
  return (
    <aside className="mt-10 rounded-lg bg-secondary p-5">
      <h2 className="text-2xl">{t("office.title")}</h2>
      <p className="mt-3 max-w-2xl">{t("office.text")}</p>
    </aside>
  );
}
