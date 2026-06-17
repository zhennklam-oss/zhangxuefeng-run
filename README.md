# 张雪峰快跑

网页跨栏躲避跑酷小游戏。桌面用 W/S（或 ↑/↓）跳跃/滑铲，手机点屏幕上半区跳、下半区滑。六关闯关 + 通关后解锁无尽模式。

## 本地运行

```bash
npm install
npm run dev      # 开发服务器
npm run build    # 生产构建到 dist/
npm run preview  # 预览构建产物
```

## 操作

| 动作 | 键盘 | 触屏 |
|------|------|------|
| 跳跃 | W / ↑ / 空格 | 点屏幕上半区 |
| 滑铲 | S / ↓ | 点屏幕下半区 |

## 技术栈

Vite + TypeScript + 原生 Canvas 2D，音频用 Howler.js。无游戏引擎依赖。

## 目录结构

```
src/
├── Game.ts              主循环 + 场景切换 + 响应式缩放
├── main.ts              入口
├── constants.ts         全局常量(含 assetUrl 资源路径助手)
├── types.ts             类型定义
├── scenes/              菜单/选关/游戏/无尽/结算 场景
├── entities/            Player / Obstacle / Background
├── systems/             输入/碰撞/计分/关卡/音频/精灵/粒子/特效/存档
└── config/levels.ts     关卡配置表(数据驱动)
```

## 替换美术 / 音频素材

- **人物精灵**：`public/assets/sprites/character.png`，3×3 九姿势，每格等大。
  帧映射见 `src/systems/SpriteLoader.ts` 的 `FRAME` 常量。
- **音频**：放入 `public/assets/audio/`，文件名见 `src/systems/AudioManager.ts`
  （`bgm-menu.mp3`、`bgm-level.mp3`、`sfx-jump/slide/hit/pass/combo.mp3`）。
  文件缺失时自动静默降级，不影响运行。

## 编辑关卡

所有关卡在 `src/config/levels.ts` 中定义（数据驱动）。当前为 6 关占位配置，
修改名称、距离、速度、配色、障碍物配方即可，无需改动游戏逻辑。

## 部署到 GitHub Pages

1. 推送到 GitHub 仓库的 `main` 分支。
2. 仓库 Settings → Pages → Source 选择 **GitHub Actions**。
3. `.github/workflows/deploy.yml` 会自动构建并部署，base 路径自动取仓库名。

本地若需模拟子路径构建：`VITE_BASE=/仓库名/ npm run build`。
