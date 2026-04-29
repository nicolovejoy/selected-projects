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

  const subject = `Piano House — ${p.name} (${p.project})`;
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
