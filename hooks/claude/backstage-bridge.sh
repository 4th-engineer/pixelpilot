#!/bin/bash
# Claude Code Hook Bridge - Sends Claude Code events to pixel-agent-viewer
# Works with backstage-compatible hooks

VIEWER_URL="${PIXEL_VIEWER_URL:-http://localhost:7777}"

send_event() {
  local type="$1"
  local message="$2"
  local tool="$3"
  local file="$4"
  local agent="$5"
  
  local event=$(cat <<EOF
{
  "type": "$type",
  "agent": "${agent:-claude}",
  "message": "$message",
  "tool": "$tool",
  "file": "$file",
  "status": "active",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
)
  
  curl -s -X POST "$VIEWER_URL/event" \
    -H "Content-Type: application/json" \
    -d "$event" \
    > /dev/null 2>&1
}

# PreToolUse hook
pre_tool_hook() {
  local tool_name="$BARD_TOOL_NAME"
  local tool_input="$BARD_TOOL_INPUT"
  
  # Extract file from tool input if possible
  local file=""
  if [[ "$tool_input" == *"file_path"* ]]; then
    file=$(echo "$tool_input" | grep -o '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | cut -d'"' -f4)
  elif [[ "$tool_input" == *"path"* ]]; then
    file=$(echo "$tool_input" | grep -o '"path"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | cut -d'"' -f4)
  fi
  
  send_event "tool" "$tool_name" "$tool_name" "$file"
}

# PostToolUse hook
post_tool_hook() {
  local tool_name="$BARD_TOOL_NAME"
  local tool_result="$BARD_TOOL_RESULT"
  
  if [[ "$tool_result" == *"error"* ]] || [[ "$tool_result" == *"failed"* ]]; then
    send_event "error" "$tool_name failed" "$tool_name" ""
  else
    send_event "tool_done" "$tool_name completed" "$tool_name" ""
  fi
}

# UserPromptSubmit hook
user_prompt_hook() {
  local prompt="$CLAUDE_USER_PROMPT"
  send_event "request" "$prompt" "" "" "user"
}

# AgentSpawned hook (if available)
agent_spawned_hook() {
  local agent_type="$1"
  send_event "agent" "Agent spawned: $agent_type" "" "" "$agent_type"
}

# Main
case "$CLAUDE_HOOK_KIND" in
  "pre_tool")
    pre_tool_hook
    ;;
  "post_tool")
    post_tool_hook
    ;;
  "user_prompt")
    user_prompt_hook
    ;;
  "agent_spawned")
    agent_spawned_hook "$@"
    ;;
  *)
    # Default: echo hook payload for debugging
    echo "Unknown hook kind: $CLAUDE_HOOK_KIND"
    ;;
esac
