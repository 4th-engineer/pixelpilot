// Pixel Agent Viewer - Main Module
import { Engine } from './engine.js';
import { Renderer } from './renderer.js';
import { CharacterManager } from './character.js';
import { Map } from './map.js';
import { BubbleManager } from './bubble.js';

class Viewer {
  constructor() {
    this.engine = new Engine(this);
    this.renderer = null;
    this.characterManager = null;
    this.map = null;
    this.bubbleManager = null;
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
    
    // FPS and uptime display
    this.engine.onTick = () => {
      document.getElementById('fps').textContent = `FPS: ${this.engine.fps}`;
      const uptime = Math.floor((Date.now() - this.startTime) / 1000);
      document.getElementById('uptime').textContent = `Uptime: ${uptime}s`;
    };
  }
  
  connectSSE() {
    const statusEl = document.getElementById('connection-status');
    statusEl.textContent = '⚫ Connecting...';
    
    const events = new EventSource('/events');
    
    events.onopen = () => {
      this.sseConnected = true;
      statusEl.textContent = '🟢 Connected';
      statusEl.className = 'connected';
    };
    
    events.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data);
        this.handleEvent(event);
      } catch (err) {
        console.error('Failed to parse event:', err);
      }
    };
    
    events.onerror = () => {
      this.sseConnected = false;
      statusEl.textContent = '🔴 Disconnected';
      statusEl.className = 'disconnected';
      
      // Reconnect after 3s
      setTimeout(() => this.connectSSE(), 3000);
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
    if (!this.agents.has(agentId)) {
      this.agents.set(agentId, {
        id: agentId,
        type: event.agent_type || 'worker',
        status: 'idle',
        tool: null,
        message: '',
        file: null,
      });
      
      // Spawn character for new agent
      this.characterManager.spawnCharacter(agentId, event.agent_type || 'worker');
    }
    
    const agent = this.agents.get(agentId);
    agent.status = event.status || 'active';
    agent.tool = event.tool;
    agent.message = event.message;
    agent.file = event.file;
    
    // Handle different event types
    switch (event.type) {
      case 'request':
        this.addChatMessage('request', event.message, agentId);
        this.characterManager.setAgentStatus(agentId, 'thinking');
        if (animate) this.bubbleManager.addBubble(agentId, event.message, 'thinking');
        break;
        
      case 'thinking':
        this.addChatMessage('thinking', event.message, agentId);
        this.characterManager.setAgentStatus(agentId, 'thinking');
        if (animate) this.bubbleManager.addBubble(agentId, event.message, 'thinking');
        break;
        
      case 'tool':
        this.addChatMessage('tool', `${event.tool}: ${event.message}`, agentId);
        this.characterManager.setAgentStatus(agentId, 'working');
        if (event.file && animate) {
          this.bubbleManager.addBubble(agentId, `${event.tool} ${event.file}`, 'tool');
        }
        break;
        
      case 'tool_done':
      case 'done':
        this.addChatMessage('done', event.message || 'Task completed', agentId);
        this.characterManager.setAgentStatus(agentId, 'idle');
        if (animate) this.bubbleManager.addBubble(agentId, '✓', 'done');
        break;
        
      case 'agent':
        this.addChatMessage('agent', event.message, agentId);
        this.characterManager.spawnCharacter(event.agent, event.agent_type || 'worker');
        break;
        
      case 'system':
        this.addChatMessage('system', event.message, 'system');
        break;
    }
    
    this.updateStats();
  }
  
  addChatMessage(type, text, agent) {
    const container = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = `chat-message ${type}`;
    div.innerHTML = `
      <div class="content">${this.escapeHtml(text)}</div>
      <div class="meta">${agent} • ${new Date().toLocaleTimeString()}</div>
    `;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    
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
  
  // Render frame
  render(ctx, width, height) {
    // Clear using logical CSS pixel dimensions (not physical pixels)
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);
    
    // Draw map (floor, walls, furniture)
    this.map.render(ctx);
    
    // Draw characters
    this.characterManager.render(ctx);
    
    // Draw bubbles
    this.bubbleManager.render(ctx);
  }
}

// Initialize viewer when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.viewer = new Viewer();
});
