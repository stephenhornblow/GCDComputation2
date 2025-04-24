const asciiFaces = ['^_^', '(o_o)', '(-_-)', '(*_*)', ':)', ':3', '>_<', 'T_T', 'UwU', 'O_O','OwO', '(◕‿◕✿)', 't(-_-t)','♪~ ᕕ(ᐛ)ᕗ','ฅ^•ﻌ•^ฅ','ᶘ ◕ᴥ◕ᶅ','(• ε •)','( 　ﾟ,_ゝﾟ)','(ᗒᗣᗕ)՞' ];
let selectedFace = asciiFaces[0];
let avatars = JSON.parse(localStorage.getItem('asciiAvatars')) || [];
let graveyard = JSON.parse(localStorage.getItem('asciiGraveyard')) || [];
const randomDeathMessages = [
  "Overdosed in an alleyway.",
  "Got flung off the map.",
  "Tried to out-stare the sun.",
  "Ascended unexpectedly.",
  "Pressed the wrong button.",
  "Got jugged by their dealer.",
  "Was killed by [Intentional Game Design].",
  "Forgot to breathe.",
  "Pressed Alt + F4.",
  "Ghosted by fine shyt.",
  "Died. We don't know how.",
  "Forgot to place their bed.",
  "Found out not everything is sunshine and rainbows.",
  "Something happened that lead to their death.",
  "Whoops.",
  "They sorta did that.",
  "Got transported to another universe.",
  "Tried to hug a cactus.",
  "Slipped on a banana peel."
];

const lifeQuotes = [
  "'Everything goes, everything comes back; the wheel of existence rolls eternally. All things die, all things blossom again.'- Friedrich Nietzsche",
  "'I'm Rick James, Bitch!'- Rick James",
  "'The most painful state of being is remembering the future, particularly the one you’ll never have.'- Søren Kierkegaard",
  "'You could leave life right now. Let that determine what you do and say and think.'- Marcus Aurelius",
  "'To feel the love of people whom we love is a fire that feeds our life.'- Pablo Neruda",
  "'The truth is, we’re all a little different, and we all have our own set of struggles, but we’re all connected, too, in the end.'- Mitch Alborn",
  "Live as if you were to die tomorrow. Learn as if you were to live forever.",
  "'The universe is made of stories, not atoms.'- Vera Nazarian",
  "'I wonder how many people I've looked at all my life and never seen.'- Haruki Murakami"
];

const clickSound = new Audio('ClickSound.mp3');

function playClickSound() {
  clickSound.currentTime = 0; // rewind to start
  clickSound.play();
}

document.querySelectorAll('button').forEach(btn => {
  btn.addEventListener('click', playClickSound);
});

let lastLifeQuoteIndex = -1;
const deathTickerQueue = [];
let showLifeQuoteNext = true;

function getUniqueLifeQuote() {
  let index;
  do {
    index = Math.floor(Math.random() * lifeQuotes.length);
  } while (index === lastLifeQuoteIndex && lifeQuotes.length > 1);
  lastLifeQuoteIndex = index;
  return lifeQuotes[index];
}




function openCustomiseMenu() {
  const optionsDiv = document.getElementById('asciiOptions');
  optionsDiv.innerHTML = '';
  asciiFaces.forEach(face => {
    const span = document.createElement('span');
    span.className = 'ascii-option';
    span.textContent = face;
    span.onclick = () => {
      selectedFace = face;
      document.querySelectorAll('.ascii-option').forEach(el => el.style.background = '#f9f9f9');
      span.style.background = '#8b8b8b';
    };
    optionsDiv.appendChild(span);
  });
  document.getElementById('avatarName').value = '';
  document.getElementById('overlay').style.display = 'block';
  document.getElementById('customiseMenu').style.display = 'block';
}

function getAge(dateString) {
  const now = new Date();
  const birth = new Date(dateString);
  const diffMinutes = Math.floor((now - birth) / (1000 * 60));
  if (diffMinutes > 60) return null;
  if (diffMinutes <= 5) return `${diffMinutes} minutes old (Newborn)`;
  if (diffMinutes <= 15) return `${diffMinutes} minutes old (Child)`;
  if (diffMinutes <= 30) return `${diffMinutes} minutes old (Teen)`;
  return `${diffMinutes} minutes old (Adult)`;
}

function createNewAvatar() {
  const name = document.getElementById('avatarName').value.trim() || `NAMELESS-${avatars.length + 1}`;
  const newAvatar = {
    id: Date.now(),
    name,
    face: selectedFace,
    birthDate: new Date().toISOString()
  };
  avatars.push(newAvatar);
  localStorage.setItem('asciiAvatars', JSON.stringify(avatars));

  createdThisSession++;
  sessionStorage.setItem('sessionCreated', createdThisSession);

  closeMenu();
  renderAvatars();
}

function renderAvatars() {
  const grid = document.getElementById('ascii-grid');
  const now = new Date();

  const stillAlive = [];
  const toRemove = [];

  avatars.forEach(avatar => {
    const ageMins = Math.floor((now - new Date(avatar.birthDate)) / (1000 * 60));
    const ageStatus = ageMins <= 5 ? "Newborn"
                     : ageMins <= 15 ? "Child"
                     : ageMins <= 30 ? "Teen"
                     : "Adult";

    const timeExpired = ageMins > 60;
    const unlucky = shouldDieRandomly(ageStatus);

    if (timeExpired || unlucky) {
      const el = document.querySelector(`[data-avatar-id="${avatar.id}"]`);
      if (el && !el.classList.contains('dying')) {
        el.classList.add('dying');
        setTimeout(() => el.remove(), 800); // matches animation
      }
      toRemove.push(avatar.id);
    } else {
      stillAlive.push(avatar);
    }
  });

  avatars = stillAlive;
  localStorage.setItem('asciiAvatars', JSON.stringify(avatars));

  // Clear & render fresh ones
  grid.innerHTML = '';
  avatars.forEach(avatar => {
    const div = document.createElement('div');
    div.className = 'avatar';
    div.setAttribute('data-avatar-id', avatar.id);
    const age = getAge(avatar.birthDate);
    div.innerHTML = `
      <div class="avatar-age">${age || ''}</div>
      <pre>${avatar.face}</pre>
      <div class="avatar-name">${avatar.name}</div>
    `;
    div.onclick = () => handleAvatarClick(avatar);
    grid.appendChild(div);
  });
}

function showMenu(avatar) {
  const age = getAge(avatar.birthDate);
  if (!age) return; 
  document.getElementById('menuName').innerText = avatar.name;
  document.getElementById('menuFace').innerText = avatar.face;
  document.getElementById('menuAge').innerText = age;
  document.getElementById('overlay').style.display = 'block';
  document.getElementById('avatarMenu').style.display = 'block';
}

function closeMenu() {
  document.getElementById('overlay').style.display = 'none';
  document.getElementById('avatarMenu').style.display = 'none';
  document.getElementById('customiseMenu').style.display = 'none';
  document.getElementById('statsMenu').style.display = 'none';
  document.getElementById('graveyardMenu').style.display = 'none';
}

setInterval(() => {
  tickDeathCycle();
  renderAvatars();
}, 1000);

renderAvatars();

function updateTime() {
  const now = new Date();

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const day = dayNames[now.getDay()];
  const date = now.getDate();
  const month = now.getMonth() + 1; // Months are zero-based

  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');

  const formattedTime = `${day} ${date}/${month} ${hours}:${minutes}:${seconds}`;

  document.getElementById('current-time').innerText = formattedTime;
}

function handleAvatarClick(avatar) {
  totalClicks++;
  localStorage.setItem('totalAvatarClicks', totalClicks);
  showMenu(avatar);
}

let totalClicks = Number(localStorage.getItem('totalAvatarClicks')) || 0;
let totalTimeAlive = Number(localStorage.getItem('totalTimeAlive')) || 0;
let createdThisSession = Number(sessionStorage.getItem('sessionCreated')) || 0;

function getStats() {
  const allTime = JSON.parse(localStorage.getItem('asciiAvatars')) || [];
  const faceCount = {};
  let totalMinutes = 0;

  allTime.forEach(avatar => {
    const ageMins = Math.floor((new Date() - new Date(avatar.birthDate)) / (1000 * 60));
    totalMinutes += Math.min(ageMins, 60);
    faceCount[avatar.face] = (faceCount[avatar.face] || 0) + 1;
  });

  totalTimeAlive = totalMinutes;
  localStorage.setItem('totalTimeAlive', totalTimeAlive);

  const mostPopularFace = Object.entries(faceCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

  return {
    totalAvatars: allTime.length,
    mostPopularFace,
    totalClicks,
    totalTimeAlive,
    createdThisSession
  };
}

function openStatsMenu() {
  const stats = getStats();
  const statsDiv = document.getElementById('statsContent');
  statsDiv.innerHTML = `
    <p><strong>Total Avatars Created:</strong> ${stats.totalAvatars}</p>
    <p><strong>Most Popular Face:</strong> ${stats.mostPopularFace}</p>
    <p><strong>Total Interactions:</strong> ${stats.totalClicks}</p>
    <p><strong>Total Time Spent Alive:</strong> ${stats.totalTimeAlive} minutes</p>
    <p><strong>Avatars Born This Session:</strong> ${stats.createdThisSession}</p>
  `;
  document.getElementById('overlay').style.display = 'block';
  document.getElementById('statsMenu').style.display = 'block';
}


window.onload = function() {
  updateTime();
  setInterval(updateTime, 1000);
};

setInterval(() => {
  const sub = document.querySelector('.animate-me');
  sub.classList.add('animate-pulse');
  setTimeout(() => {
    sub.classList.remove('animate-pulse');
  }, 1000); // match duration of animation
}, 30000); // every 6 seconds, adjust as you like

function shouldDieRandomly(ageStatus) {
  const roll = Math.random(); // returns 0 to <1
  switch (ageStatus) {
    case "Newborn": return roll < (2.7 / 1000) / 60;
    case "Child":
    case "Teen":   return roll < (11.2 / 1000) / 60;
    case "Adult":  return roll < (972 / 100000) / 60;
    default: return false;
  }
}

function tickDeathCycle() {
  const now = new Date();
  const grid = document.getElementById('ascii-grid');
  
  const survivors = [];
  let anyChange = false;

  avatars.forEach(avatar => {
    const ageMins = Math.floor((now - new Date(avatar.birthDate)) / (1000 * 60));
    const ageStatus = ageMins <= 5 ? "Newborn"
                     : ageMins <= 15 ? "Child"
                     : ageMins <= 30 ? "Teen"
                     : "Adult";

    const expired = ageMins > 60;
    const unlucky = shouldDieRandomly(ageStatus);
    const died = expired || unlucky;

    if (died) {
      const message = expired
        ? "Passed peacefully of old age."
        : randomDeathMessages[Math.floor(Math.random() * randomDeathMessages.length)] || "Unknown cause of death.";

      graveyard.push({
        id: avatar.id,
        name: avatar.name,
        face: avatar.face,
        deathDate: new Date().toISOString(),
        ageMinutes: ageMins,
        cause: expired ? 'expired' : 'random',
        message
      });

      deathTickerQueue.push(`☠️ ${avatar.name} (${avatar.face}) — ${message}`);

      const el = document.querySelector(`[data-avatar-id="${avatar.id}"]`);
      if (el && !el.classList.contains('dying')) {
        el.classList.add('dying');
        setTimeout(() => el.remove(), 800);
        anyChange = true;
      }
    } else {
      survivors.push(avatar);
    }
  });

  if (anyChange) {
    avatars = survivors;
    localStorage.setItem('asciiAvatars', JSON.stringify(avatars));
    localStorage.setItem('asciiGraveyard', JSON.stringify(graveyard));
    renderAvatars();
  }
}




function openGraveyard() {
  const container = document.getElementById('graveyardContent');
  const list = [...graveyard].reverse().slice(0, 20); // show last 20

  container.innerHTML = list.map(entry => `
    <div class="grave-entry">
      <pre>${entry.face}</pre>
      <div><strong>${entry.name}</strong> - ${entry.ageMinutes} mins - ${entry.cause}</div>
      <p class="death-message">"${entry.message || 'No final words.'}"</p>
    </div>
  `).join('');

  document.getElementById('overlay').style.display = 'block';
  document.getElementById('graveyardMenu').style.display = 'block';
}


function updateLifeTicker() {
  const ticker = document.getElementById('tickerText');

  let textToShow = '';
  if (deathTickerQueue.length && !showLifeQuoteNext) {
    textToShow = deathTickerQueue.shift();
  } else {
    textToShow = getUniqueLifeQuote();
  }

  showLifeQuoteNext = !showLifeQuoteNext;

  ticker.textContent = textToShow;

  // Restart animation
  ticker.style.animation = 'none';
  ticker.offsetHeight; // Force reflow
  ticker.style.animation = null;
}


window.addEventListener('load', () => {
  updateLifeTicker();             // start the first ticker
  setInterval(updateLifeTicker, 20000);  // update every 20s
});

function updatePopulationCounter() {
  const alive = avatars.length;
  const dead = graveyard.length;
  const counter = document.getElementById('population-counter');
  counter.textContent = ` Alive: ${alive} [] Dead: ${dead}`;
}

// Update every second
setInterval(updatePopulationCounter, 1000);
window.addEventListener('load', updatePopulationCounter);

