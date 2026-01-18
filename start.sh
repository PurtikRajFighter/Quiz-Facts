#!/bin/bash

# Start the local server and open in browser
echo "Starting Current Affairs Quiz Application..."
echo "Server will run on http://localhost:8000"
echo "Press Ctrl+C to stop the server"
echo ""

cd "$(dirname "$0")"
python3 -m http.server 8000

