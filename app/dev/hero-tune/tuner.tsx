"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { type HeroFade, heroGradient } from "@/content/heroes";

declare global {
  interface Window {
    EyeDropper?: new () => {
      open: (options?: { signal?: AbortSignal }) => Promise<{ sRGBHex: string }>;
    };
  }
}

type Props = {
  heroes: Record<string, HeroFade>;
};

export function Tuner({ heroes }: Props) {
  const slugs = Object.keys(heroes);
  const [slug, setSlug] = useState(slugs[0]);
  const [fade, setFade] = useState<HeroFade>(heroes[slug]);
  const [copied, setCopied] = useState(false);

  function pickSlug(next: string) {
    setSlug(next);
    setFade(heroes[next]);
    setCopied(false);
  }

  function update<K extends keyof HeroFade>(key: K, value: HeroFade[K]) {
    setFade((f) => ({ ...f, [key]: value }));
    setCopied(false);
  }

  const snippet = `${slug}: {
  startOpacity: ${fade.startOpacity},
  midOpacity: ${fade.midOpacity},
  midStop: ${fade.midStop},
  endStop: ${fade.endStop},
  objectPosition: ${JSON.stringify(fade.objectPosition)},
  titleColor: ${JSON.stringify(fade.titleColor)},
  subtitleColor: ${JSON.stringify(fade.subtitleColor)},
},`;

  async function copy() {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Hero tune</h1>
        <span className="text-xs uppercase tracking-wider text-neutral-500">
          dev only · not in production
        </span>
      </div>

      <label className="mt-6 flex items-center gap-3 text-sm">
        <span className="text-neutral-600">Image</span>
        <select
          value={slug}
          onChange={(e) => pickSlug(e.target.value)}
          className="rounded border border-neutral-300 px-2 py-1"
        >
          {slugs.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      <section className="relative isolate mt-6 overflow-hidden rounded border border-neutral-200">
        <div className="absolute inset-0 -z-10">
          <Image
            src={`/${slug}.jpg`}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
            style={{ objectPosition: fade.objectPosition }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{ background: heroGradient(fade) }}
          />
        </div>
        <div className="px-6 py-24 sm:py-32">
          <div className="max-w-xl">
            <h2
              className="text-4xl font-semibold tracking-tight sm:text-5xl"
              style={{ color: fade.titleColor }}
            >
              Piano House Project
            </h2>
            <p className="mt-4 text-lg" style={{ color: fade.subtitleColor }}>
              An evolving exploration of the brave new world of AI and
              vibe-coding — tools, experiments, and things we&rsquo;re building
              together to learn, explore, and have fun. Have a look around.
            </p>
          </div>
        </div>
      </section>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Slider
          label="startOpacity"
          help="white at left edge"
          value={fade.startOpacity}
          min={0}
          max={100}
          onChange={(v) => update("startOpacity", v)}
        />
        <Slider
          label="midOpacity"
          help="white at mid stop"
          value={fade.midOpacity}
          min={0}
          max={100}
          onChange={(v) => update("midOpacity", v)}
        />
        <Slider
          label="midStop"
          help="position of mid stop (%)"
          value={fade.midStop}
          min={0}
          max={100}
          onChange={(v) => update("midStop", v)}
        />
        <Slider
          label="endStop"
          help="fully transparent by (%)"
          value={fade.endStop}
          min={0}
          max={100}
          onChange={(v) => update("endStop", v)}
        />
        <ColorPicker
          label="titleColor"
          help="headline text"
          value={fade.titleColor}
          onChange={(v) => update("titleColor", v)}
        />
        <ColorPicker
          label="subtitleColor"
          help="paragraph text"
          value={fade.subtitleColor}
          onChange={(v) => update("subtitleColor", v)}
        />
        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          <span className="font-mono">
            objectPosition{" "}
            <span className="font-sans text-neutral-500">
              — CSS object-position (e.g. <code>right</code>,{" "}
              <code>center</code>, <code>50% 30%</code>)
            </span>
          </span>
          <input
            type="text"
            value={fade.objectPosition}
            onChange={(e) => update("objectPosition", e.target.value)}
            className="rounded border border-neutral-300 px-2 py-1"
          />
        </label>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-600">
            Paste into <code className="font-mono">content/heroes.ts</code>
          </span>
          <button
            type="button"
            onClick={copy}
            className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm text-white hover:bg-neutral-700"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <pre className="mt-2 overflow-x-auto rounded border border-neutral-200 bg-neutral-50 p-4 font-mono text-sm">
          {snippet}
        </pre>
      </div>
    </div>
  );
}

function Slider({
  label,
  help,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  help: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-mono">
        {label}: {value}{" "}
        <span className="font-sans text-neutral-500">— {help}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

function ColorPicker({
  label,
  help,
  value,
  onChange,
}: {
  label: string;
  help: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [eyedropperSupported, setEyedropperSupported] = useState(false);
  const [picking, setPicking] = useState(false);

  useEffect(() => {
    setEyedropperSupported(typeof window !== "undefined" && "EyeDropper" in window);
  }, []);

  async function pickFromPage() {
    if (!window.EyeDropper) return;
    setPicking(true);
    try {
      const result = await new window.EyeDropper().open();
      onChange(result.sRGBHex);
    } catch {
      // user pressed Esc — ignore
    } finally {
      setPicking(false);
    }
  }

  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-mono">
        {label}:{" "}
        <span className="font-sans text-neutral-500">— {help}</span>
      </span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-12 cursor-pointer rounded border border-neutral-300"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-28 rounded border border-neutral-300 px-2 py-1 font-mono"
        />
        {eyedropperSupported && (
          <button
            type="button"
            onClick={pickFromPage}
            disabled={picking}
            className="rounded border border-neutral-300 px-2 py-1 text-xs hover:border-neutral-500 disabled:opacity-50"
          >
            {picking ? "Picking…" : "Pick from page"}
          </button>
        )}
      </div>
    </label>
  );
}
