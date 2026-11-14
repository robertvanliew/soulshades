/* Draws the 1080×1920 share image for a track (Instagram / TikTok / Facebook
   stories) in the visitor's browser: the duo's photo, the track title and the
   wordmark. Done on a canvas so it needs no server and works offline; the
   site's own fonts are used once they've loaded. */

const W = 1080;
const H = 1920;
const INK = '#0a0805';
const TAN = ['#E2C8AA', '#C6A07A', '#8A6240'] as const;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Breaks text into lines no wider than `max` at the current font. */
function wrap(ctx: CanvasRenderingContext2D, text: string, max: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > max) { lines.push(line); line = word; }
    else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

function spaced(ctx: CanvasRenderingContext2D, px: number) {
  // Letter-spacing on canvas is recent; where it's missing the text simply sets tighter.
  (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = `${px}px`;
}

export async function makeStoryImage(title: string): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas unavailable');

  const [photo] = await Promise.all([
    loadImage('/ss-hero.jpg').catch(() => null),
    document.fonts.load("400 120px 'Bebas Neue'"),
    document.fonts.load("400 96px 'Instrument Serif'"),
    document.fonts.load("500 30px Geist"),
  ]);

  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, W, H);

  // Photo: fills the top of the frame, cropped around the two faces.
  const PH = 1240;
  if (photo) {
    const scale = Math.max(W / photo.width, PH / photo.height);
    const sw = W / scale, sh = PH / scale;
    const sx = (photo.width - sw) / 2;
    const sy = Math.max(0, Math.min(photo.height - sh, photo.height * 0.36 - sh / 2));
    ctx.drawImage(photo, sx, sy, sw, sh, 0, 0, W, PH);
  }
  // Fade the photo into the page colour, and settle the top for the phone's status bar.
  const fade = ctx.createLinearGradient(0, 0, 0, PH);
  fade.addColorStop(0, 'rgba(10,8,5,0.55)');
  fade.addColorStop(0.2, 'rgba(10,8,5,0)');
  fade.addColorStop(0.58, 'rgba(10,8,5,0)');
  fade.addColorStop(1, INK);
  ctx.fillStyle = fade;
  ctx.fillRect(0, 0, W, PH + 2);

  const X = 84;
  const MAXW = W - X * 2;
  ctx.textBaseline = 'alphabetic';

  // The wordmark and address are anchored to the bottom; the title takes the
  // space between the kicker and the wordmark, at the largest size that fits.
  const wm = 132;
  const wy = H - 250;
  const KICKER_Y = 1130;
  const TITLE_TOP = KICKER_Y + 34;
  const TITLE_BOTTOM = wy - wm * 0.76 - 64;

  // Kicker
  ctx.fillStyle = TAN[1];
  ctx.font = "500 30px Geist, 'Helvetica Neue', Arial, sans-serif";
  spaced(ctx, 7);
  ctx.fillText('LISTEN NOW', X, KICKER_Y);

  // Title
  spaced(ctx, -1);
  ctx.fillStyle = '#F6F1EA';
  const LEAD = 1.06;
  let size = 132, lines: string[] = [];
  for (; size >= 56; size -= 4) {
    ctx.font = `400 ${size}px 'Instrument Serif', Georgia, serif`;
    lines = wrap(ctx, title, MAXW);
    if (lines.length * size * LEAD <= TITLE_BOTTOM - TITLE_TOP) break;
  }
  let y = TITLE_TOP + size * 0.9;
  for (const l of lines) { ctx.fillText(l, X, y); y += size * LEAD; }

  // Wordmark: SOUL in off-white, SHADES in the tan gradient.
  ctx.font = `400 ${wm}px 'Bebas Neue', 'Arial Narrow', sans-serif`;
  spaced(ctx, 2);
  ctx.fillStyle = '#f2f2f2';
  ctx.fillText('SOUL', X, wy);
  const soulW = ctx.measureText('SOUL').width + wm * 0.26;
  const shadesW = ctx.measureText('SHADES').width;
  const g = ctx.createLinearGradient(X + soulW, wy - wm, X + soulW + shadesW, wy);
  g.addColorStop(0, TAN[0]); g.addColorStop(0.5, TAN[1]); g.addColorStop(1, TAN[2]);
  ctx.fillStyle = g;
  ctx.fillText('SHADES', X + soulW, wy);

  // Address
  ctx.fillStyle = 'rgba(246,241,234,0.72)';
  ctx.font = "500 34px Geist, 'Helvetica Neue', Arial, sans-serif";
  spaced(ctx, 1);
  ctx.fillText('soulshadesmusic.com', X, H - 170);

  // Rule along the bottom edge
  const bar = ctx.createLinearGradient(0, 0, W, 0);
  bar.addColorStop(0, TAN[0]); bar.addColorStop(0.5, TAN[1]); bar.addColorStop(1, TAN[2]);
  ctx.fillStyle = bar;
  ctx.fillRect(0, H - 10, W, 10);

  return new Promise((resolve, reject) => {
    canvas.toBlob(b => (b ? resolve(b) : reject(new Error('image failed'))), 'image/png');
  });
}
