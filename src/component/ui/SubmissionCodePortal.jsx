import * as Dialog from "@radix-ui/react-dialog";
import { XCircle } from "lucide-react";
import { CodeBlock } from "./code-block";

const LANGUAGE_ALIASES = [
  { match: /c\+\+/i, syntax: "cpp", extension: "cpp" },
  { match: /c#/i, syntax: "csharp", extension: "cs" },
  { match: /javascript|node\.js/i, syntax: "javascript", extension: "js" },
  { match: /typescript/i, syntax: "typescript", extension: "ts" },
  { match: /python/i, syntax: "python", extension: "py" },
  { match: /^c$/i, syntax: "c", extension: "c" },
  { match: /java/i, syntax: "java", extension: "java" },
  { match: /go/i, syntax: "go", extension: "go" },
  { match: /rust/i, syntax: "rust", extension: "rs" },
  { match: /php/i, syntax: "php", extension: "php" },
  { match: /ruby/i, syntax: "ruby", extension: "rb" },
  { match: /swift/i, syntax: "swift", extension: "swift" },
  { match: /kotlin/i, syntax: "kotlin", extension: "kt" },
  { match: /scala/i, syntax: "scala", extension: "scala" },
  { match: /dart/i, syntax: "dart", extension: "dart" },
  { match: /lua/i, syntax: "lua", extension: "lua" },
  { match: /perl/i, syntax: "perl", extension: "pl" },
  { match: /bash|shell/i, syntax: "bash", extension: "sh" },
  { match: /sql/i, syntax: "sql", extension: "sql" },
];

const getCodeLanguageMeta = (language) => {
  const trimmedLanguage = String(language || "").trim();
  const normalizedLanguage = trimmedLanguage.split("(")[0].trim();

  const matchedLanguage = LANGUAGE_ALIASES.find(
    (entry) =>
      entry.match.test(trimmedLanguage) || entry.match.test(normalizedLanguage),
  );

  return {
    syntax: matchedLanguage?.syntax || "text",
    extension: matchedLanguage?.extension || "txt",
    displayName: normalizedLanguage || trimmedLanguage || "Code",
  };
};

export default function SubmissionCodePortal({
  open,
  onOpenChange,
  title = "Submitted code",
  language = "",
  submittedAt = "",
  code = "",
}) {
  const languageMeta = getCodeLanguageMeta(language);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-[210] w-[92vw] max-w-5xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/80 text-white shadow-[0_18px_50px_rgba(0,0,0,0.42)] outline-none">
          <div className="flex items-center gap-3 border-b border-white/10 bg-zinc-950/92 px-6 py-3">
            <div>
              <Dialog.Title className="text-sm font-medium text-slate-100">
                {title}
              </Dialog.Title>
              <div className="mt-0.5 text-[11px] text-slate-400">
                {languageMeta.displayName}
                {language && submittedAt ? " • " : ""}
                {submittedAt ? `Submitted ${submittedAt}` : ""}
              </div>
            </div>
            <div className="ml-auto">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="rounded p-1 text-slate-400 transition-colors hover:text-white"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </Dialog.Close>
            </div>
          </div>

          <div className="max-h-[75vh] overflow-auto bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.08),transparent_35%),linear-gradient(180deg,rgba(9,9,11,0.88),rgba(9,9,11,0.95))] p-4 sm:p-6">
            <CodeBlock
              language={languageMeta.syntax}
              filename={`${(title || "submitted-code").replace(/\s+/g, "-").toLowerCase()}.${languageMeta.extension}`}
              code={code || "No code available"}
            />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
