import { notFound } from "next/navigation";
import { heroes } from "@/content/heroes";
import { Tuner } from "./tuner";

export const metadata = { title: "Hero tune (dev)" };

export default function HeroTunePage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <Tuner heroes={heroes} />;
}
