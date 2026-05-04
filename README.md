# 🦫 PixelPilot

> **通用 AI Coding Agent 可视化观测平台** — 让你的 AI 编程助手在像素办公室里"打工"

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Bun](https://img.shields.io/badge/Bun-1.0+-yellow.svg)](https://bun.sh/)

---

## 🎯 是什么

PixelPilot 是一个实时可视化平台，用来观测 AI Coding Agent 的工作状态。它把 Agent 的思考、工具调用、文件操作等行为映射到一个**像素风格的办公室场景**中。

```
  ╔════════════════════════════════════════════════════════════╗
  ║  你的 AI Agent 在像素办公室里上班 💻                         ║
  ║                                                             ║
  ║   ┌─────────────────────────────────────────────┐            ║
  ║   │  🪴        [@]  [@]              🪴        │            ║
  ║   │         working...  thinking...            │            ║
  ║   │                                             │            ║
  ║   │  ┌──────────────────────────┐                │            ║
  ║   │  │      📋 Meeting Room     │   [@] busy    │            ║
  ║   │  └──────────────────────────┘                │            ║
  ║   │                                             │            ║
  ║   │  🪴        [@]  [@]              🪴        │            ║
  ║   │  🦫 agent1    agent2  💭 thinking...        │            ║
  ║   └─────────────────────────────────────────────┘            ║
  ╚════════════════════════════════════════════════════════════╝
```

## ✨ 特性

| 特性 | 说明 |
|------|------|
| 🎨 **像素艺术渲染** | HiDPI Canvas，30 FPS 流畅动画，漂浮尘埃粒子氛围 |
| 📱 **响应式布局** | 移动端适配，聊天面板可折叠 |
| 🏢 **多区域办公室** | 6 工位、会议室、休息区 |
| 🤖 **多 Agent 并行** | 支持 beaver-bot、Claude Code 等 |
| 📡 **实时事件流** | SSE 推送，< 50ms 延迟 |
| 💬 **语义气泡** | thinking（黄）/ tool（蓝）/ done（绿） |
| 🔌 **一行代码接入** | 自动捕获所有工具调用 |

## 🚀 快速开始

### 1. 启动服务器

```bash
# Node.js
node server/server.js

# 或 Bun（推荐）
bun run server/server.js
```

### 2. 打开浏览器

```
http://localhost:7777
```

### 3. 发送测试事件

```bash
curl -X POST http://localhost:7777/event \
  -H "Content-Type: application/json" \
  -d '{"type":"tool","agent":"beaver","tool":"Read","message":"Reading config.py","file":"config.py"}'
```

## 🔌 一行代码接入（推荐）

### Python / beaver-agent

```python
import pixel_pilot

# 只需一行！自动追踪所有工具调用
pixel_pilot.connect()  # 默认 http://localhost:7777

# 或者指定地址
pixel_pilot.connect("http://your-server:7777")
```

**效果**：自动注入 `ToolRouter.route()`，所有工具调用自动发送到 PixelPilot，**无需修改任何现有代码**。

环境变量方式（最简单）：
```bash
export PIXEL_VIEWER_URL=http://localhost:7777
python your_agent.py  # 自动连接
```

### 手动发送事件

```python
pixel_pilot.send("thinking", message="分析需求...")
pixel_pilot.send("tool", tool="Read", file="main.py")
pixel_pilot.send("done", message="任务完成")
```

### 禁用追踪

```python
pixel_pilot.disconnect()  # 断开连接
```

## 📡 API 参考

### 端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/events` | GET | **SSE 实时事件流** |
| `/event` | POST | 发送单个事件 |
| `/events` | POST | 批量发送事件 |
| `/history` | GET | 最近 100 条历史 |
| `/clear` | POST | 清空历史 |
| `/status` | GET | 服务器状态 |

### 事件格式

```typescript
interface AgentEvent {
  id: string;
  type: "request" | "thinking" | "tool" | "tool_done" | "done" | "agent" | "system";
  agent: string;       // "beaver" | "claude" | "codex" | ...
  tool?: string;       // "Read" | "Edit" | "Bash" | ...
  file?: string;       // 相关文件路径
  message?: string;   // 显示内容
  status?: string;    // "active" | "idle" | "error"
  timestamp: string;  // ISO 8601
}
```

## 🏗️ 架构

```
┌─────────────────────────────────────────────────────────────────┐
│                      Node.js Server (:7777)                      │
│  HTTP POST /event  ──►  broadcast()  ──►  clients Set (SSE)    │
└───────────────────────────────┬─────────────────────────────────┘
                                │ SSE
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Browser                                  │
│  viewer.js ──► engine.js ──► renderer.js                        │
│       │                  │                                       │
│       │           ┌──────┴──────┐                               │
│       │           ▼             ▼                               │
│       │      character.js    bubble.js                           │
│       │           │             │                               │
│       └───────────┴─────────────┘                               │
│                        │                                         │
│                        ▼                                         │
│                    map.js (30×17 office)                         │
└─────────────────────────────────────────────────────────────────┘
```

### 模块

| 文件 | 职责 |
|------|------|
| `server/server.js` | HTTP + SSE 服务器，事件广播 |
| `viewer/js/viewer.js` | 前端主模块，事件路由 |
| `viewer/js/engine.js` | 30 FPS 游戏循环 |
| `viewer/js/renderer.js` | Canvas 渲染，地砖网格 |
| `viewer/js/character.js` | 像素角色 + 动画 |
| `viewer/js/bubble.js` | 气泡系统，3 秒淡出 |
| `viewer/js/map.js` | 办公室地图 |
| `viewer/js/particle.js` | 氛围尘埃粒子系统 |

## 🎮 事件类型

| 类型 | 颜色 | 触发时机 |
|------|------|---------|
| `request` | 红色边框 | 用户提交请求 |
| `thinking` | 黄色背景 | Agent 思考中 |
| `tool` | 蓝色背景 | 工具调用中 |
| `tool_done` | 绿色背景 | 工具完成 |
| `done` | 绿色边框 | 任务完成 |

## 📁 项目结构

```
pixel-agent-viewer/
├── server/
│   └── server.js              # SSE 服务器
├── viewer/
│   ├── index.html             # 主页面
│   ├── css/viewer.css         # 像素风格
│   └── js/                    # 前端模块
│       ├── viewer.js
│       ├── engine.js
│       ├── renderer.js
│       ├── character.js
│       ├── bubble.js
│       ├── particle.js
│       └── map.js
└── hooks/
    └── pixel_pilot.py         # Python 一行接入
```

## 🛠️ 技术栈

- **服务器**: Node.js 18+ / Bun 1.0+
- **前端**: Vanilla JS（零依赖），HTML5 Canvas
- **通信**: Server-Sent Events (SSE)
- **样式**: CSS3，像素风格

## 📄 License

MIT
