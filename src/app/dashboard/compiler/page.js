"use client";

import { useEffect, useMemo, useState } from "react";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import "prismjs/components/prism-java";
import "prismjs/components/prism-python";
import "prismjs/components/prism-clike";
import { Loader2, Play, RotateCcw, TerminalSquare } from "lucide-react";

import Navbar from "@/components/common/Navbar";
import LeftSidebar from "@/components/common/LeftSidebar";
import { getCompilerLanguages, executeCompilerCode } from "@/api/compiler.api";

import "./playground.css";

const FALLBACK_TEMPLATES = {
  java: `public class Main {\n  public static void main(String[] args) {\n    System.out.println(\"Hello from Proctora\");\n  }\n}`,
  python: `name = input()\nprint(f\"Hello {name}\")`,
};

const BASE_LANGUAGES = [
  { id: "java", label: "Java", template: FALLBACK_TEMPLATES.java },
  { id: "python", label: "Python", template: FALLBACK_TEMPLATES.python },
];

const mergeLanguages = (apiLanguages = []) => {
  const merged = new Map();

  BASE_LANGUAGES.forEach((lang) => {
    merged.set(lang.id, lang);
  });

  apiLanguages.forEach((lang) => {
    if (!lang?.id) return;

    const normalizedId = String(lang.id).toLowerCase().trim();
    const existing = merged.get(normalizedId) || {};

    merged.set(normalizedId, {
      ...existing,
      ...lang,
      id: normalizedId,
      label: lang.label || existing.label || normalizedId,
      template:
        lang.template ||
        existing.template ||
        FALLBACK_TEMPLATES[normalizedId] ||
        "",
    });
  });

  return [...merged.values()];
};

const formatMs = (value) => {
  if (!Number.isFinite(value)) return "-";
  if (value < 1000) return `${value} ms`;
  return `${(value / 1000).toFixed(2)} s`;
};

export default function CompilerPlaygroundPage() {
  const [languages, setLanguages] = useState([]);
  const [loadingLanguages, setLoadingLanguages] = useState(true);

  const [language, setLanguage] = useState("java");
  const [code, setCode] = useState(FALLBACK_TEMPLATES.java);
  const [stdin, setStdin] = useState("World");

  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadLanguages = async () => {
      try {
        const response = await getCompilerLanguages();
        const list = response?.data?.languages || [];

        if (cancelled) return;

        const merged = mergeLanguages(Array.isArray(list) ? list : []);
        setLanguages(merged);

        const defaultLang = merged.find((item) => item.id === "python")
          ? "python"
          : merged[0]?.id || "java";

        setLanguage(defaultLang);
        setCode(
          merged.find((item) => item.id === defaultLang)?.template ||
            FALLBACK_TEMPLATES[defaultLang] ||
            "",
        );
      } catch {
        if (!cancelled) {
          setLanguages(BASE_LANGUAGES);
          setLanguage("python");
          setCode(FALLBACK_TEMPLATES.python);
        }
      } finally {
        if (!cancelled) {
          setLoadingLanguages(false);
        }
      }
    };

    loadLanguages();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedLanguageTemplate = useMemo(() => {
    const fromApi = languages.find((item) => item.id === language)?.template;
    return fromApi || FALLBACK_TEMPLATES[language] || "";
  }, [languages, language]);

  const handleLanguageChange = (nextLanguage) => {
    setLanguage(nextLanguage);
    const fromApi = languages.find((item) => item.id === nextLanguage)?.template;
    setCode(fromApi || FALLBACK_TEMPLATES[nextLanguage] || "");
    setResult(null);
    setErrorMessage("");
  };

  const handleReset = () => {
    setCode(selectedLanguageTemplate);
    setStdin("World");
    setResult(null);
    setErrorMessage("");
  };

  const runCode = async () => {
    if (!code.trim()) {
      setErrorMessage("Code cannot be empty.");
      setResult(null);
      return;
    }

    setRunning(true);
    setErrorMessage("");

    try {
      const response = await executeCompilerCode({ language, code, stdin });
      setResult(response?.data || null);
    } catch (err) {
      const message =
        err?.response?.data?.message || "Execution failed. Please try again.";
      setErrorMessage(message);
      setResult(null);
    } finally {
      setRunning(false);
    }
  };

  const highlightedCode = useMemo(() => {
    if (language === "python") {
      return Prism.highlight(code, Prism.languages.python, "python");
    }

    return Prism.highlight(code, Prism.languages.java, "java");
  }, [code, language]);

  return (
    <div className="relative min-h-screen font-sans">
      <div className="relative z-10">
        <Navbar />
        <div className="flex min-h-[calc(100vh-4rem)]">
          <LeftSidebar />

          <main className="playground-shell flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
              <section className="playground-toolbar">
                <div>
                  <h1 className="text-2xl font-semibold text-[#2b1236]">Compiler Playground</h1>
                  <p className="mt-1 text-sm text-[#5b416c]">Write code, run it, and inspect output.</p>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <label className="text-[#4b2f5c]" htmlFor="languageSelect">
                    Language
                  </label>
                  <select
                    id="languageSelect"
                    className="playground-control"
                    value={language}
                    onChange={(event) => handleLanguageChange(event.target.value)}
                    disabled={loadingLanguages || running}
                  >
                    {languages.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={running}
                    className="playground-control inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <RotateCcw size={15} />
                    Reset
                  </button>

                  <button
                    type="button"
                    onClick={runCode}
                    disabled={running || loadingLanguages}
                    className="playground-control inline-flex items-center gap-2 font-semibold text-[#2f7e38] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {running ? <Loader2 size={15} className="animate-spin" /> : <Play size={15} />}
                    {running ? "Running..." : "Run"}
                  </button>
                </div>
              </section>

              <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.6fr_1fr]">
                <article>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-medium text-[#4b2f5c]">Editor</p>
                    <p className="text-xs text-[#6b4a7c]">{language.toUpperCase()}</p>
                  </div>

                  <div className="playground-editor-wrap">
                    <Editor
                      value={code}
                      onValueChange={setCode}
                      highlight={() => highlightedCode}
                      padding={16}
                      className="playground-editor"
                      textareaId="compilerEditor"
                      textareaClassName="playground-editor-textarea"
                      preClassName="playground-editor-pre"
                      spellCheck={false}
                    />
                  </div>
                </article>

                <article>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-medium text-[#4b2f5c]">Input</p>
                    <p className="text-xs text-[#6b4a7c]">stdin</p>
                  </div>

                  <textarea
                    value={stdin}
                    onChange={(event) => setStdin(event.target.value)}
                    className="playground-stdin w-full rounded-md border border-[#5a2b6b] bg-[#17111f] p-3 text-sm text-[#f8ecff] outline-none focus:border-[#c06fff]"
                    rows={12}
                    placeholder="Type input for your program"
                  />
                </article>
              </section>

              <section className="terminal-panel rounded-xl border border-[#2e2e2e] p-0">
                <header className="terminal-header flex items-center justify-between rounded-t-xl border-b border-[#3b3b3b] px-4 py-3">
                  <div className="flex items-center gap-2 text-[#f6f6f6]">
                    <TerminalSquare size={16} />
                    <span className="text-sm font-semibold">Terminal Output</span>
                  </div>

                  <div className="text-xs text-[#bdbdbd]">
                    {result ? `Execution Time: ${formatMs(result.executionTime)}` : "No run yet"}
                  </div>
                </header>

                <div className="terminal-body min-h-55 p-4 font-mono text-sm leading-6">
                  {errorMessage ? (
                    <pre className="whitespace-pre-wrap wrap-break-word text-[#ff7676]">{errorMessage}</pre>
                  ) : null}

                  {result?.stdout ? (
                    <div className="mb-4">
                      <p className="mb-1 text-xs font-semibold text-[#7de67a]">stdout</p>
                      <pre className="whitespace-pre-wrap wrap-break-word text-[#d8ffd5]">{result.stdout}</pre>
                    </div>
                  ) : null}

                  {result?.stderr ? (
                    <div className="mb-4">
                      <p className="mb-1 text-xs font-semibold text-[#ff8f8f]">stderr</p>
                      <pre className="whitespace-pre-wrap wrap-break-word text-[#ffb3b3]">{result.stderr}</pre>
                    </div>
                  ) : null}

                  {!errorMessage && !result?.stdout && !result?.stderr ? (
                    <p className="text-[#9e9e9e]">Run code to see output here.</p>
                  ) : null}
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
