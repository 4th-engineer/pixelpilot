# 🦫 PixelPilot - 一行接入

> **一行代码自动追踪所有工具调用**

---

## 🚀 快速接入

### Python（推荐）

```python
# 方式 1：环境变量（最简单）
export PIXEL_VIEWER_URL=http://localhost:7777
python your_agent.py  # 自动连接

# 方式 2：代码中调用
import pixel_pilot
pixel_pilot.connect()  # 默认 http://localhost:7777
pixel_pilot.connect("http://your-server:7777")  # 自定义

# 现在所有 ToolRouter.route() 自动追踪
# 无需修改任何现有代码
```

### Shell / curl

```bash
# 设置环境变量
export PIXEL_VIEWER_URL=http://localhost:7777

# 发送单个事件
curl -X POST http://localhost:7777/event \
  -H "Content-Type: application/json" \
  -d '{"type":"tool","agent":"beaver","tool":"Read","message":"Reading config.py","file":"config.py"}'

# 批量发送
curl -X POST http://localhost:7777/events \
  -H "Content-Type: application/json" \
  -d '[
    {"type":"request","agent":"user","message":"Review my code"},
    {"type":"tool","agent":"beaver","tool":"Read","file":"main.py"}
  ]'
```

### Claude Code

```bash
# 设置环境变量
export PIXEL_VIEWER_URL=http://localhost:7777

# Claude Code hooks 会自动调用 backstage-bridge.sh
```

---

## API

### pixel.send()

```python
pixel.send("thinking", message="分析需求...")
pixel.send("tool", tool="Read", file="main.py")
pixel.send("done", message="任务完成")
```

### pixel.connect()

```python
pixel.connect()                          # 默认 http://localhost:7777
pixel.connect("http://your-server:7777")  # 自定义地址
pixel.connect(verbose=False)              # 静默模式
```

### pixel.disconnect()

```python
pixel.disconnect()  # 停止追踪
```

---

## 工作原理

`pixel.connect()` 会动态注入 `ToolRouter.route()` 方法，自动拦截所有工具调用并发送到 PixelPilot 服务器。完全**零侵入**，不影响原有逻辑。
