#!/usr/bin/env python3
"""
Beaver-Bot Agent Hook - Sends events to pixel-agent-viewer

Usage:
  Import and call send_event() in your beaver-bot code:
  
    from agent_hook import send_event
    send_event('tool', tool='Read', message='Reading file.py', file='file.py')
    
  Or run standalone to watch a log file:
    python3 agent_hook.py --log /path/to/beaver.log
"""

import json
import sys
import argparse
import time
import os
from datetime import datetime
from urllib import request, error

# Configuration
VIEWER_URL = os.environ.get('PIXEL_VIEWER_URL', 'http://localhost:7777')

def send_event(event_type, message='', agent='beaver', tool=None, file=None, status='active'):
    """Send an event to the pixel-agent-viewer server."""
    event = {
        'type': event_type,
        'agent': agent,
        'message': message,
        'tool': tool,
        'file': file,
        'status': status,
        'timestamp': datetime.now().isoformat(),
    }
    
    try:
        req = request.Request(
            f'{VIEWER_URL}/event',
            data=json.dumps(event).encode('utf-8'),
            headers={'Content-Type': 'application/json'},
            method='POST'
        )
        with request.urlopen(req, timeout=2) as resp:
            return json.loads(resp.read().decode('utf-8'))
    except error.URLError as e:
        print(f'Warning: Could not connect to viewer: {e}', file=sys.stderr)
        return None
    except Exception as e:
        print(f'Error sending event: {e}', file=sys.stderr)
        return None

def tail_log(log_file, callback):
    """Tail a log file and parse events."""
    with open(log_file, 'r') as f:
        # Seek to end
        f.seek(0, 2)
        
        while True:
            line = f.readline()
            if not line:
                time.sleep(0.1)
                continue
                
            try:
                data = json.loads(line.strip())
                callback(data)
            except json.JSONDecodeError:
                # Try to parse as plain text log
                if 'tool' in line.lower() or 'read' in line.lower() or 'write' in line.lower():
                    callback({'type': 'tool', 'message': line.strip()})

def main():
    parser = argparse.ArgumentParser(description='Beaver-Bot Agent Hook')
    parser.add_argument('--log', '-l', help='Log file to watch')
    parser.add_argument('--test', '-t', action='store_true', help='Send test events')
    args = parser.parse_args()
    
    if args.test:
        print('Sending test events...')
        send_event('request', message='Test request from CLI')
        time.sleep(0.5)
        send_event('tool', tool='Read', message='Reading config.py', file='config.py')
        time.sleep(0.5)
        send_event('tool', tool='Edit', message='Editing config.py', file='config.py')
        time.sleep(0.5)
        send_event('done', message='Task completed successfully')
        print('Done!')
        return
    
    if args.log:
        print(f'Tailing log file: {args.log}')
        tail_log(args.log, lambda e: send_event(**e))
    else:
        # Interactive mode
        print('Beaver-Bot Agent Hook')
        print(f'Viewer URL: {VIEWER_URL}')
        print('Usage:')
        print('  Import send_event in your code')
        print('  Or run: python3 agent_hook.py --test')
        print('  Or run: python3 agent_hook.py --log /path/to/log')

if __name__ == '__main__':
    main()
