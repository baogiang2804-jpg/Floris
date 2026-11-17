import * as THREE from 'three';

function drawFivePetalFlower(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outerRadius: number,
  petalColor: string,
  strokeColor: string,
  centerColor: string,
  rotation = 0
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);

  for (let i = 0; i < 5; i++) {
    ctx.save();
    ctx.rotate((i * Math.PI * 2) / 5);
    ctx.beginPath();
    ctx.moveTo(0, -outerRadius * 0.16);
    ctx.bezierCurveTo(
      outerRadius * 0.44,
      -outerRadius * 0.56,
      outerRadius * 0.52,
      -outerRadius * 0.96,
      0,
      -outerRadius
    );
    ctx.bezierCurveTo(
      -outerRadius * 0.52,
      -outerRadius * 0.96,
      -outerRadius * 0.44,
      -outerRadius * 0.56,
      0,
      -outerRadius * 0.16
    );
    ctx.closePath();
    ctx.fillStyle = petalColor;
    ctx.fill();
    ctx.lineWidth = Math.max(1, outerRadius * 0.06);
    ctx.strokeStyle = strokeColor;
    ctx.stroke();
    ctx.restore();
  }

  ctx.beginPath();
  ctx.arc(0, 0, outerRadius * 0.24, 0, Math.PI * 2);
  ctx.fillStyle = centerColor;
  ctx.fill();
  ctx.restore();
}

function drawLeaf(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  length: number,
  width: number,
  angle: number,
  fillColor = '#C7DEB9',
  strokeColor = '#6B8A61'
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(width, -length * 0.45, 0, -length);
  ctx.quadraticCurveTo(-width, -length * 0.45, 0, 0);
  ctx.closePath();
  ctx.fillStyle = fillColor;
  ctx.fill();
  ctx.lineWidth = 1.4;
  ctx.strokeStyle = strokeColor;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, -length * 0.08);
  ctx.lineTo(0, -length * 0.85);
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
}

function drawTulipBud(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  angle: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  // Back petals
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-size * 0.55, -size * 0.25, -size * 0.5, -size * 0.95, -size * 0.15, -size);
  ctx.lineTo(0, -size * 0.72);
  ctx.lineTo(size * 0.15, -size);
  ctx.bezierCurveTo(size * 0.5, -size * 0.95, size * 0.55, -size * 0.25, 0, 0);
  ctx.closePath();
  ctx.fillStyle = '#F7C4CD';
  ctx.fill();
  ctx.lineWidth = 1.4;
  ctx.strokeStyle = '#C96D80';
  ctx.stroke();

  // Center petal
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-size * 0.28, -size * 0.3, -size * 0.22, -size * 0.95, 0, -size * 1.06);
  ctx.bezierCurveTo(size * 0.22, -size * 0.95, size * 0.28, -size * 0.3, 0, 0);
  ctx.closePath();
  ctx.fillStyle = '#FDE1E6';
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

function drawCuteCloudMascot(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  // Little blue stick legs
  ctx.strokeStyle = '#6BA6C9';
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-10, 14);
  ctx.lineTo(-10, 26);
  ctx.lineTo(-14, 27);
  ctx.moveTo(10, 14);
  ctx.lineTo(10, 26);
  ctx.lineTo(14, 27);
  // Little side arms
  ctx.moveTo(-25, 3);
  ctx.lineTo(-32, 9);
  ctx.moveTo(25, 3);
  ctx.lineTo(32, -2);
  ctx.stroke();

  // Scalloped cloud puff body
  const puffs = [
    { x: -16, y: 2, r: 12 },
    { x: -11, y: -11, r: 13 },
    { x: 4, y: -14, r: 14 },
    { x: 17, y: -5, r: 12 },
    { x: 16, y: 8, r: 11 },
    { x: 0, y: 12, r: 13 },
    { x: -12, y: 10, r: 10 },
  ];
  ctx.fillStyle = '#F9D6DC';
  ctx.strokeStyle = '#CE798B';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(0, 0, 22, 0, Math.PI * 2);
  ctx.fill();
  puffs.forEach((p) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  });

  // Soft outer rim strokes on top lobes
  ctx.beginPath();
  ctx.arc(-11, -11, 13, Math.PI * 0.9, Math.PI * 1.78);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(4, -14, 14, Math.PI * 1.05, Math.PI * 1.9);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(17, -5, 12, Math.PI * 1.4, Math.PI * 0.35);
  ctx.stroke();

  // Inner pale face
  ctx.beginPath();
  ctx.ellipse(0, 1, 16, 12, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#FFF7F8';
  ctx.fill();

  // Cheeks
  ctx.fillStyle = '#F7A9B8';
  ctx.beginPath();
  ctx.ellipse(-9, 3, 3.2, 2, 0, 0, Math.PI * 2);
  ctx.ellipse(9, 3, 3.2, 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eyes & smile
  ctx.fillStyle = '#3B6488';
  ctx.beginPath();
  ctx.arc(-5, -1, 1.8, 0, Math.PI * 2);
  ctx.arc(5, -1, 1.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#3B6488';
  ctx.lineWidth = 1.9;
  ctx.beginPath();
  ctx.arc(0, 1.5, 4.5, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();

  ctx.restore();
}

function buildOgeeLabelPath(ctx: CanvasRenderingContext2D, w: number, h: number, inset = 0) {
  const cx = w / 2;
  const topY = inset + 20;
  const botY = h - inset - 20;
  const halfW = w * 0.43 - inset;

  ctx.beginPath();
  ctx.moveTo(cx, topY);
  // Right upper scallops
  ctx.bezierCurveTo(cx + halfW * 0.32, topY + 28, cx + halfW * 0.72, topY + 62, cx + halfW * 0.76, h * 0.21);
  ctx.bezierCurveTo(cx + halfW * 0.84, h * 0.27, cx + halfW * 0.9, h * 0.33, cx + halfW * 0.86, h * 0.39);
  ctx.bezierCurveTo(cx + halfW * 1.04, h * 0.44, cx + halfW * 1.04, h * 0.56, cx + halfW * 0.86, h * 0.61);
  ctx.bezierCurveTo(cx + halfW * 0.9, h * 0.67, cx + halfW * 0.84, h * 0.73, cx + halfW * 0.76, h * 0.79);
  ctx.bezierCurveTo(cx + halfW * 0.72, botY - 62, cx + halfW * 0.32, botY - 28, cx, botY);
  // Left scallops mirrored
  ctx.bezierCurveTo(cx - halfW * 0.32, botY - 28, cx - halfW * 0.72, botY - 62, cx - halfW * 0.76, h * 0.79);
  ctx.bezierCurveTo(cx - halfW * 0.84, h * 0.73, cx - halfW * 0.9, h * 0.67, cx - halfW * 0.86, h * 0.61);
  ctx.bezierCurveTo(cx - halfW * 1.04, h * 0.56, cx - halfW * 1.04, h * 0.44, cx - halfW * 0.86, h * 0.39);
  ctx.bezierCurveTo(cx - halfW * 0.9, h * 0.33, cx - halfW * 0.84, h * 0.27, cx - halfW * 0.76, h * 0.21);
  ctx.bezierCurveTo(cx - halfW * 0.72, topY + 62, cx - halfW * 0.32, topY + 28, cx, topY);
  ctx.closePath();
}

/**
 * Generates the scalloped Floris front sticker CanvasTexture matching IMG_20261117_081828 & poster PDF.
 */
export function createFlorisLabelTexture(
  totalVolume: number,
  concentrationPercent: number,
  maxAnisotropy = 4
): THREE.CanvasTexture {
  const width = 512;
  const height = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.clearRect(0, 0, width, height);

    // Clip to scalloped ogee label shape
    ctx.save();
    buildOgeeLabelPath(ctx, width, height, 6);
    ctx.clip();

    // Cream parchment radial wash
    const bgGrad = ctx.createRadialGradient(width * 0.5, height * 0.48, 40, width * 0.5, height * 0.5, height * 0.52);
    bgGrad.addColorStop(0, '#FFF6F7');
    bgGrad.addColorStop(0.55, '#FAF3E8');
    bgGrad.addColorStop(1, '#F3ECE0');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle botanical vines & watercolor flowers on edges
    // Left top stem + tulip + leaves
    ctx.strokeStyle = '#738C68';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(64, 305);
    ctx.quadraticCurveTo(106, 225, 162, 184);
    ctx.stroke();
    drawLeaf(ctx, 108, 250, 42, 12, -0.5);
    drawLeaf(ctx, 134, 220, 34, 10, 0.9);
    drawTulipBud(ctx, 125, 212, 34, -0.35);
    drawFivePetalFlower(ctx, 152, 240, 11, '#FEF08A', '#D4A82A', '#E6B800', 0.2);

    // Right top hanging branch
    ctx.beginPath();
    ctx.moveTo(width - 66, 285);
    ctx.quadraticCurveTo(width - 118, 200, width - 178, 178);
    ctx.stroke();
    drawLeaf(ctx, width - 122, 224, 38, 10, 0.6);
    drawLeaf(ctx, width - 150, 198, 30, 9, -0.8);
    drawTulipBud(ctx, width - 165, 228, 26, Math.PI * 0.85);
    drawFivePetalFlower(ctx, width - 110, 310, 15, '#FEF08A', '#D4A82A', '#E5B217', 0.3);

    // Left lower tulip stems
    ctx.beginPath();
    ctx.moveTo(85, 760);
    ctx.quadraticCurveTo(72, 660, 88, 575);
    ctx.moveTo(118, 860);
    ctx.quadraticCurveTo(105, 780, 102, 710);
    ctx.stroke();
    drawLeaf(ctx, 74, 650, 44, 11, -0.4);
    drawLeaf(ctx, 96, 785, 42, 11, 0.45);
    drawTulipBud(ctx, 88, 575, 36, 0.12);
    drawTulipBud(ctx, 103, 710, 34, -0.15);
    drawFivePetalFlower(ctx, 74, 465, 16, '#FEF08A', '#CFA120', '#EAB308', 0.1);
    drawFivePetalFlower(ctx, 146, 662, 12, '#FBCFE8', '#D16D88', '#FDE047', 0.4);

    // Right lower tulip stems
    ctx.beginPath();
    ctx.moveTo(width - 82, 748);
    ctx.quadraticCurveTo(width - 68, 638, width - 85, 535);
    ctx.moveTo(width - 115, 862);
    ctx.quadraticCurveTo(width - 102, 780, width - 98, 718);
    ctx.stroke();
    drawLeaf(ctx, width - 74, 615, 44, 11, 0.42);
    drawLeaf(ctx, width - 96, 780, 42, 11, -0.45);
    drawTulipBud(ctx, width - 85, 535, 38, -0.12);
    drawTulipBud(ctx, width - 99, 716, 33, 0.16);
    drawFivePetalFlower(ctx, width - 118, 608, 15, '#FEF08A', '#CFA120', '#EAB308', -0.2);
    drawFivePetalFlower(ctx, width - 148, 672, 12, '#FBCFE8', '#D16D88', '#FDE047', -0.3);

    // Top centerpiece flower
    drawFivePetalFlower(ctx, width / 2, 118, 22, '#F89BAA', '#DE7788', '#FCE7C8', 0.15);
    drawFivePetalFlower(ctx, width / 2 + 76, 338, 12, '#FBCFE8', '#CE6B84', '#FEF08A', 0.25);

    // Floris Logo Typography (olive-sage serif-script + pink blossom 'o' + mini flower dot on 'i')
    ctx.fillStyle = '#6B7C61';
    ctx.textBaseline = 'middle';
    ctx.font = 'italic 700 104px "Cormorant Garamond", Georgia, serif';
    ctx.textAlign = 'right';
    ctx.fillText('Fl', width / 2 - 22, 412);

    // Flower 'o'
    drawFivePetalFlower(ctx, width / 2 + 3, 420, 22, '#F68FA0', '#DF7587', '#FCE5C8', 0.1);

    // 'ris' without dot on i, draw mini flower dot
    ctx.textAlign = 'left';
    ctx.fillStyle = '#6B7C61';
    ctx.fillText('rıs', width / 2 + 27, 412);
    drawFivePetalFlower(ctx, width / 2 + 83, 373, 8.5, '#F68FA0', '#DF7587', '#FEF08A', 0.2);

    // EAU DE PARFUM
    ctx.textAlign = 'center';
    ctx.fillStyle = '#6E7B67';
    ctx.font = '700 22px "Plus Jakarta Sans", Arial, sans-serif';
    ctx.fillText('E A U   D E   P A R F U M', width / 2, 492);

    // Natural Spray + swash line
    ctx.fillStyle = '#6B7C61';
    ctx.font = 'italic 600 42px "Cormorant Garamond", Georgia, serif';
    ctx.fillText('Natural Spray', width / 2, 548);

    ctx.strokeStyle = '#73856C';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 76, 586);
    ctx.bezierCurveTo(width / 2 - 25, 594, width / 2 + 35, 578, width / 2 + 68, 567);
    ctx.stroke();

    // Heart outline
    ctx.strokeStyle = '#6F7C67';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    const hx = width / 2;
    const hy = 656;
    ctx.moveTo(hx, hy + 14);
    ctx.bezierCurveTo(hx - 18, hy + 2, hx - 16, hy - 14, hx - 7, hy - 14);
    ctx.bezierCurveTo(hx - 2, hy - 14, hx, hy - 7, hx, hy - 7);
    ctx.bezierCurveTo(hx, hy - 7, hx + 2, hy - 14, hx + 7, hy - 14);
    ctx.bezierCurveTo(hx + 16, hy - 14, hx + 18, hy + 2, hx, hy + 14);
    ctx.stroke();

    // Volume + Concentration line
    ctx.fillStyle = '#6B7C61';
    ctx.font = '600 27px "Cormorant Garamond", Georgia, serif';
    ctx.fillText(`${totalVolume} ml`, width / 2, 706);

    ctx.fillStyle = '#9D6B77';
    ctx.font = '600 17px "Plus Jakarta Sans", Arial, sans-serif';
    ctx.fillText(`${concentrationPercent}% ESSENCE`, width / 2, 734);

    // Cute pastel cloud mascot at bottom
    drawCuteCloudMascot(ctx, width / 2, 822, 1.35);

    ctx.restore();

    // Outer border & dashed inner stitching
    ctx.save();
    buildOgeeLabelPath(ctx, width, height, 6);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#9E857F';
    ctx.stroke();

    buildOgeeLabelPath(ctx, width, height, 18);
    ctx.setLineDash([8, 7]);
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = '#B89E96';
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Generates horizontal brushed metallic roughness texture for the tall silver cap & crimp collar.
 */
export function createBrushedMetalRoughnessTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#383838';
    ctx.fillRect(0, 0, size, size);

    for (let y = 0; y < size; y++) {
      const shade = 44 + Math.floor((Math.sin(y * 0.9) * 0.5 + 0.5) * 32 + ((y * 17) % 19));
      ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
      ctx.fillRect(0, y, size, 1);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 3);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Generates a warm travertine / limestone pedestal texture inspired by the poster PDF.
 */
export function createTravertineTexture(maxAnisotropy = 4): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, '#E9D7CF');
    grad.addColorStop(0.5, '#DEC6BC');
    grad.addColorStop(1, '#D1B5AA');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // Subtle limestone pores & horizontal veins
    for (let i = 0; i < 420; i++) {
      const x = (i * 97) % size;
      const y = (i * 53) % size;
      const w = 10 + ((i * 19) % 34);
      const h = 1.5 + ((i * 7) % 3);
      ctx.fillStyle = i % 3 === 0 ? 'rgba(255,250,247,0.45)' : 'rgba(145,112,98,0.24)';
      ctx.fillRect(x, y, w, h);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = maxAnisotropy;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Generates pastel pink & silver botanical packaging textures matching Floris_thiet_ke_hop PDF.
 */
export function createFlorisBoxTextures(
  totalVolume: number,
  maxAnisotropy = 4
): { front: THREE.CanvasTexture; side: THREE.CanvasTexture; top: THREE.CanvasTexture } {
  const drawBotanicalWash = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, '#F7CEDB');
    bg.addColorStop(0.55, '#F2B8CA');
    bg.addColorStop(1, '#EAA5BC');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Crisp subtle edge trim frame
    ctx.strokeStyle = 'rgba(255, 245, 249, 0.72)';
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, w - 8, h - 8);

    // Lower watercolor petal blossom accents
    ctx.save();
    ctx.globalAlpha = 0.78;
    drawLeaf(ctx, w * 0.22, h * 0.25, 110, 22, 0.55, '#CDE2C5', '#76956E');
    drawLeaf(ctx, w * 0.78, h * 0.78, 125, 25, -0.45, '#CDE2C5', '#76956E');
    drawLeaf(ctx, w * 0.2, h * 0.88, 115, 24, 0.35, '#D7E7D0', '#819F7A');
    drawTulipBud(ctx, w * 0.28, h * 0.84, 96, 0.2);
    drawTulipBud(ctx, w * 0.72, h * 0.86, 86, -0.25);
    ctx.restore();

    // Silver sparkle stars
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    [
      [w * 0.72, h * 0.24, 9],
      [w * 0.25, h * 0.58, 7],
      [w * 0.76, h * 0.64, 6],
    ].forEach(([sx, sy, sr]) => {
      ctx.beginPath();
      ctx.moveTo(sx, sy - sr);
      ctx.lineTo(sx + sr * 0.28, sy - sr * 0.28);
      ctx.lineTo(sx + sr, sy);
      ctx.lineTo(sx + sr * 0.28, sy + sr * 0.28);
      ctx.lineTo(sx, sy + sr);
      ctx.lineTo(sx - sr * 0.28, sy + sr * 0.28);
      ctx.lineTo(sx - sr, sy);
      ctx.lineTo(sx - sr * 0.28, sy - sr * 0.28);
      ctx.closePath();
      ctx.fill();
    });
  };

  // Front box panel
  const fCanvas = document.createElement('canvas');
  fCanvas.width = 256;
  fCanvas.height = 1024;
  const fCtx = fCanvas.getContext('2d');
  if (fCtx) {
    drawBotanicalWash(fCtx, 256, 1024);
    fCtx.fillStyle = '#8F5B69';
    fCtx.font = 'italic 700 44px "Cormorant Garamond", Georgia, serif';
    fCtx.textAlign = 'right';
    fCtx.textBaseline = 'middle';
    fCtx.fillText('Fl', 112, 340);
    drawFivePetalFlower(fCtx, 125, 344, 10, '#E9778D', '#C9566D', '#FCE7C8', 0.1);
    fCtx.textAlign = 'left';
    fCtx.fillStyle = '#8F5B69';
    fCtx.fillText('ris', 137, 340);

    fCtx.textAlign = 'center';
    fCtx.font = '700 12px "Plus Jakarta Sans", Arial, sans-serif';
    fCtx.fillText('E A U   D E   P A R F U M', 128, 384);
    fCtx.font = 'italic 600 20px "Cormorant Garamond", Georgia, serif';
    fCtx.fillText('Natural Spray', 128, 414);

    fCtx.font = '600 16px "Cormorant Garamond", Georgia, serif';
    fCtx.fillText(`${totalVolume} ml`, 128, 920);
  }

  // Side box panel
  const sCanvas = document.createElement('canvas');
  sCanvas.width = 256;
  sCanvas.height = 1024;
  const sCtx = sCanvas.getContext('2d');
  if (sCtx) {
    drawBotanicalWash(sCtx, 256, 1024);
    sCtx.fillStyle = '#7C5A64';
    sCtx.textAlign = 'center';
    sCtx.font = 'italic 600 21px "Cormorant Garamond", Georgia, serif';
    ['Bloom', 'in every', 'moment'].forEach((line, idx) => {
      sCtx.fillText(line, 128, 390 + idx * 28);
    });
    drawFivePetalFlower(sCtx, 128, 336, 11, '#FBCFE8', '#9D6271', '#FFF8EC', 0);
  }

  // Top square flap
  const tCanvas = document.createElement('canvas');
  tCanvas.width = 256;
  tCanvas.height = 256;
  const tCtx = tCanvas.getContext('2d');
  if (tCtx) {
    tCtx.fillStyle = '#F8D7E1';
    tCtx.fillRect(0, 0, 256, 256);
    drawFivePetalFlower(tCtx, 128, 128, 28, '#E4899D', '#B65D73', '#FCE7C8', 0.15);
  }

  const front = new THREE.CanvasTexture(fCanvas);
  front.colorSpace = THREE.SRGBColorSpace;
  front.anisotropy = maxAnisotropy;

  const side = new THREE.CanvasTexture(sCanvas);
  side.colorSpace = THREE.SRGBColorSpace;
  side.anisotropy = maxAnisotropy;

  const top = new THREE.CanvasTexture(tCanvas);
  top.colorSpace = THREE.SRGBColorSpace;
  top.anisotropy = maxAnisotropy;

  return { front, side, top };
}

/**
 * Generates radial contact shadow alpha texture so the bottle sits grounded even without shadow maps.
 */
export function createContactShadowTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const grad = ctx.createRadialGradient(size / 2, size / 2, 8, size / 2, size / 2, size / 2);
    grad.addColorStop(0, 'rgba(130, 88, 102, 0.34)');
    grad.addColorStop(0.45, 'rgba(130, 88, 102, 0.16)');
    grad.addColorStop(1, 'rgba(130, 88, 102, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}
