"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { t } from "@/lib/content/copy";
import { Label } from "@/components/ui/label";
import { isAllowedCvFile } from "@/lib/validation/cv";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} kB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileUpload({ onFile }: { onFile: (file: File | null) => void }) {
  const { setError, clearErrors, formState } = useFormContext();
  const [selected, setSelected] = useState<{ name: string; size: number } | null>(null);
  const message = formState.errors.cvPath?.message;

  return (
    <div className="grid gap-2" id="cvPath">
      <Label htmlFor="cv-file">{t("forms.cv")}</Label>
      <p className="text-muted-foreground">{t("forms.cvHint")}</p>
      <input
        id="cv-file"
        name="cv"
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        aria-invalid={message ? true : undefined}
        aria-describedby={message ? "cvPath-error" : undefined}
        className="block w-full text-base file:mr-4 file:min-h-11 file:rounded-md file:border-0 file:bg-primary file:px-4 file:font-semibold file:text-primary-foreground"
        onChange={(event) => {
          const file = event.target.files?.[0] ?? null;
          if (!file) {
            setSelected(null);
            onFile(null);
            return;
          }
          const problem = isAllowedCvFile(file.name, file.type, file.size);
          if (problem === "size") {
            setSelected(null);
            onFile(null);
            setError("cvPath", { message: t("forms.fileTooLarge") });
            return;
          }
          if (problem) {
            setSelected(null);
            onFile(null);
            setError("cvPath", { message: t("forms.fileType") });
            return;
          }
          clearErrors("cvPath");
          setSelected({ name: file.name, size: file.size });
          onFile(file);
        }}
      />
      {selected ? (
        <p>
          {t("forms.selectedFile")}: {selected.name} ({formatSize(selected.size)})
        </p>
      ) : null}
      {message ? (
        <p id="cvPath-error" className="text-destructive">
          {String(message)}
        </p>
      ) : null}
    </div>
  );
}
