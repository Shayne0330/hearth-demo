# Hearth — vibe coder 的归处

视觉概念 demo。把多个 IDE / 项目 / 临时会话抽象成一栋会呼吸的房子。

## 跑起来

```bash
cd hearth-demo
npm install
npm run dev
```

打开浏览器到 `http://localhost:5173`（或控制台提示的端口）。

## 操作

- **顶栏小药丸**：常态形态。点击或按 `⌘K` 唤起房子
- **房子展开**：4 个房间气质各不相同（活跃 / 休眠 / 积灰 / 归档），中间走廊连接
- **点击其他房间**：小人会沿着走廊走过去，房间气质继承到药丸
- **拖动便签**：把走廊边桌上的便签丢进任意房间，即可"归属"到那个项目
- **`ESC` / 点击"收起"**：回到药丸状态
- **右下角"自动演示"按钮**：一键完整看完所有概念，约 21 秒

## 当前完成度

✅ Phase 0–6, Phase 9 完成
- 药丸 + 呼吸
- 药丸 → 房子的形变展开
- 4 个房间状态化（光、家具、植物、咖啡、覆盖物）
- 小人沿走廊行走 + 抵达提示 + 切换回药丸
- 走廊便签 + 拖入房间被吸收的反馈
- 自动播放 demo 串起整段叙事 + 字幕

⏳ Phase 7（阁楼）+ Phase 8（像素美术升级）暂未做
- 阁楼：通过梯子上去看已归档的旧项目
- 美术：用 AI 生图替换块色资产，做更精细的像素画

## 技术栈

- Vite + React 18 + TypeScript
- Tailwind CSS v4（原生 vite plugin）
- Framer Motion（药丸展开 / 小人走路 / 便签拖拽）
- 像素风用 CSS image-rendering: pixelated + 手写色块 SVG

## 文件结构

```
src/
├── App.tsx                # 状态机 + 自动演示编排
├── components/
│   ├── Pill.tsx           # 顶部药丸
│   ├── House.tsx          # 房子俯视图（壳 + 路径计算 + 走路 + 抵达提示）
│   ├── Room.tsx           # 单个房间（家具/光/状态）
│   ├── Hallway.tsx        # 走廊（边桌 + 阁楼梯子）
│   ├── Character.tsx      # 像素小人 SVG
│   └── StickyNote.tsx     # 拖拽便签
├── data/projects.ts       # 假数据：4 个项目 + 3 张便签
└── index.css              # 主题色 + Tailwind v4 import
```
