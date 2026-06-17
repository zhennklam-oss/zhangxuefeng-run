import { assetUrl } from '../constants';
import type { EntityKind } from '../types';

const ITEM_FILES: Record<EntityKind, string> = {
  icecream: 'assets/sprites/items/icecream.png',
  sprite: 'assets/sprites/items/sprite.png',
  log: 'assets/sprites/items/log.png',
  paper: 'assets/sprites/items/paper.png',
  guitar: 'assets/sprites/items/guitar.png',
  heart: 'assets/sprites/items/heart.png',
  ambulance: 'assets/sprites/items/ambulance.png',
  book: 'assets/sprites/items/book.png',
};

// 加载所有物体贴图,按目标高度等比绘制(保留原始宽高比)。
class ItemSpritesImpl {
  private imgs = new Map<EntityKind, HTMLImageElement>();
  private ratios = new Map<EntityKind, number>(); // w/h

  load(): void {
    for (const [kind, url] of Object.entries(ITEM_FILES)) {
      const img = new Image();
      img.onload = () => {
        this.ratios.set(kind as EntityKind, img.width / img.height);
      };
      img.src = assetUrl(url);
      this.imgs.set(kind as EntityKind, img);
    }
  }

  // 给定目标高度,返回等比宽度(贴图未加载时回退到正方形)
  widthForHeight(kind: EntityKind, h: number): number {
    const r = this.ratios.get(kind);
    return r ? h * r : h;
  }

  draw(
    ctx: CanvasRenderingContext2D,
    kind: EntityKind,
    x: number,
    y: number,
    w: number,
    h: number,
    rotation = 0
  ): void {
    const img = this.imgs.get(kind);
    if (!img || !img.complete || img.naturalWidth === 0) return;
    if (rotation !== 0) {
      ctx.save();
      ctx.translate(x + w / 2, y + h / 2);
      ctx.rotate(rotation);
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
      ctx.restore();
    } else {
      ctx.drawImage(img, x, y, w, h);
    }
  }

  // 给 HUD 用: 直接拿到 image
  getImage(kind: EntityKind): HTMLImageElement | undefined {
    return this.imgs.get(kind);
  }
}

export const ItemSprites = new ItemSpritesImpl();
