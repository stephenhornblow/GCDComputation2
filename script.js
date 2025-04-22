const asciiFaces = ['^_^', '(o_o)', '(-_-)', '(*_*)', ':)', ':3', '>_<', 'T_T', 'UwU', 'O_O','OwO', '(◕‿◕✿)', 't(-_-t)','♪~ ᕕ(ᐛ)ᕗ','ฅ^•ﻌ•^ฅ','ᶘ ◕ᴥ◕ᶅ','(• ε •)','( 　ﾟ,_ゝﾟ)','(ᗒᗣᗕ)՞' ];
let selectedFace = asciiFaces[0];
let avatars = JSON.parse(localStorage.getItem('asciiAvatars')) || [];

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
  closeMenu();
  renderAvatars();
}

function renderAvatars() {
  const grid = document.getElementById('ascii-grid');
  grid.innerHTML = '';
  const now = new Date();
  avatars = avatars.filter(avatar => (now - new Date(avatar.birthDate)) < 61 * 60 * 1000); 
  localStorage.setItem('asciiAvatars', JSON.stringify(avatars));
  avatars.forEach(avatar => {
    const div = document.createElement('div');
    div.className = 'avatar';
    div.innerHTML = `<pre>${avatar.face}</pre><div>${avatar.name}</div>`;
    div.onclick = () => showMenu(avatar);
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
}

setInterval(renderAvatars, 10000);
renderAvatars();

function updateTime() {
  const now = new Date();
  const options = { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false
  };
  const formattedTime = now.toLocaleDateString('en-US', options);
  document.getElementById('current-time').innerText = formattedTime;
}

window.onload = function() {
  updateTime();
  setInterval(updateTime, 1000);
};
