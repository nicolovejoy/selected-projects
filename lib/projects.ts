export type ProjectStatus = "live" | "beta" | "alpha" | "demo" | "concept";

export type Project = {
  slug: string;
  name: string;
  tagline: string;
  status: ProjectStatus;
  url?: string;
  github?: string;
  description: string;
  cta?: { label: string; href: string };
};

export const projects: Project[] = [
  {
    slug: "musicforge",
    name: "MusicForge",
    tagline: "A music stand for working musicians.",
    status: "beta",
    url: "https://musicforge.org",
    github: "musicforge",
    description:
      "MusicForge is a music stand for working musicians, available as both a web app and a native iOS app. The catalog is more than 750 songs in chord-chart form, and any song can be transposed to any key on the spot — no scrolling through a binder, no marker-and-Sharpie rewrites between sets.\n\nSetlists sync across devices in real time. One person on stage acts as the leader: when they change the chart, change the key, or jump to the next song, every follower's screen catches up within seconds. Useful at gigs where the rhythm section is glancing at iPads in stands and the singer just called an audible.\n\nOther things in the box: a built-in metronome with subdivision feels for swing, triplets, and sixteenths; offline caching so flaky venue Wi-Fi doesn't kill the show; and per-song memory for keys, octave, tempo, and display preferences.\n\nThe web app also includes SongForge, a writing surface for creating new chord charts. SongForge is web-only — the iOS app is read-only on that front for now.\n\nSource charts come from Eric Benson's open library of lead sheets; conversion into MusicForge's chord-chart format is automated.",
  },
  {
    slug: "ibuild4you",
    name: "iBuild4You",
    tagline: "A way to talk through your idea with us.",
    status: "alpha",
    url: "https://ibuild4you.com",
    github: "ibuild4you",
    description:
      "Some people have an idea for a tool, an app, or a website but no obvious way to talk about it with someone technical. iBuild4You is a way in.\n\nA guest signs up and opens a conversation with an AI assistant. It interviews them in plain language: who would use this thing, what problem does it solve, what does the simplest first version look like, what already exists out there that's close. The output is a structured, evolving “living brief” — a document that gets richer every session, not just a chat transcript.\n\nOn the other side of that brief sits the Piano House project team. Today that's mostly one person, with help from his son, and room for others over time. The team reads briefs, leaves annotations, and those notes feed back into the next conversation so the assistant picks up where the human reviewer left off.\n\nThe point is to lower the barrier between an idea and a real conversation about building it.",
  },
  {
    slug: "prntd",
    name: "PRNTD",
    tagline: "A print-on-demand store you can shape with words.",
    status: "live",
    url: "https://prntd.org",
    github: "prntd",
    description:
      "PRNTD is a print-on-demand store you can shape with words. Describe what you want — “a black tee that reads BIRD CLUB above a line drawing of a heron” — and an AI helper turns the description into a real design, refines it through chat, mocks it up on the product, and takes the order.\n\nThe bigger idea is who it's for. Sports teams, school clubs, small companies that want a few dozen shirts for a launch, neighborhood groups, and especially nonprofit fundraisers using merch to raise money for a cause. Designing a shirt is usually the slow part of any of those efforts. PRNTD compresses that step into a chat anyone in the group can drive, and a small set of products that look good without a designer in the loop.\n\nWhat's coming next is more social. Shareable design threads so a group can collaborate on a shirt before anyone places an order. Lightweight storefronts a club or a nonprofit can point supporters at. And a path to route some or all of the proceeds from a fundraiser into a designated cause.\n\nThe site is live at prntd.org today.",
  },
  {
    slug: "lojong",
    name: "Lojong",
    tagline: "Found poems built from news stories and Buddhist slogans.",
    status: "demo",
    url: "https://amianai.com",
    github: "am-i-an-ai",
    description:
      "Lojong is a small experiment in how a piece of writing can come together when most of the words come from somewhere else.\n\nIt pairs each of 59 Lojong slogans — short, oblique instructions from the Tibetan Buddhist tradition — with a recent news story whose underlying tension echoes the slogan. An AI assistant looks for that resonance, lifts passages from the article, and arranges them into a found poem. A human writes the closing line.\n\nThe form is borrowed from Victoria Adukwei Bulley's “The Ultra-Black Fish,” a poem composed almost entirely of journalistic prose about a scientific discovery. The premise here is similar: trust the source material, intervene only where the poem needs you to.\n\nLojong is a one-off demonstration rather than an active project — a finished piece you can read at amianai.com, more than something we're still building. It's here because it shows a particular way creativity and AI can work together.",
  },
  {
    slug: "prompt-lab",
    name: "Prompt Lab",
    tagline: "The back-of-house for everything in the workshop.",
    status: "beta",
    github: "prompt-lab",
    description:
      "Prompt Lab is the back-of-house for everything in the Piano House workshop. As work happens across each project — every conversation with an AI assistant, every commit, every decision — it's quietly logged and threaded by project. A nightly pass turns the raw stream into something readable: daily summaries, weekly rollups, and a living list of what each project is currently focused on, what's stalled, and what just shipped.\n\nThe point isn't surveillance, it's memory. With many parallel projects moving at once, it's easy to forget what was tried, why a direction was abandoned, what was promised. Prompt Lab is the part of the system that remembers, and that surfaces those memories where they're useful — in private dashboards, in periodic email recaps, and increasingly in this site itself.\n\nThis very page exists because Prompt Lab made it easy to recall, in detail, what each of the projects on this site has been about lately.",
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
