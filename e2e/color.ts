/** Parse a computed CSS color ("rgb(r, g, b)" / "rgba(r, g, b, a)") into channels. */
export function parseRgb(css: string): { r: number; g: number; b: number } {
  const m = css.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/);
  if (!m) throw new Error(`unparseable color: ${css}`);
  return { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]) };
}

/** Relative luminance in [0, 1] (0 = black, 1 = white). */
export function luminance(css: string): number {
  const { r, g, b } = parseRgb(css);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

/** Euclidean RGB distance in [0, ~441]. Near 0 means visually identical. */
export function rgbDistance(a: string, b: string): number {
  const ca = parseRgb(a);
  const cb = parseRgb(b);
  return Math.hypot(ca.r - cb.r, ca.g - cb.g, ca.b - cb.b);
}
