import {
  COMBO_STEP,
  COMBO_MAX,
  AVOID_BONUS,
  PIXELS_PER_METER,
} from '../constants';

// 无尽模式计分: 距离分 × 连击倍率 + 躲避奖励。
export class ScoreManager {
  private distancePx = 0;
  private comboCount = 0;
  private bonus = 0;

  reset(): void {
    this.distancePx = 0;
    this.comboCount = 0;
    this.bonus = 0;
  }

  addDistance(dx: number): void {
    this.distancePx += dx;
  }

  // 成功躲避一个障碍: 连击 +1, 加奖励分
  onAvoid(): void {
    this.comboCount++;
    this.bonus += AVOID_BONUS;
  }

  // 撞击: 连击清零
  onHit(): void {
    this.comboCount = 0;
  }

  get multiplier(): number {
    return Math.min(COMBO_MAX, 1 + (this.comboCount > 0 ? this.comboCount - 1 : 0) * COMBO_STEP);
  }

  get combo(): number {
    return this.comboCount;
  }

  get meters(): number {
    return Math.floor(this.distancePx / PIXELS_PER_METER);
  }

  get total(): number {
    const distScore = (this.distancePx / PIXELS_PER_METER) * this.multiplier;
    return Math.floor(distScore + this.bonus);
  }
}
