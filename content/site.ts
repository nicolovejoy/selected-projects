// Site-wide strings now live in content/strings.ts, alongside their French
// counterparts. This re-export keeps the English `site` import working for the
// OG card and anything else that is English-only.
import { strings } from "./strings";

export const site = strings.en.site;
