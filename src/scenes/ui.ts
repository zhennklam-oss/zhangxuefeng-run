import type { Rect } from '../types';

// Canvas 按钮的轻量描述与绘制/命中工具。
export interface Button {
  rect: Rect;
  label: string;
  enabled: boolean;
}

export function makeButton(
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  enabled = true
): Button {
  return { rect: { x, y, w, h }, label, enabled };
}

export function hitButton(btn: Button, tap: { x: number; y: number }): boolean {
  if (!btn.enabled) return false;
  const r = btn.rect;
  return (
    tap.x >= r.x && tap.x <= r.x + r.w && tap.y >= r.y && tap.y <= r.y + r.h
  );
}

export function drawButton(
  ctx: CanvasRenderingContext2D,
  btn: Button,
  opts: { fill?: string; text?: string; font?: string } = {}
): void {
  const r = btn.rect;
  const fill = btn.enabled ? opts.fill ?? '#e74c3c' : '#b9b6bf';
  ctx.fillStyle = fill;
  roundRect(ctx, r.x, r.y, r.w, r.h, 14);
  ctx.fill();

  ctx.fillStyle = opts.text ?? '#fff';
  ctx.font = opts.font ?? 'bold 30px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(btn.label, r.x + r.w / 2, r.y + r.h / 2 + 1);
  ctx.textBaseline = 'alphabetic';
}

export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

// 开局操作提示叠层(关卡/无尽开始的起跑停留期间显示)
export function drawControlHint(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  const bw = 520;
  const bh = 96;
  roundRect(ctx, (width - bw) / 2, height / 2 - bh / 2, bw, bh, 16);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 28px system-ui, sans-serif';
  ctx.fillText('上半屏 / W·↑ 跳跃(可二段跳)', width / 2, height / 2 - 8);
  ctx.fillText('下半屏 / S·↓ 滑铲', width / 2, height / 2 + 30);
  ctx.restore();
  ctx.textAlign = 'left';
}

export function drawClouds(
  ctx: CanvasRenderingContext2D,
  color: string,
  width: number
): void {
  ctx.fillStyle = color;
  const blobs = [
    { x: width * 0.15, y: 110, r: 38 },
    { x: width * 0.18, y: 110, r: 50 },
    { x: width * 0.22, y: 110, r: 34 },
    { x: width * 0.7, y: 170, r: 32 },
    { x: width * 0.74, y: 170, r: 44 },
    { x: width * 0.78, y: 170, r: 30 },
  ];
  for (const b of blobs) {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
  }
}
