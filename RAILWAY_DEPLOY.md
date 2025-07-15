# 🚀 Railway Deployment Guide

## Quick Setup for 24/7 Telegram Bot

### 1. Get Your Bot Token
1. Message [@BotFather](https://t.me/botfather) on Telegram
2. Send `/newbot`
3. Follow instructions to create your bot
4. Copy the token (looks like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### 2. Deploy to Railway

#### Option A: Deploy from GitHub
1. **Push this code to GitHub**
2. **Go to [railway.app](https://railway.app)**
3. **Click "New Project"**
4. **Select "Deploy from GitHub repo"**
5. **Choose your repository**
6. **Railway will automatically detect Node.js**

#### Option B: Deploy from CLI
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Deploy
railway up
```

### 3. Set Environment Variables
In Railway dashboard, go to your project → Variables tab:

```env
BOT_TOKEN=your_telegram_bot_token_here
WEBHOOK_URL=https://your-app-name.railway.app/
PORT=3000
```

### 4. Get Your Railway URL
1. Go to your Railway project
2. Click on your service
3. Copy the domain (looks like: `https://your-app-name.railway.app`)
4. Update the `WEBHOOK_URL` variable with this URL

### 5. Test Your Bot
1. Find your bot on Telegram
2. Send `/start`
3. You should get the welcome message
4. Try `/status` to check if it's running

## ✅ Features
- ✅ **24/7 Operation** - No sleep timer
- ✅ **Automatic Restarts** - If bot crashes
- ✅ **Health Monitoring** - Railway checks if bot is alive
- ✅ **Webhook Support** - Instant responses
- ✅ **Error Recovery** - Automatic fallback to polling
- ✅ **Statistics Tracking** - Monitor performance
- ✅ **Keep-Alive System** - Prevents sleeping

## 📊 Monitoring
- **Health Check**: Visit your Railway URL to see bot status
- **Logs**: Railway dashboard → Logs tab
- **Metrics**: Railway dashboard → Metrics tab

## 🔧 Commands
- `/start` - Welcome message
- `/help` - Help menu
- `/status` - Bot status with statistics
- `/info` - Detailed bot information
- `/ping` - Test response time

Your bot will now run 24/7 on Railway! 🎉 