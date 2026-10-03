import { QUIZ_DISCLAIMER, type QuizResult } from "@/data/irQuiz";

const W = 1080;
const H = 1350;
const FOREST = "#006c45";
const CORAL = "#ff5757";
const INK = "#0a1612";
const MUTED = "#3a4a44";
const BONE = "#f5f1ea";

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/** Wraps text to maxWidth using the context's current font; returns the lines. */
function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export interface QuizImageInput {
  name: string;
  result: QuizResult;
  lang: "en" | "ar";
}

/** Renders the one-page result and returns it as a JPEG data URL. */
export async function renderQuizImage({ name, result, lang }: QuizImageInput): Promise<string> {
  const isAr = lang === "ar";
  try {
    await Promise.all([
      document.fonts.load("700 48px Cairo"),
      document.fonts.load("400 30px Cairo"),
      document.fonts.load("800 120px Cairo"),
    ]);
  } catch {
    /* fall back to system fonts */
  }

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unsupported");

  const align: CanvasTextAlign = isAr ? "right" : "left";
  const edge = isAr ? W - 80 : 80;
  ctx.direction = isAr ? "rtl" : "ltr";
  ctx.textBaseline = "alphabetic";
  const font = (weight: number, size: number) => `${weight} ${size}px Cairo, Inter, system-ui, sans-serif`;

  // Background
  ctx.fillStyle = BONE;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = FOREST;
  ctx.fillRect(0, 0, W, 14);

  // Logo (centered)
  const logo = await loadImage("/liv-logo.png");
  if (logo) {
    const lh = 90;
    const lw = (290 / 190) * lh;
    // the PNG has a lot of empty margin; crop to the wordmark
    ctx.drawImage(logo, 70, 180, 290, 190, (W - lw) / 2, 60, lw, lh);
  }

  // Heading
  ctx.textAlign = align;
  ctx.fillStyle = MUTED;
  ctx.font = font(600, 30);
  const eyebrow = isAr ? "ملخص مقاومة الأنسولين" : "YOUR INSULIN RESISTANCE SNAPSHOT";
  ctx.fillText(eyebrow, edge, 230);

  ctx.fillStyle = INK;
  ctx.font = font(800, 58);
  const hello = isAr ? `${name}، هذه نتيجتك` : `${name}, here is where you are`;
  wrap(ctx, hello, W - 160).forEach((l, i) => ctx.fillText(l, edge, 305 + i * 70));

  // Result label
  ctx.fillStyle = result.band.color;
  ctx.font = font(800, 96);
  ctx.fillText(result.band.label[lang], edge, 470);

  // Spectrum bar
  const barX = 80;
  const barW = W - 160;
  const barY = 560;
  const grad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
  grad.addColorStop(0, "#2d8e60");
  grad.addColorStop(0.35, "#c9a227");
  grad.addColorStop(0.65, "#ef8a3c");
  grad.addColorStop(1, "#ff5757");
  ctx.fillStyle = grad;
  roundRect(ctx, barX, barY, barW, 40, 20);
  ctx.fill();

  // Marker (spectrum always reads low→high left→right, like a ruler)
  const mx = barX + (result.percent / 100) * barW;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(mx, barY + 20, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 8;
  ctx.strokeStyle = INK;
  ctx.stroke();

  ctx.direction = "ltr";
  ctx.font = font(600, 24);
  ctx.fillStyle = MUTED;
  ctx.textAlign = "left";
  ctx.fillText(isAr ? "قليلة" : "Few signs", barX, barY + 100);
  ctx.textAlign = "right";
  ctx.fillText(isAr ? "قوية" : "Strong signs", barX + barW, barY + 100);
  ctx.direction = isAr ? "rtl" : "ltr";

  // Score pill
  ctx.textAlign = "center";
  ctx.font = font(700, 30);
  ctx.fillStyle = INK;
  ctx.fillText(
    isAr ? `${result.percent}٪ من علامات مقاومة الأنسولين` : `${result.percent}% of the common insulin resistance signs`,
    W / 2,
    barY + 175,
  );

  // Summary card
  const cardY = 800;
  ctx.fillStyle = "#ffffff";
  roundRect(ctx, 60, cardY, W - 120, 270, 28);
  ctx.fill();
  ctx.textAlign = align;
  ctx.fillStyle = INK;
  ctx.font = font(500, 34);
  wrap(ctx, result.band.summary[lang], W - 220).forEach((l, i) => ctx.fillText(l, edge === 80 ? 100 : W - 100, cardY + 70 + i * 52));

  // Next step
  ctx.fillStyle = FOREST;
  roundRect(ctx, 60, 1100, W - 120, 100, 50);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.font = font(700, 32);
  ctx.fillText(
    isAr ? "أرسلي نتيجتك لريهام على واتساب لخطوتك التالية" : "Send this to Reham on WhatsApp for your next step",
    W / 2,
    1162,
  );

  // Footer
  ctx.fillStyle = MUTED;
  ctx.font = font(400, 22);
  ctx.textAlign = "center";
  wrap(ctx, QUIZ_DISCLAIMER[lang], W - 160).forEach((l, i) => ctx.fillText(l, W / 2, 1245 + i * 32));
  ctx.fillStyle = CORAL;
  ctx.font = font(700, 24);
  ctx.fillText("livfunctional.com", W / 2, 1315);

  return canvas.toDataURL("image/jpeg", 0.92);
}
