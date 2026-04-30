# 🦫 Pixel Agent Viewer

通用 AI 编程 Agent 可视化工具 - 在像素办公室里实时观看 Agent 工作。

![Pixel Office](docs/preview.png)

## 功能特性

- 🎨 **像素艺术办公室** - Gather Town 风格工作环境
- 🤖 **通用 Agent 支持** - 兼容 beaver-bot、Claude Code、Codex 等
- 📡 **实时事件流** - 通过 SSE 实时推送 Agent 活动
- 💬 **活动气泡** - 显示工具调用、思考过程、完成状态
- 💭 **角色系统** - 每个 Agent 有专属像素角色
- 🏢 **多区域场景** - 工作区、会议室、休息区

## 快速开始

### 1. 启动服务器

```bash
# 使用 Node.js
node server/server.js

# 或使用 Bun (更快)
bun run server/server.js
```

### 2. 打开浏览器

访问 http://localhost:7777

### 3. 发送事件

**REST API:**
```bash
# 发送单个事件
curl -X POST http://localhost:7777/event \
  -H "Content-Type: application/json" \
  -d '{
    "type": "tool",
    "agent": "beaver",
    "tool": "Read",
    "message": "Reading config.py",
    "file": "config.py"
  }'

# 发送多个事件
curl -X POST http://localhost:7777/events \
  -H "Content-Type: application/json" \
  -d '[
    {"type": "request", "agent": "user", "message": "Review my code"},
    {"type": "tool", "agent": "beaver", "tool": "Read", "file": "main.py"}
  ]'
```

## 集成 beaver-bot

在 `beaver-bot` 中添加 Hook：

```python
from hooks.beaver.agent_hook import send_event

# 在工具调用时
send_event('tool', tool='Read', message='Reading file', file='file.py')

# 在任务完成时
send_event('done', message='Task completed')
```

## 集成 Claude Code (backstage 桥接)

```bash
# 设置环境变量
export PIXEL_VIEWER_URL=http://localhost:7777

# 在 Claude Code hooks 中调用
bash hooks/claude/backstage-bridge.sh
```

## 事件类型

| 事件类型 | 说明 | 参数 |
|---------|------|------|
| `request` | 用户请求 | `message` |
| `thinking` | Agent 思考 | `message` |
| `tool` | 工具调用 | `tool`, `file`, `message` |
| `tool_done` | 工具完成 | `tool`, `message` |
| `done` | 任务完成 | `message` |
| `agent` | 子 Agent 生成 | `agent`, `agent_type` |
| `system` | 系统消息 | `message` |

## API 端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/events` | GET | SSE 事件流 |
| `/event` | POST | 发送单个事件 |
| `/events` | POST | 批量发送事件 |
| `/history` | GET | 获取最近 100 条历史 |
| `/clear` | POST | 清空历史 |
| `/status` | GET | 服务器状态 |

## 项目结构

```
pixel-agent-viewer/
├── server/
│   └── server.js          # SSE 服务器 (Node/Bun)
├── viewer/
│   ├── index.html         # 主页面
│   ├── css/viewer.css     # 样式
│   └── js/
│       ├── viewer.js      # 主模块
│       ├── engine.js      # 游戏引擎
│       ├── renderer.js    # 渲染器
│       ├── character.js   # 角色类
│       ├── map.js         # 地图/办公室
│       └── bubble.js      # 气泡系统
├── hooks/
│   ├── beaver/
│   │   └── agent_hook.py  # beaver-bot 集成
│   └── claude/
│       └── backstage-bridge.sh  # Claude Code 桥接
├── adapters/
│   └── agent-events.js    # 事件协议适配
└── package.json
```

## 技术栈

- **服务器**: Node.js + Express / Bun
- **渲染**: HTML5 Canvas
- **通信**: Server-Sent Events (SSE)
- **样式**: CSS3 + 像素风格

## License

MIT
