"use server";

import { redirect } from "next/navigation";
import { filtersToSearch, type Filters } from "./queries";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function applyFilters(formData: FormData) {
  const path = formData.get("path") === "/segment" ? "/segment" : "/foretag";
  const filters: Filters = {
    q: text(formData, "q"),
    city: text(formData, "ort"),
    sni: text(formData, "sni"),
    flag: text(formData, "flagga"),
    hasPhone: formData.get("telefon") === "1",
    hasEmail: formData.get("epost") === "1",
    includeSuppressed: formData.get("alla") === "1",
  };
  const query = filtersToSearch(filters);
  redirect(query ? `${path}?${query}` : path);
}
