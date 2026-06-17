import type { InputState } from '../types';
import { GAME_HEIGHT, GAME_WIDTH } from '../constants';

// 统一键盘 + 触屏输入，归一化为 InputState。
// jump/confirm 为"边沿触发"(本帧刚按下)，slide 为"按住"状态。
export class InputManager {
  private jumpQueued = false;
  private confirmQueued = false;
  private slideHeld = false;

  // 触屏: 记录每个触点落在上半区还是下半区
  private touchTopActive = false;
  private touchBottomActive = false;

  // 菜单用: 最近一次点按的游戏坐标(供 UI 按钮命中检测)
  private tap: { x: number; y: number } | null = null;

  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    canvas.addEventListener('touchstart', this.onTouchStart, { passive: false });
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
        this.slideHeld = true;
        break;
      case 'Enter':
        this.confirmQueued = true;
        break;
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    if (e.code === 'KeyS' || e.code === 'ArrowDown') {
      this.slideHeld = false;
    }
  };

  // 触点 y 落在上 60% => 跳跃, 下 40% => 滑铲
  private classifyTouches(touches: TouchList) {
    const rect = this.canvas.getBoundingClientRect();
    this.touchTopActive = false;
    this.touchBottomActive = false;
    const splitRatio = 0.6;
    for (let i = 0; i < touches.length; i++) {
      const t = touches[i];
      const ly = ((t.clientY - rect.top) / rect.height) * GAME_HEIGHT;
      if (ly < GAME_HEIGHT * splitRatio) this.touchTopActive = true;
      else this.touchBottomActive = true;
    }
  }

  private onTouchStart = (e: TouchEvent) => {
    e.preventDefault();
    const before = this.touchTopActive;
    this.classifyTouches(e.touches);
    if (this.touchTopActive && !before) {
      this.jumpQueued = true;
      this.confirmQueued = true;
    }
    this.slideHeld = this.touchBottomActive;
  };

  private onTouchEnd = (e: TouchEvent) => {
    e.preventDefault();
    this.classifyTouches(e.touches);
    this.slideHeld = this.touchBottomActive;
  };

  // 每帧读取并清空边沿触发标志
  poll(): InputState {
    const state: InputState = {
      jump: this.jumpQueued,
      slide: this.slideHeld,
      confirm: this.confirmQueued,
    };
    this.jumpQueued = false;
    this.confirmQueued = false;
    return state;
  }
}
