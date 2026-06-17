import type { Game } from '../Game';
import type { InputState } from '../types';

// 场景基类。所有场景(菜单/游戏/结算)继承它。
export abstract class Scene {
  protected game: Game;

  constructor(game: Game) {
    this.game = game;
  }

  // 进入场景时调用(可选重写)
  enter(): void {}

  // 离开场景时调用(可选重写)
  exit(): void {}

  // 每帧更新逻辑。dt 为秒。
  abstract update(dt: number, input: InputState): void;

  // 每帧绘制。
  abstract render(ctx: CanvasRenderingContext2D): void;
}
