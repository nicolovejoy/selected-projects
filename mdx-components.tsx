import type { MDXComponents } from "mdx/types";
import { MachineNote } from "@/components/machine-note";

const components: MDXComponents = {
  MachineNote,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
