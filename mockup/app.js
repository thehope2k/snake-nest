// ===== State =====
const participants = [
  { id: 1, name: "Minh", face: "🧔", doghouse: false, remaining: 0, count: 3 },
  { id: 2, name: "An",   face: "👩", doghouse: false, remaining: 0, count: 7 },
  { id: 3, name: "Huy",  face: "🧑‍🦱", doghouse: false, remaining: 0, count: 1 },
  { id: 4, name: "TheHope", face: "🧑‍💻", doghouse: false, remaining: 0, count: 0, isMe: true },
];

const seedMessages = [
  { author: "Minh", avatar: "🧔", time: "10:41 AM", text: "bro lost 3 games in a row and still talking 💀", reacts: ["💀 12", "🐍 4"] },
  { author: "An", avatar: "👩", time: "10:42 AM", text: "at least I show up, unlike SOME people (@Huy)", reacts: ["🔥 6"] },
  { author: "Huy", avatar: "🧑‍🦱", time: "10:43 AM", text: "i was AFK for a REASON 😤", reacts: ["😂 9", "L 3"] },
];

// ===== Nav switching =====
document.querySelectorAll('.channel').forEach(el => {
  el.addEventListener('click', () => {
    document.querySelectorAll('.channel').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    const target = el.dataset.target;
    document.getElementById('view-chat').classList.toggle('hidden', target !== 'chat');
    document.getElementById('view-meeting').classList.toggle('hidden', target !== 'meeting');
    if (target === 'meeting') renderParticipants();
  });
});

// ===== Chat rendering =====
function renderMessages() {
  const box = document.getElementById('messages');
  box.innerHTML = '';
  seedMessages.forEach(m => box.appendChild(messageEl(m)));
  box.scrollTop = box.scrollHeight;
}

function messageEl(m) {
  const div = document.createElement('div');
  div.className = 'msg';
  div.innerHTML = `
    <div class="avatar">${m.avatar}</div>
    <div class="msg-body">
      <div class="msg-head"><span class="msg-author">${m.author}</span><span class="msg-time">${m.time}</span></div>
      <div class="msg-text">${m.text}</div>
      <div class="msg-reacts">${m.reacts.map(r => `<span class="react">${r}</span>`).join('')}</div>
    </div>`;
  return div;
}

function sendMessage() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;
  seedMessages.push({ author: "TheHope", avatar: "🧑‍💻", time: "just now", text, reacts: ["🔥 0"] });
  input.value = '';
  renderMessages();
}
document.getElementById('chat-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') sendMessage();
});

// ===== Meeting / Doghouse mechanic =====
function renderParticipants() {
  const box = document.getElementById('participants');
  box.innerHTML = '';
  participants.forEach(p => {
    const tile = document.createElement('div');
    tile.className = 'tile' + (p.doghouse ? ' doghouse' : '');
    tile.innerHTML = `
      ${p.doghouse ? `<div class="ring">${p.remaining}s</div>` : ''}
      <div class="mic">${p.doghouse ? '🔇' : '🎙️'}</div>
      <div class="face">${p.face}</div>
      <div class="name">${p.name}${p.isMe ? ' (you)' : ''}</div>
      <div class="hint">${p.doghouse ? 'shh...' : `🐕 sent ${p.count}x — click to bench`}</div>
    `;
    if (!p.isMe) {
      tile.addEventListener('click', () => toggleDoghouse(p.id));
    }
    box.appendChild(tile);
  });
  renderMiniBoard();
}

function toggleDoghouse(id) {
  const p = participants.find(x => x.id === id);
  if (p.doghouse) return; // already benched, let timer run
  p.doghouse = true;
  p.remaining = 60;
  p.count += 1;
  showToast(`🐍 Everyone: shh... we're talking about ${p.name} 🤫`);
  wobbleOthers(id);
  renderParticipants();

  const timer = setInterval(() => {
    p.remaining -= 1;
    if (p.remaining <= 0) {
      clearInterval(timer);
      p.doghouse = false;
      showToast(`🐕 ${p.name} has been let back in. Act natural.`);
    }
    renderParticipants();
  }, 1000);
}

function wobbleOthers(excludeId) {
  setTimeout(() => {
    document.querySelectorAll('.tile').forEach((el, i) => {
      const p = participants[i];
      if (p && p.id !== excludeId) {
        el.classList.add('whispering');
        setTimeout(() => el.classList.remove('whispering'), 400);
      }
    });
  }, 50);
}

// ===== Leaderboard =====
function renderMiniBoard() {
  const box = document.getElementById('mini-board');
  const sorted = [...participants].sort((a, b) => b.count - a.count).slice(0, 3);
  box.innerHTML = sorted.map((p, i) =>
    `<div class="mini-row"><span>${['🥇','🥈','🥉'][i] || ''} ${p.name}</span><b>${p.count}x</b></div>`
  ).join('');
}

// ===== Soundboard =====
function playSound(emoji) {
  showToast(`${emoji} *plays for the whole room*`);
  // tiny synthesized blip so it feels alive without needing audio assets
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = emoji === '📯' ? 320 : emoji === '🎺' ? 120 : 440;
    gain.gain.value = 0.05;
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    setTimeout(() => { osc.stop(); ctx.close(); }, 220);
  } catch (e) { /* ignore if audio blocked */ }
}

// ===== Toasts =====
function showToast(text) {
  const c = document.getElementById('toast-container');
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = text;
  c.appendChild(t);
  setTimeout(() => t.remove(), 3200);
}

// ===== Init =====
renderMessages();
renderMiniBoard();
