import { Howl, Howler } from 'howler';
import { assetUrl } from '../constants';

export type SfxName = 'jump' | 'slide' | 'hit' | 'pass' | 'combo';
export type BgmName = 'menu' | 'level';

const SFX_FILES: Record<SfxName, string> = {
  jump: assetUrl('assets/audio/sfx-jump.mp3'),
  slide: assetUrl('assets/audio/sfx-slide.mp3'),
  hit: assetUrl('assets/audio/sfx-hit.mp3'),
  pass: assetUrl('assets/audio/sfx-pass.mp3'),
  combo: assetUrl('assets/audio/sfx-combo.mp3'),
};

const BGM_FILES: Record<BgmName, string> = {
  menu: assetUrl('assets/audio/bgm.mp3'),
  level: assetUrl('assets/audio/bgm.mp3'),
};

// 封装 Howler。音频文件缺失时静默降级,不影响游戏运行。
class AudioManagerImpl {
  private sfx = new Map<SfxName, Howl>();
  private bgm = new Map<BgmName, Howl>();
  private currentBgm: Howl | null = null;
  private muted = false;
  private loaded = false;

  // 首次用户交互后再加载,符合浏览器自动播放策略。
  init(): void {
    if (this.loaded) return;
    this.loaded = true;
    for (const [name, src] of Object.entries(SFX_FILES)) {
      this.sfx.set(
        name as SfxName,
        new Howl({ src: [src], volume: 0.6, preload: true, onloaderror: () => {} })
      );
    }
    for (const [name, src] of Object.entries(BGM_FILES)) {
      this.bgm.set(
        name as BgmName,
        new Howl({
          src: [src],
          volume: 0.4,
          loop: true,
          preload: true,
          onloaderror: () => {},
        })
      );
    }
  }

  play(name: SfxName): void {
    if (this.muted) return;
    const h = this.sfx.get(name);
    // state()==='loaded' 才播,避免未加载/失败时报错
    if (h && h.state() === 'loaded') h.play();
  }

  playBgm(name: BgmName): void {
    const next = this.bgm.get(name);
    if (!next) return;
    if (this.currentBgm === next) {
      // 已是当前曲目: 若没在响(被自动播放策略拦截过), 补播一次
      this.tryPlay(next);
      return;
    }
    if (this.currentBgm) this.currentBgm.stop();
    this.currentBgm = next;
    this.tryPlay(next);
  }

  // 立即播放; 若文件尚未加载完成, 等加载完成后再播(仍是当前曲目且未静音时)。
  private tryPlay(h: Howl): void {
    if (this.muted) return;
    if (h.state() === 'loaded') {
      if (!h.playing()) h.play();
    } else {
      h.once('load', () => {
        if (!this.muted && this.currentBgm === h && !h.playing()) h.play();
      });
    }
  }

  stopBgm(): void {
    if (this.currentBgm) this.currentBgm.stop();
    this.currentBgm = null;
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    Howler.mute(this.muted);
    return this.muted;
  }

  get isMuted(): boolean {
    return this.muted;
  }
}

export const AudioManager = new AudioManagerImpl();
