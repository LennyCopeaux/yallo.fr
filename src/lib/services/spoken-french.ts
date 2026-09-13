/**
 * Les TTS ElevenLabs lisent les marques anglaises au phonème anglais, même
 * dans une phrase française : « Burger King Pessac » devient « Burgard Kine
 * Pesak ». On réécrit seulement les noms propres connus, à la française.
 */
const BRAND_PRONUNCIATIONS: ReadonlyArray<readonly [RegExp, string]> = [
  [/\bBurger\s*King\b/gi, "Beurger Kingue"],
  [/\bMcDonald'?s\b/gi, "Mac Do"],
  [/\bKFC\b/g, "K. F. C."],
];

export function toSpokenFrenchLabel(name: string): string {
  return BRAND_PRONUNCIATIONS.reduce(
    (value, [pattern, spoken]) => value.replace(pattern, spoken),
    name
  );
}
