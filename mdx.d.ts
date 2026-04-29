declare module "*.mdx" {
  import type { MDXContent } from "mdx/types";
  export const metadata: Record<string, unknown>;
  const Content: MDXContent;
  export default Content;
}
