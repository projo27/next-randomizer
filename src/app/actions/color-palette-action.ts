'use server';

type ColorScheme =
  | "analogous"
  | "monochromatic"
  | "complementary"
  | "split-complementary"
  | "triadic"
  | "tetradic"
  | "square";

function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

export async function generatePalettes(numPalettes: number, numColors: number, scheme: ColorScheme): Promise<string[][]> {
    const allNewPalettes: string[][] = [];

    for (let p = 0; p < numPalettes; p++) {
      const count = numColors;
      let newPalette: string[] = [];

      const baseHue = Math.random() * 360;
      const saturation = 50 + Math.random() * 30;
      const lightness = 65 + Math.random() * 10;

      const hues: number[] = [baseHue];

      switch (scheme) {
        case "monochromatic":
          for (let i = 0; i < count; i++) {
            const l = lightness - 15 + (i / (count - 1)) * 30;
            const s = saturation - 10 + (i / (count - 1)) * 20;
            newPalette.push(
              hslToHex(
                baseHue,
                Math.min(100, Math.max(20, s)),
                Math.min(95, Math.max(15, l)),
              ),
            );
          }
          break;
        case "complementary":
          hues.push((baseHue + 180) % 360);
          break;
        case "split-complementary":
          hues.push((baseHue + 150) % 360);
          hues.push((baseHue + 210) % 360);
          break;
        case "triadic":
          hues.push((baseHue + 120) % 360);
          hues.push((baseHue + 240) % 360);
          break;
        case "tetradic":
          hues.push((baseHue + 60) % 360);
          hues.push((baseHue + 180) % 360);
          hues.push((baseHue + 240) % 360);
          break;
        case "square":
          hues.push((baseHue + 90) % 360);
          hues.push((baseHue + 180) % 360);
          hues.push((baseHue + 270) % 360);
          break;
        case "analogous":
        default:
          for (let i = 1; i < count; i++) {
            hues.push((baseHue + i * 30) % 360);
          }
          break;
      }

      if (scheme !== "monochromatic") {
        for (let i = 0; i < count; i++) {
          const hue = hues[i % hues.length];
          const l = lightness - i * 3 + Math.random() * 6;
          const s = saturation - i * 2 + Math.random() * 4;
          newPalette.push(
            hslToHex(
              hue,
              Math.min(100, Math.max(40, s)),
              Math.min(95, Math.max(20, l)),
            ),
          );
        }
      }
      allNewPalettes.push(newPalette);
    }
    return allNewPalettes;
}
