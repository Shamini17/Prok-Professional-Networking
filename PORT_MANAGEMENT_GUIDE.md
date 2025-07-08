# Port Management Guide

## 🔍 How to Check Which Process is Using a Port

### Method 1: Using `lsof` (List Open Files)
```bash
# Check specific port
lsof -i :5000

# Check all ports
lsof -i -P -n | grep LISTEN

# Check ports for a specific user
lsof -i -u $USER
```

### Method 2: Using `netstat`
```bash
# Check all listening ports
netstat -tulpn | grep :5000

# Check all TCP ports
netstat -tlnp

# Check all UDP ports
netstat -ulnp
```

### Method 3: Using `ss` (Socket Statistics)
```bash
# Check specific port
ss -tulpn | grep :5000

# Check all listening ports
ss -tulpn

# Check TCP ports only
ss -tlnp
```

### Method 4: Using `fuser`
```bash
# Check which process is using port 5000
fuser 5000/tcp

# Check with verbose output
fuser -v 5000/tcp
```

## 🛠️ How to Kill Processes Using a Port

### Method 1: Kill by PID (Process ID)
```bash
# First, find the PID
lsof -i :5000

# Then kill the process
kill -9 <PID>

# Example:
kill -9 23809 23813
```

### Method 2: Kill directly using `fuser`
```bash
# Kill all processes using port 5000
fuser -k 5000/tcp

# Kill with force
fuser -KILL 5000/tcp
```

### Method 3: Kill using `lsof` with `xargs`
```bash
# Kill all processes using port 5000
lsof -ti:5000 | xargs kill -9
```

### Method 4: Kill Python processes specifically
```bash
# Kill all Python processes
pkill -f python

# Kill specific Python script
pkill -f "python main.py"

# Kill Flask processes
pkill -f flask
```

## 📋 Complete Port Management Workflow

### Step 1: Check What's Using the Port
```bash
# Check if port 5000 is in use
lsof -i :5000

# If something is using it, you'll see output like:
# COMMAND   PID         USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
# python  23809 baby-shamini    6u  IPv4 159329      0t0  TCP *:5000 (LISTEN)
```

### Step 2: Identify the Process
```bash
# Get more details about the process
ps aux | grep <PID>

# Example:
ps aux | grep 23809
```

### Step 3: Kill the Process
```bash
# Kill the specific process
kill -9 <PID>

# Or kill all processes using the port
lsof -ti:5000 | xargs kill -9
```

### Step 4: Verify Port is Free
```bash
# Check if port is now available
lsof -i :5000 || echo "Port 5000 is now free"
```

## 🚀 Quick Commands for Common Scenarios

### For Flask Applications
```bash
# Check if Flask is running on port 5000
lsof -i :5000

# Kill Flask processes
pkill -f "python main.py"
pkill -f flask

# Start Flask on a different port
flask run --port=5001
```

### For Node.js Applications
```bash
# Check if Node.js is using port 3000
lsof -i :3000

# Kill Node.js processes
pkill -f node

# Start on different port
npm start -- --port=3001
```

### For Any Application
```bash
# Check any port
lsof -i :<PORT_NUMBER>

# Kill processes on any port
lsof -ti:<PORT_NUMBER> | xargs kill -9
```

## 🔧 Alternative Solutions

### Use a Different Port
```bash
# Flask
flask run --port=5001

# Python
python main.py --port=5001

# Node.js
npm start -- --port=3001
```

### Use Environment Variables
```bash
# Set Flask port
export FLASK_RUN_PORT=5001
flask run

# Set Python port
export PORT=5001
python main.py
```

## 📊 Monitoring Port Usage

### Watch Port Usage in Real-time
```bash
# Watch port 5000
watch -n 1 'lsof -i :5000'

# Watch all listening ports
watch -n 1 'netstat -tulpn | grep LISTEN'
```

### Check Multiple Ports
```bash
# Check common development ports
for port in 3000 5000 8000 8080; do
    echo "Port $port:"
    lsof -i :$port || echo "  Free"
done
```

## 🚨 Troubleshooting

### Permission Denied
```bash
# Use sudo for system processes
sudo lsof -i :5000
sudo kill -9 <PID>
```

### Process Won't Die
```bash
# Force kill with signal 9
kill -9 <PID>

# Or use fuser with force
fuser -KILL 5000/tcp
```

### Port Still Shows as Used
```bash
# Wait a moment and check again
sleep 2
lsof -i :5000

# Check if process is in zombie state
ps aux | grep <PID>
```

## 📝 Useful Aliases

Add these to your `~/.bashrc` or `~/.zshrc`:

```bash
# Check port usage
alias checkport='lsof -i'

# Kill process on port
alias killport='lsof -ti'

# Quick port check
alias port5000='lsof -i :5000'
alias port3000='lsof -i :3000'
```

## 🎯 Example Workflow

Here's a complete example for managing port 5000:

```bash
# 1. Check what's using port 5000
lsof -i :5000

# 2. If something is using it, kill the processes
lsof -ti:5000 | xargs kill -9

# 3. Verify port is free
lsof -i :5000 || echo "Port 5000 is now free"

# 4. Start your application
cd app/backend
source venv/bin/activate
python main.py
```

---

**Remember**: Always be careful when killing processes, especially system processes. Make sure you're killing the correct process before using `kill -9`. 