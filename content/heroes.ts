export type HeroFade = {
  startOpacity: number;
  midOpacity: number;
  midStop: number;
  endStop: number;
  objectPosition: string;
  titleColor: string;
  subtitleColor: string;
};

export const heroes = {
  sunset: {
    startOpacity: 70,
    midOpacity: 40,
    midStop: 45,
    endStop: 85,
    objectPosition: "right",
    titleColor: "#171717",
    subtitleColor: "#404040",
  },
} satisfies Record<string, HeroFade>;

export type HeroSlug = keyof typeof heroes;

export const homeHero: HeroSlug = "sunset";

export function heroGradient(fade: HeroFade): string {
  return [
    `linear-gradient(to right`,
    ` rgba(255,255,255,${fade.startOpacity / 100}) 0%`,
    ` rgba(255,255,255,${fade.midOpacity / 100}) ${fade.midStop}%`,
    ` rgba(255,255,255,0) ${fade.endStop}%)`,
  ].join(",");
}
