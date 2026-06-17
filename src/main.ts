import './style.css';
import { Game } from './Game';
import { MenuScene } from './scenes/MenuScene';
import { AudioManager } from './systems/AudioManager';
import { ItemSprites } from './systems/ItemSprites';

ItemSprites.load();

const canvas = document.getElementById('game') as HTMLCanvasElement;
const game = new Game(canvas);
game.start(new MenuScene(game));

// 首次用户交互后初始化音频(浏览器自动播放策略)
function initAudioOnce() {
  AudioManager.init();
  AudioManager.playBgm('menu');
  window.removeEventListener('pointerdown', initAudioOnce);
  window.removeEventListener('keydown', initAudioOnce);
}
window.addEventListener('pointerdown', initAudioOnce);
window.addEventListener('keydown', initAudioOnce);
