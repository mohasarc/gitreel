import { useEffect, useState } from "react";
import { continueRender, delayRender } from "remotion";
import { createHighlighter, type Highlighter, type ThemedToken } from "shiki";

const LANGS = ["typescript", "tsx", "json", "bash", "diff", "markdown", "text"] as const;
export type CodeLang = (typeof LANGS)[number];

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  highlighterPromise ??= createHighlighter({
    themes: ["one-dark-pro"],
    langs: [...LANGS],
  });
  return highlighterPromise;
}

export type TokenLine = ThemedToken[];

export function useTokenLines(code: string, lang: CodeLang): TokenLine[] | null {
  const [lines, setLines] = useState<TokenLine[] | null>(null);
  const [handle] = useState(() => delayRender(`shiki:${lang}`));
  useEffect(() => {
    let cancelled = false;
    getHighlighter().then((highlighter) => {
      if (cancelled) return;
      const tokens = highlighter.codeToTokensBase(code, { lang, theme: "one-dark-pro" });
      setLines(tokens);
      continueRender(handle);
    });
    return () => {
      cancelled = true;
    };
  }, [code, lang, handle]);
  return lines;
}
