interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  active: boolean;
}

// 轻量粒子系统(对象池)。用于落地尘土、滑铲尘、撞击迸溅。
export class ParticleSystem {
  private pool: Particle[] = [];

  private obtain(): Particle {
    let p = this.pool.find((x) => !x.active);
    if (!p) {
      p = {
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        life: 0,
        maxLife: 0,
        size: 0,
        color: '#fff',
        active: false,
      };
      this.pool.push(p);
    }
    return p;
  }

  // 在(x,y)处喷出 n 个粒子
  burst(
    x: number,
    y: number,
    n: number,
    color: string,
    opts: { spread?: number; speed?: number; up?: boolean } = {}
  ): void {
    const spread = opts.spread ?? Math.PI;
    const speed = opts.speed ?? 240;
    for (let i = 0; i < n; i++) {
      const p = this.obtain();
      const ang = opts.up
        ? -Math.PI / 2 + (Math.random() - 0.5) * spread
        : Math.PI + (Math.random() - 0.5) * spread;
      const sp = speed * (0.4 + Math.random() * 0.6);
      p.x = x;
      p.y = y;
      p.vx = Math.cos(ang) * sp;
      p.vy = Math.sin(ang) * sp;
      p.maxLife = 0.4 + Math.random() * 0.3;
      p.life = p.maxLife;
      p.size = 4 + Math.random() * 6;
      p.color = color;
      p.active = true;
    }
  }

  update(dt: number): void {
    for (const p of this.pool) {
      if (!p.active) continue;
      p.life -= dt;
      if (p.life <= 0) {
        p.active = false;
        continue;
      }
      p.vy += 600 * dt; // 轻重力
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    for (const p of this.pool) {
      if (!p.active) continue;
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1;
  }

  clear(): void {
    for (const p of this.pool) p.active = false;
  }
}
