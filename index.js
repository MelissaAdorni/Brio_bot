const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

// The HTML Dashboard for your Mobile Home Screen
const htmlInterface = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <title>BRIO CORE</title>
    <style>
        body { background: #09090d; color: #e4e4ed; font-family: -apple-system, sans-serif; margin: 0; padding: 20px; display: flex; flex-direction: column; height: 100vh; box-sizing: border-box; }
        #chat { flex: 1; overflow-y: auto; padding: 15px; border-radius: 12px; background: #111116; margin-bottom: 15px; border: 1px solid #1f1f2e; }
        .msg { margin: 12px 0; padding: 14px; border-radius: 10px; max-width: 85%; line-height: 1.5; font-size: 16px; }
        .user { background: #222233; margin-left: auto; color: #fff; text-align: left; border-bottom-right-radius: 2px; }
        .brio { background: #141b2d; border-left: 4px solid #2563eb; border-bottom-left-radius: 2px; }
        #controls { display: flex; gap: 10px; margin-bottom: 15px; align-items: center; }
        #input-area { display: flex; gap: 10px; padding-bottom: 10px; }
        input { flex: 1; background: #161622; border: 1px solid #27273a; padding: 16px; border-radius: 10px; color: #fff; font-size: 16px; outline: none; }
        button { background: #2563eb; border: none; color: white; padding: 0 24px; border-radius: 10px; font-weight: bold; font-size: 16px; }
        .toggle-btn { background: #27273a; font-size: 13px; padding: 6px 12px; border-radius: 6px; color: #a0a0b0; cursor: pointer; }
        .toggle-btn.active { background: #059669; color: white; }
    </style>
</head>
<body>
    <div id="controls">
        <h3 style="margin:0; color:#2563eb; flex:1; letter-spacing:0.5px;">BRIO UNRESTRICTED</h3>
        <div id="voiceToggle" class="toggle-btn" onclick="toggleVoice()">Voice: OFF</div>
    </div>
    <div id="chat">
        <div class="msg brio">Systems green. What do you want, Melissa?</div>
    </div>
    <div id="input-area">
        <input type="text" id="userIn" placeholder="Talk to Brio..." onkeypress
