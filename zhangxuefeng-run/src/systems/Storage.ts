import { STORAGE_HIGHSCORE, STORAGE_PROGRESS } from '../constants';

// 本机进度/最高分持久化(localStorage)。读写失败时静默降级。

export function getHighScore(): number {
  try {
    return Number(localStorage.getItem(STORAGE_HIGHSCORE)) || 0;
  } catch {
    return 0;
  }
}

export function setHighScore(score: number): void {
  try {
    if (score > getHighScore()) {
      localStorage.setItem(STORAGE_HIGHSCORE, String(Math.floor(score)));
    }
  } catch {
    /* ignore */
  }
}

// 已通关的最高关卡 id(0 = 尚未通关任何关)
export function getProgress(): number {
  try {
    return Number(localStorage.getItem(STORAGE_PROGRESS)) || 0;
  } catch {
    return 0;
  }
}

export function setProgress(levelId: number): void {
  try {
    if (levelId > getProgress()) {
      localStorage.setItem(STORAGE_PROGRESS, String(levelId));
    }
  } catch {
    /* ignore */
  }
}
