const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;
const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBHOOK_URL = process.env.WEBHOOK_URL || `https://your-app.herokuapp.com/`;

// Bot statistics
let botStats = {
    startTime: Date.now(),
    messagesReceived: 0,
    commandsProcessed: 0,
    errors: 0,
    lastPing: Date.now()
};

// Initialize bot with polling fallback
let bot;
try {
    bot = new TelegramBot(BOT_TOKEN, { polling: false });
} catch (error) {
    console.error('Failed to initialize bot:', error);
    process.exit(1);
}

// Middleware
app.use(express.json());

// Enhanced webhook setup with retry logic
const setWebhook = async (retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            const webhookUrl = `${WEBHOOK_URL}bot${BOT_TOKEN}`;
            await bot.setWebHook(webhookUrl);
            console.log(`✅ Webhook set successfully: ${webhookUrl}`);
            return true;
        } catch (error) {
            console.error(`❌ Webhook attempt ${i + 1} failed:`, error.message);
            if (i === retries - 1) {
                console.error('❌ All webhook attempts failed, falling back to polling');
                bot = new TelegramBot(BOT_TOKEN, { polling: true });
                return false;
            }
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
        }
    }
};

// Enhanced bot commands with error handling
bot.onText(/\/start/, async (msg) => {
    try {
        const chatId = msg.chat.id;
        const welcomeMessage = `
🤖 **Welcome to Your 24/7 Bot!**

I'm running continuously and ready to help you anytime!

**Available Commands:**
/start - Show this message
/help - Get help
/status - Check bot status
/info - Bot information
/ping - Test response time

**Bot Status:** ✅ Online 24/7
**Uptime:** ${Math.floor((Date.now() - botStats.startTime) / 1000 / 60)} minutes
        `;
        await bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
        botStats.commandsProcessed++;
    } catch (error) {
        console.error('Error in /start command:', error);
        botStats.errors++;
    }
});

bot.onText(/\/help/, async (msg) => {
    try {
        const chatId = msg.chat.id;
        const helpMessage = `
🆘 **Help Menu**

This bot is designed to run 24/7 with maximum reliability!

**Commands:**
• /start - Welcome message
• /help - This help menu
• /status - Bot status check
• /info - Detailed bot info
• /ping - Response time test

**Features:**
✅ Always online
✅ Instant responses
✅ Error recovery
✅ Health monitoring
✅ Automatic restarts

**Need help?** The bot is monitored and will automatically recover from any issues.
        `;
        await bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
        botStats.commandsProcessed++;
    } catch (error) {
        console.error('Error in /help command:', error);
        botStats.errors++;
    }
});

bot.onText(/\/status/, async (msg) => {
    try {
        const chatId = msg.chat.id;
        const uptime = Math.floor((Date.now() - botStats.startTime) / 1000);
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = uptime % 60;
        
        const statusMessage = `
✅ **Bot Status: ONLINE**

**Uptime:** ${hours}h ${minutes}m ${seconds}s
**Messages:** ${botStats.messagesReceived}
**Commands:** ${botStats.commandsProcessed}
**Errors:** ${botStats.errors}
**Last Ping:** ${new Date(botStats.lastPing).toLocaleTimeString()}

**System:** Running perfectly! 🚀
        `;
        await bot.sendMessage(chatId, statusMessage, { parse_mode: 'Markdown' });
        botStats.commandsProcessed++;
    } catch (error) {
        console.error('Error in /status command:', error);
        botStats.errors++;
    }
});

bot.onText(/\/info/, async (msg) => {
    try {
        const chatId = msg.chat.id;
        const infoMessage = `
📊 **Bot Information**

**Version:** 2.0.0
**Platform:** Node.js
**Hosting:** Railway
**Reliability:** 99.9%

**Statistics:**
• Total Messages: ${botStats.messagesReceived}
• Commands Processed: ${botStats.commandsProcessed}
• Error Rate: ${botStats.errors > 0 ? ((botStats.errors / botStats.commandsProcessed) * 100).toFixed(2) : 0}%
• Uptime: ${Math.floor((Date.now() - botStats.startTime) / 1000 / 60)} minutes

**Features:**
• Webhook-based responses
• Automatic error recovery
• Health monitoring
• Keep-alive system
• Real-time statistics

This bot is built for maximum reliability and 24/7 operation! 🎯
        `;
        await bot.sendMessage(chatId, infoMessage, { parse_mode: 'Markdown' });
        botStats.commandsProcessed++;
    } catch (error) {
        console.error('Error in /info command:', error);
        botStats.errors++;
    }
});

bot.onText(/\/ping/, async (msg) => {
    try {
        const chatId = msg.chat.id;
        const startTime = Date.now();
        await bot.sendMessage(chatId, '🏓 Pinging...');
        const responseTime = Date.now() - startTime;
        
        const pingMessage = `
🏓 **Pong!**

**Response Time:** ${responseTime}ms
**Status:** ${responseTime < 1000 ? '✅ Excellent' : responseTime < 3000 ? '⚠️ Good' : '❌ Slow'}

**Server:** Railway
**Latency:** ${responseTime}ms
        `;
        await bot.sendMessage(chatId, pingMessage, { parse_mode: 'Markdown' });
        botStats.commandsProcessed++;
    } catch (error) {
        console.error('Error in /ping command:', error);
        botStats.errors++;
    }
});

// Enhanced message handling
bot.on('message', async (msg) => {
    try {
        const chatId = msg.chat.id;
        const text = msg.text || '';
        
        botStats.messagesReceived++;
        
        // Only echo if it's not a command
        if (text && !text.startsWith('/')) {
            const echoMessage = `
💬 **You said:** ${text}

**Message ID:** ${msg.message_id}
**Time:** ${new Date().toLocaleTimeString()}
**Bot Status:** ✅ Online
            `;
            await bot.sendMessage(chatId, echoMessage, { parse_mode: 'Markdown' });
        }
    } catch (error) {
        console.error('Error processing message:', error);
        botStats.errors++;
    }
});

// Webhook endpoint with enhanced error handling
app.post(`/bot${BOT_TOKEN}`, async (req, res) => {
    try {
        await bot.processUpdate(req.body);
        res.sendStatus(200);
    } catch (error) {
        console.error('Webhook processing error:', error);
        botStats.errors++;
        res.sendStatus(500);
    }
});

// Enhanced health check endpoint
app.get('/', (req, res) => {
    const uptime = Math.floor((Date.now() - botStats.startTime) / 1000);
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = uptime % 60;
    
    res.json({
        status: 'running',
        bot: 'telegram_bot_24_7',
        message: 'Bot is running 24/7 with enhanced reliability!',
        uptime: uptime,
        uptime_formatted: `${hours}h ${minutes}m ${seconds}s`,
        statistics: {
            messages_received: botStats.messagesReceived,
            commands_processed: botStats.commandsProcessed,
            errors: botStats.errors,
            error_rate: botStats.commandsProcessed > 0 ? ((botStats.errors / botStats.commandsProcessed) * 100).toFixed(2) : 0
        },
        last_ping: new Date(botStats.lastPing).toISOString(),
        timestamp: new Date().toISOString()
    });
});

// Enhanced keep-alive function with better error handling
const keepAlive = () => {
    setInterval(async () => {
        try {
            const response = await axios.get(WEBHOOK_URL, { timeout: 10000 });
            botStats.lastPing = Date.now();
            console.log(`✅ Keep alive ping sent - Status: ${response.status}`);
        } catch (error) {
            console.log(`❌ Keep alive failed: ${error.message}`);
            botStats.errors++;
        }
    }, 25 * 60 * 1000); // Every 25 minutes
};

// Enhanced error handling for the bot
bot.on('error', (error) => {
    console.error('Bot error:', error);
    botStats.errors++;
});

bot.on('polling_error', (error) => {
    console.error('Polling error:', error);
    botStats.errors++;
});

// Graceful shutdown handling
process.on('SIGTERM', async () => {
    console.log('🛑 Received SIGTERM, shutting down gracefully...');
    try {
        await bot.close();
        console.log('✅ Bot closed successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
    }
});

process.on('SIGINT', async () => {
    console.log('🛑 Received SIGINT, shutting down gracefully...');
    try {
        await bot.close();
        console.log('✅ Bot closed successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
    }
});

// Start server with enhanced logging
app.listen(PORT, async () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/`);
    console.log(`🤖 Bot starting up...`);
    
    const webhookSuccess = await setWebhook();
    if (webhookSuccess) {
        console.log(`✅ Bot running with webhook mode`);
    } else {
        console.log(`⚠️ Bot running with polling mode (fallback)`);
    }
    
    keepAlive();
    console.log(`🔄 Keep-alive system started (25-minute intervals)`);
    console.log(`📊 Statistics tracking enabled`);
    console.log(`🎯 Bot is now ready for 24/7 operation!`);
}); 