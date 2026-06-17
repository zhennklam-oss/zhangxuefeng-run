import './style.css';
import { Game } from './Game';
import { MenuScene } from './scenes/MenuScene';
import { AudioManager } from './systems/AudioManager';
import { ItemSprites } from './systems/ItemSprites';
import { assetUrl } from './constants';

ItemSprites.load();

const canvas = document.getElementById('game') as HTMLCanvasElement;
const game = new Game(canvas);

// 加载像素字体(Zpix)。canvas 文本不等 CSS 字体, 用 FontFace API 显式加载。
// 加载完成前先用回退字体起跑, 完成后自动应用到后续绘制。
const zpix = new FontFace('Zpix', `url(${assetUrl('assets/fonts/zpix.woff2')})`);
zpix
  .load()
  .then((f) => {
    document.fonts.add(f);
  })
  .catch(() => {
    // 字体加载失败则维持系统字体, 不影响游戏运行
  })
  .finally(() => {
    game.start(new MenuScene(game));
  });

// 首次用户交互后初始化音频(浏览器自动播放策略)
function initAudioOnce() {
  AudioManager.init();
  AudioManager.playBgm('menu');
  window.removeEventListener('pointerdown', initAudioOnce);
  window.removeEventListener('keydown', initAudioOnce);
}
window.addEventListener('pointerdown', initAudioOnce);
window.addEventListener('keydown', initAudioOnce);
