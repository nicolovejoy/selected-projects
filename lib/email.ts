import { Resend } from "resend";

let _resend: Resend | undefined;

function client(): Resend {
  if (!_resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error("RESEND_API_KEY must be set");
    _resend = new Resend(apiKey);
  }
  return _resend;
}

export type ConnectEmailPayload = {
  name: string;
  email: string;
  project: string;
  intents: string[];
  message: string;
  links?: string | null;
  ip?: string | null;
  geoCity?: string | null;
  geoRegion?: string | null;
  geoCountry?: string | null;
  referer?: string | null;
  userAgent?: string | null;
};

export async function sendConnectNotification(p: ConnectEmailPayload): Promise<void> {
  const from = process.env.CONNECT_FROM_EMAIL;
  const to = process.env.CONNECT_TO_EMAIL;
  if (!from || !to) {
    throw new Error("CONNECT_FROM_EMAIL and CONNECT_TO_EMAIL must be set");
  }

  const subject = `the piano house project — ${p.name} (${p.project})`;
  const lines: string[] = [
    `From: ${p.name} <${p.email}>`,
    `Project: ${p.project}`,
    `Intents: ${p.intents.length ? p.intents.join(", ") : "(none)"}`,
  ];
  if (p.links) lines.push(`Links: ${p.links}`);

  const geoParts = [p.geoCity, p.geoRegion, p.geoCountry].filter(Boolean);
  if (geoParts.length) lines.push(`Location: ${geoParts.join(", ")}`);
  if (p.ip) lines.push(`IP (truncated): ${p.ip}`);
  if (p.referer) lines.push(`Referer: ${p.referer}`);
  if (p.userAgent) lines.push(`User-Agent: ${p.userAgent}`);

  lines.push("", p.message);

  await client().emails.send({
    from,
    to,
    replyTo: p.email,
    subject,
    text: lines.join("\n"),
  });
}

export async function sendNoteAlert(p: {
  project: string;
  author: string;
  authorEmail: string;
  body: string;
}): Promise<void> {
  const from = process.env.CONNECT_FROM_EMAIL;
  const to = process.env.CONNECT_TO_EMAIL;
  if (!from || !to) {
    throw new Error("CONNECT_FROM_EMAIL and CONNECT_TO_EMAIL must be set");
  }

  await client().emails.send({
    from,
    to,
    subject: `New note on ${p.project} — ${p.author}`,
    text: [
      `Author: ${p.author} <${p.authorEmail}>`,
      `Project: https://pianohouseproject.org/projects/${p.project}`,
      "",
      p.body,
    ].join("\n"),
  });
}

export async function sendMagicLink(opts: { email: string; url: string }): Promise<void> {
  // Falls back to Resend's shared test sender until the domain is verified.
  const from =
    process.env.AUTH_FROM_EMAIL ??
    "the piano house project <onboarding@resend.dev>";

  await client().emails.send({
    from,
    to: opts.email,
    subject: "Your sign-in link for the piano house project",
    text: [
      "Click to sign in — this link works once and expires in 15 minutes.",
      "",
      opts.url,
      "",
      "Didn't request this? Ignore it; nothing happens.",
    ].join("\n"),
  });
}
