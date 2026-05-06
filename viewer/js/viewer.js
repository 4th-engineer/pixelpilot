// Pixel Agent Viewer - Main Module
import { Engine } from './engine.js';
import { Renderer } from './renderer.js';
import { CharacterManager } from './character.js';
import { Map } from './map.js';
import { BubbleManager } from './bubble.js';
import { ParticleManager } from './particle.js';

class Viewer {
  constructor() {
    this.engine = new Engine(this);
    this.renderer = null;
    this.characterManager = null;
    this.map = null;
    this.bubbleManager = null;
    this.particleManager = null;
    this.agents = new Map();
    this.eventCount = 0;
    this.startTime = Date.now();
    this.sseConnected = false;
    
    this.init();
  }
  
  async init() {
    // Initialize components
    this.map = new Map();
    this.bubbleManager = new BubbleManager();
    this.particleManager = new ParticleManager();
    this.particleManager.init(this.engine.width, this.engine.height);
    this.characterManager = new CharacterManager(this.map);
    this.renderer = new Renderer(this);
    
    // Setup UI
    this.setupUI();
    
    // Connect to server
    this.connectSSE();
    
    // Start render loop
    this.engine.start();
    
    // Fetch initial state
    this.fetchStatus();
    this.fetchHistory();
  }
  
  setupUI() {
    // Clear button
    document.getElementById('clear-btn').onclick = () => this.clearHistory();
    document.getElementById('chat-clear').onclick = () => this.clearChat();
    
    // Chat panel toggle (mobile + keyboard shortcut 'c')
    const chatToggle = document.getElementById('chat-toggle');
    const chatPanel = document.getElementById('chat-panel');
    const chatClose = document.getElementById('chat-close');
    if (chatToggle && chatPanel) {
      chatToggle.onclick = () => {
        chatPanel.classList.toggle('open');
      };
    }
    if (chatClose && chatPanel) {
      chatClose.onclick = () => {
        chatPanel.classList.remove('open');
      };
    }
    
    // Keyboard shortcut: 'c' toggles chat panel
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'c' || e.key === 'C') {
        chatPanel.classList.toggle('open');
      }
    });
    
    // Auto-scroll management: only scroll if user is near bottom
    const chatMessages = document.getElementById('chat-messages');
    this._chatAutoScroll = true;
    chatMessages.addEventListener('scroll', () => {
      const { scrollTop, scrollHeight, clientHeight } = chatMessages;
      this._chatAutoScroll = scrollHeight - scrollTop - clientHeight < 50;
    });
    
    // FPS and uptime display
    this.engine.onTick = () => {
      document.getElementById('fps').textContent = `FPS: ${this.engine.fps}`;
      const totalSeconds = Math.floor((Date.now() - this.startTime) / 1000);
      const h = Math.floor(totalSeconds / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = totalSeconds % 60;
      const pad = (n) => String(n).padStart(2, '0');
      document.getElementById('uptime').textContent = `Uptime: ${pad(h)}:${pad(m)}:${pad(s)}`;
    };

    // Periodically refresh server info (every 5 seconds)
    setInterval(() => this.fetchStatus(), 5000);
  }
  
  connectSSE() {
    // Guard against multiple simultaneous reconnection attempts
    if (this._sseReconnecting) {
      return;
    }
    
    const statusEl = document.getElementById('connection-status');
    statusEl.textContent = '⚫ Connecting...';
    
    // Close any previous EventSource to prevent connection leaks on reconnect
    if (this._events) {
      this._events.close();
    }
    
    const events = new EventSource('/events');
    this._events = events;
    
    events.onopen = () => {
      this.sseConnected = true;
      this._sseReconnecting = false;
      statusEl.textContent = '🟢 Connected';
      statusEl.className = 'connected';
    };
    
    events.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data);
        this.handleEvent(event);
      } catch (err) {
        console.error('Failed to parse SSE event:', err);
      }
    };
    
    events.onerror = () => {
      this.sseConnected = false;
      this._sseReconnecting = true;
      statusEl.textContent = '🔴 Disconnected';
      statusEl.className = 'disconnected';
      
      // Reconnect after 3s (guard prevents stacking multiple reconnect timers)
      setTimeout(() => {
        this._sseReconnecting = false;
        this.connectSSE();
      }, 3000);
    };
  }
  
  async fetchStatus() {
    try {
      const res = await fetch('/status');
      const data = await res.json();
      document.getElementById('server-info').textContent = 
        `Server: ${data.clients} clients, ${data.events} events`;
    } catch (e) {
      console.error('Failed to fetch status:', e);
    }
  }
  
  async fetchHistory() {
    try {
      const res = await fetch('/history');
      const events = await res.json();
      for (const event of events) {
        this.handleEvent(event, false);
      }
    } catch (e) {
      console.error('Failed to fetch history:', e);
    }
  }
  
  async clearHistory() {
    try {
      await fetch('/clear', { method: 'POST' });
      this.agents.clear();
      this.characterManager.clear();
      this.bubbleManager.clear();
      this.eventCount = 0;
      document.getElementById('chat-messages').innerHTML = '';
      this.updateStats();
    } catch (e) {
      console.error('Failed to clear:', e);
    }
  }
  
  clearChat() {
    document.getElementById('chat-messages').innerHTML = '';
  }
  
  handleEvent(event, animate = true) {
    this.eventCount++;
    
    // Update agent state
    const agentId = event.agent || 'default';
    const isNewAgent = !this.agents.has(agentId);
    if (isNewAgent) {
      this.agents.set(agentId, {
        id: agentId,
        type: event.agent_type || 'worker',
        status: 'idle',
        tool: null,
        message: '',
        file: null,
      });
      
      // Spawn character for new agent (any event type can introduce an agent)
      this.characterManager.spawnCharacter(agentId, event.agent_type || 'worker');
    }
    
    const agent = this.agents.get(agentId);
    agent.status = event.status || 'active';
    agent.tool = event.tool;
    agent.message = event.message;
    agent.file = event.file;
    
    // Handle different event types
    switch (event.type) {
      case 'ping':
        // Keep-alive, no action needed
        return;

      case 'request':
        this.addChatMessage('request', event.message, agentId, event.timestamp);
        this.characterManager.setAgentStatus(agentId, 'thinking');
        if (animate) this.bubbleManager.addBubble(agentId, event.message, 'thinking');
        break;

      case 'thinking':
        this.addChatMessage('thinking', event.message, agentId, event.timestamp);
        this.characterManager.setAgentStatus(agentId, 'thinking');
        if (animate) this.bubbleManager.addBubble(agentId, event.message, 'thinking');
        break;
        
      case 'tool':
        this.addChatMessage('tool', `${event.tool}: ${event.message}`, agentId, event.timestamp);
        this.characterManager.setAgentStatus(agentId, 'working');
        if (event.file && animate) {
          this.bubbleManager.addBubble(agentId, `${event.tool} ${event.file}`, 'tool');
        }
        break;
        
      case 'tool_done':
      case 'done':
        this.addChatMessage('done', event.message || 'Task completed', agentId, event.timestamp);
        this.characterManager.setAgentStatus(agentId, 'idle');
        if (animate) this.bubbleManager.addBubble(agentId, '✓', 'done');
        break;
        
      case 'agent':
        this.addChatMessage('agent', event.message, agentId, event.timestamp);
        this.characterManager.spawnCharacter(event.agent, event.agent_type || 'worker');
        break;
        
      case 'system':
        this.addChatMessage('system', event.message, 'system', event.timestamp);
        return;
    }
    
    this.updateStats();
  }
  
  addChatMessage(type, text, agent, eventTimestamp) {
    const container = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = `chat-message ${type}`;
    
    // Format event timestamp as relative "Xs ago" or absolute time
    let timeStr = '';
    if (eventTimestamp) {
      const elapsed = (Date.now() - eventTimestamp) / 1000;
      if (elapsed < 60) {
        timeStr = `${elapsed.toFixed(1)}s ago`;
      } else if (elapsed < 3600) {
        timeStr = `${Math.floor(elapsed / 60)}m ago`;
      } else {
        timeStr = new Date(eventTimestamp).toLocaleTimeString();
      }
    } else {
      timeStr = new Date().toLocaleTimeString();
    }
    
    div.innerHTML = `<div class="content">${this.escapeHtml(text)}</div>`;
    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = `${agent} • ${timeStr}`;
    div.appendChild(meta);
    
    container.appendChild(div);
    if (this._chatAutoScroll) {
      container.scrollTop = container.scrollHeight;
    }
    
    // Limit messages
    while (container.children.length > 100) {
      container.removeChild(container.firstChild);
    }
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  updateStats() {
    document.getElementById('agent-count').textContent = `Agents: ${this.agents.size}`;
    document.getElementById('event-count').textContent = `Events: ${this.eventCount}`;
  }

  render(ctx, width, height) {
    if (this.renderer) {
      this.renderer.render(ctx, width, height);
    }
  }
}

// Initialize viewer when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.viewer = new Viewer();
});
