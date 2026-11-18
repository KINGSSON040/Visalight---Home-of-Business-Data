import { t } from "@/lib/content/copy";

export function SkipLink() {
  return (
    <a className="skip-link" href="#innehall">
      {t("nav.skip")}
    </a>
  );
}
