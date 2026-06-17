import { GAME_WIDTH, GAME_HEIGHT, GROUND_Y } from '../constants';

interface Cloud {
  x: number;
  y: number;
  scale: number;
}

// 视差滚动背景: 远景云朵慢速、地面纹理快速。
export class Background {
  private clouds: Cloud[] = [];
  private groundOffset = 0;
  private skyColor: string;
  private groundColor: string;
  private cloudColor: string;

  constructor(skyColor: string, groundColor: string, cloudColor: string) {
    this.skyColor = skyColor;
    this.groundColor = groundColor;
    this.cloudColor = cloudColor;
    for (let i = 0; i < 5; i++) {
      this.clouds.push({
        x: Math.random() * GAME_WIDTH,
        y: 60 + Math.random() * 220,
        scale: 0.6 + Math.random() * 0.8,
      });
    }
  }

  update(dt: number, speed: number): void {
    // 云朵以 15% 速度漂移
    for (const c of this.clouds) {
      c.x -= speed * 0.15 * dt;
      if (c.x < -120) {
        c.x = GAME_WIDTH + 120;
        c.y = 60 + Math.random() * 220;
        c.scale = 0.6 + Math.random() * 0.8;
      }
    }
    // 地面纹理全速滚动
    this.groundOffset = (this.groundOffset + speed * dt) % 60;
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.skyColor;
    ctx.fillRect(0, 0, GAME_WIDTH, GROUND_Y);

    // 云
    ctx.fillStyle = this.cloudColor;
    for (const c of this.clouds) {
      this.drawCloud(ctx, c.x, c.y, c.scale);
    }

    // 地面
    ctx.fillStyle = this.groundColor;
    ctx.fillRect(0, GROUND_Y, GAME_WIDTH, GAME_HEIGHT - GROUND_Y);

    // 地面线
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.fillRect(0, GROUND_Y, GAME_WIDTH, 5);

    // 传送带纹理(滚动竖纹)
    ctx.fillStyle = 'rgba(0,0,0,0.07)';
    for (let x = -this.groundOffset; x < GAME_WIDTH; x += 60) {
      ctx.fillRect(x, GROUND_Y + 14, 30, 8);
    }
  }

  private drawCloud(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    s: number
  ): void {
    ctx.beginPath();
    ctx.arc(x, y, 26 * s, 0, Math.PI * 2);
    ctx.arc(x + 30 * s, y - 6 * s, 34 * s, 0, Math.PI * 2);
    ctx.arc(x + 64 * s, y, 24 * s, 0, Math.PI * 2);
    ctx.fill();
  }
}
