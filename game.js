/* =====================
   DOM
===================== */

const cat = document.getElementById('cat');
const churu = document.getElementById('churu');
const fill = document.getElementById('fill');
const text = document.getElementById('text');
const command = document.getElementById('command');
const countUI = document.getElementById('count-ui');
const infinite = document.getElementById('infinite');

/* =====================
   상태
===================== */

let satisfaction = 0;
let isDone = false;

let currentCommand = null;
let clickCount = 0;

let isHolding = false;
let holdTimer = null;

/* =====================
   지시 패턴
===================== */

const patterns = [
  { type: 'click', count: 1 },
  { type: 'click', count: 2 },
  { type: 'click', count: 3 },
  { type: 'hold', time: 3000 }
];

/* =====================
   카운트 UI
===================== */

function renderCountUI(total, used = 0) {
  countUI.innerHTML = '';

  for (let i = 0; i < total; i++) {
    const dot = document.createElement('div');
    dot.className = 'count-dot';
    if (i < used) dot.classList.add('used');
    countUI.appendChild(dot);
  }
}

/* =====================
   새 지시
===================== */

function newCommand() {
  if (isDone) return;

  clickCount = 0;
  currentCommand = patterns[Math.floor(Math.random() * patterns.length)];

  infinite.classList.remove('active');
  infinite.textContent = '';

  if (currentCommand.type === 'click') {
    command.textContent = '';
    text.textContent = `${currentCommand.count}번 눌러줘!`;
    renderCountUI(currentCommand.count, 0);
  } else {
    command.textContent = '';
    text.textContent = '꾹 눌러줘!';
    countUI.innerHTML = '';
    infinite.textContent = '∞';
  }
}

/* =====================
   클릭 처리
===================== */

function handleClick() {
  if (isDone) return;
  if (!currentCommand || currentCommand.type !== 'click') return;

  clickCount++;
  renderCountUI(currentCommand.count, clickCount);
  eatOnce();

  if (clickCount >= currentCommand.count) {
    success();
  }
}

churu.addEventListener('click', handleClick);

/* =====================
   꾹 누르기 (pointer)
===================== */

churu.addEventListener('pointerdown', startHold);
churu.addEventListener('pointerup', stopHold);
churu.addEventListener('pointerleave', stopHold);
churu.addEventListener('pointercancel', stopHold);

function startHold(e) {
  e.preventDefault();
  if (isDone) return;
  if (!currentCommand || currentCommand.type !== 'hold') return;
  if (isHolding) return;

  isHolding = true;
  //cat.src = 'cat_eating.png';
  cat.src = 'cat_eating3.gif';
  churu.classList.add('eating');

  infinite.classList.add('active');

  holdTimer = setTimeout(() => {
    success();
  }, currentCommand.time);
}

function stopHold() {
  if (!isHolding) return;

  isHolding = false;
  clearTimeout(holdTimer);
  holdTimer = null;

  churu.classList.remove('eating');
  infinite.classList.remove('active');

  if (!isDone) cat.src = 'cat_idle.png';
}

/* =====================
   공통 먹기 연출
===================== */

function eatOnce() {
  cat.src = 'cat_eating.png';
  //cat.src = 'cat_eating3.gif';
  churu.classList.add('eating');

  setTimeout(() => {
    churu.classList.remove('eating');
    if (!isHolding && !isDone) cat.src = 'cat_idle.png';
  }, 250);
}

/* =====================
   성공 처리
===================== */

function success() {
  clearTimeout(holdTimer);
  holdTimer = null;
  isHolding = false;

  infinite.classList.remove('active');
  infinite.textContent = '';

  satisfaction += 12;
  if (satisfaction > 100) satisfaction = 100;

  fill.style.width = satisfaction + '%';

  command.textContent = '😋';
  text.textContent = '맛있다냥!';

  cat.src = 'cat_eating.png';
  //cat.src = 'cat_eating3.gif';
  churu.classList.remove('eating');

  setTimeout(() => {
    if (satisfaction >= 100) {
      cat.src = 'cat_happy.png';
      command.textContent = '💖';
      text.textContent = '완전 만족!';
      isDone = true;

      setTimeout(() => {
        window.location.href = 'end.html';
      }, 800);

    } else {
      cat.src = 'cat_idle.png';
      newCommand();
    }
  }, 500);
}

/* =====================
   시작
===================== */

newCommand();

/* =====================
   모바일 기본 동작 차단
===================== */

document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
});
