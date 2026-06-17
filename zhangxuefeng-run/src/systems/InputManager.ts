import type { InputState } from '../types';
import { GAME_HEIGHT, GAME_WIDTH } from '../constants';

// 统一键盘 + 触屏输入，归一化为 InputState。
// jump/slide/confirm 均为"边沿触发"(本帧刚按下,消费后清零)。
export class InputManager {
  private jumpQueued = false;
  private confirmQueued = false;
  private slideQueued = false;

  // 触屏滑动手势: 记录起始触点, 跨过阈值即触发(每次手势只触发一次)
  private swipeStartY = 0;
  private swipeId: number | null = null;
  private swipeFired = false;

  // 菜单用: 最近一次点按的游戏坐标(供 UI 按钮命中检测)
  private tap: { x: number; y: number } | null = null;

  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    canvas.addEventListener('touchstart', this.onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', this.onTouchMove, { passive: false });
    canvas.addEventListener('touchend', this.onTouchEnd, { passive: false });
    canvas.addEventListener('touchcancel', this.onTouchEnd, { passive: false });
    canvas.addEventListener('pointerdown', this.onPointerDown);
  }

  // 将客户端坐标换算为游戏逻辑坐标
  private toGameCoords(clientX: number, clientY: number) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * GAME_WIDTH,
      y: ((clientY - rect.top) / rect.height) * GAME_HEIGHT,
    };
  }

  private onPointerDown = (e: PointerEvent) => {
    this.tap = this.toGameCoords(e.clientX, e.clientY);
    this.confirmQueued = true;
  };

  // 取出并清空本帧点按(菜单按钮检测用)
  consumeTap(): { x: number; y: number } | null {
    const t = this.tap;
    this.tap = null;
    return t;
  }

  private onKeyDown = (e: KeyboardEvent) => {
    if (e.repeat) return;
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
      case 'Space':
        this.jumpQueued = true;
        this.confirmQueued = true;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.slideQueued = true;
        break;
      case 'Enter':
        this.confirmQueued = true;
        break;
    }
  };

  private onKeyUp = (_e: KeyboardEvent) => {
    // slide 改为边沿触发,无需处理松开
  };

  // 上滑 => 跳跃, 下滑 => 滑铲。阈值用游戏逻辑坐标(720 高), 约 6%。
  private static SWIPE_THRESHOLD = GAME_HEIGHT * 0.06;

  private onTouchStart = (e: TouchEvent) => {
    e.preventDefault();
    if (this.swipeId !== null) return; // 已在跟踪一个手势
    const t = e.changedTouches[0];
    if (!t) return;
    this.swipeId = t.identifier;
    this.swipeStartY = this.toGameCoords(t.clientX, t.clientY).y;
    this.swipeFired = false;
  };

  private onTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    if (this.swipeId === null || this.swipeFired) return;
    const t = this.findTouch(e.changedTouches, this.swipeId);
    if (!t) return;
    const y = this.toGameCoords(t.clientX, t.clientY).y;
    const dy = y - this.swipeStartY;
    if (dy <= -InputManager.SWIPE_THRESHOLD) {
      this.jumpQueued = true;
      this.swipeFired = true;
    } else if (dy >= InputManager.SWIPE_THRESHOLD) {
      this.slideQueued = true;
      this.swipeFired = true;
    }
  };

  private onTouchEnd = (e: TouchEvent) => {
    e.preventDefault();
    if (this.swipeId === null) return;
    const ended = this.findTouch(e.changedTouches, this.swipeId);
    if (ended) this.swipeId = null; // 跟踪的手指抬起, 结束本次手势
  };

  private findTouch(list: TouchList, id: number): Touch | null {
    for (let i = 0; i < list.length; i++) {
      if (list[i].identifier === id) return list[i];
    }
    return null;
  }

  // 每帧读取并清空边沿触发标志
  poll(): InputState {
    const state: InputState = {
      jump: this.jumpQueued,
      slide: this.slideQueued,
      confirm: this.confirmQueued,
    };
    this.jumpQueued = false;
    this.confirmQueued = false;
    this.slideQueued = false;
    return state;
  }
}
