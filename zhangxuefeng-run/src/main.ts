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

// 尽早初始化并播放菜单背景音乐(进入网站即尝试自动播放)。
AudioManager.init();
AudioManager.playBgm('menu');

// 浏览器自动播放策略可能拦截无声手势前的播放。
// 首次用户交互再补一次播放, 确保一定能响。
function resumeAudioOnce() {
  AudioManager.init();
  AudioManager.playBgm('menu');
  window.removeEventListener('pointerdown', resumeAudioOnce);
  window.removeEventListener('keydown', resumeAudioOnce);
  window.removeEventListener('touchstart', resumeAudioOnce);
}
window.addEventListener('pointerdown', resumeAudioOnce);
window.addEventListener('keydown', resumeAudioOnce);
window.addEventListener('touchstart', resumeAudioOnce);
