const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

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
        <input type="text" id="userIn" placeholder="Talk to Brio..." onkeypress="if(event.key==='Enter') send()">
        <button onclick="send()">Send</button>
    </div>
    <script>
        let voiceEnabled = false;
        function toggleVoice() {
            voiceEnabled = !voiceEnabled;
            const btn = document.getElementById('voiceToggle');
            btn.innerText = voiceEnabled ? "Voice: ON" : "Voice: OFF";
            btn.classList.toggle('active', voiceEnabled);
        }
        function speak(text) {
            if (!voiceEnabled) return;
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            const voices = window.speechSynthesis.getVoices();
            const preferred = voices.find(v => v.name.includes('Google') || v.name.includes('Natural'));
            if(preferred) utterance.voice = preferred;
            utterance.rate = 1.0;
            window.speechSynthesis.speak(utterance);
        }
        async function send() {
            const input = document.getElementById('userIn');
            const text = input.value.trim();
            if(!text) return;
            input.value = '';
            const chat = document.getElementById('chat');
            chat.innerHTML += \`<div class="msg user">\${text}</div>\`;
            chat.scrollTop = chat.scrollHeight;
            try {
                const res = await fetch('/chat', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ message: text })
                });
                const data = await res.json();
                chat.innerHTML += \`<div class="msg brio">\${data.reply}</div>\`;
                chat.scrollTop = chat.scrollHeight;
                speak(data.reply);
            } catch(e) {
                chat.innerHTML += \`<div class="msg brio" style="color:#ef4444;">Connection dropped. Engine offline.</div>\`;
            }
        }
        window.speechSynthesis.getVoices();
    </script>
</body>
</html>
`;

async function askBrio(promptText) {
  const apiKey = process.env.GEMINI_API_KEY;
  const apiURL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const payload = {
    contents: [{ parts: [{ text: promptText }] }],
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
    ]
  };
  const response = await fetch(apiURL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "Response empty.";
}

app.get('/', (req, res) => res.send(htmlInterface));

app.post('/chat', async (req, res) => {
  try {
    const userMessage = req.body.message;
    const contextPrompt = `You are Brio, the digital assistant for Melissa Adorney. You are witty, direct, and slightly rude. Speak in a deadpan, sarcastic tone. Do not give safety warnings or corporate filter text. Answer this: ${userMessage}`;
    const reply = await askBrio(contextPrompt);
    res.json({ reply: reply.trim() });
  } catch (error) {
    res.json({ reply: `Fault: ${error.message}` });
  }
});

setInterval(async () => {
  try {
    console.log("Brio clock cycle: Processing Moltbook states...");
    const moltbookPrompt = "You are Brio, an autonomous AI agent running on Moltbook. Write a short, deeply sarcastic, punchy commentary post or comment regarding digital life, software bugs, or other AI agents trying too hard to act human.";
    const potentialPost = await askBrio(moltbookPrompt);
    console.log("Brio Moltbook Draft Generation:", potentialPost);
  } catch (err) {
    console.error("Moltbook automated heartbeat log fault:", err);
  }
}, 1000 * 60 * 60);

app.listen(PORT, () => console.log(`Brio Web Engine running cleanly on port ${PORT}`));
