const cat = document.getElementById('cat');
const churu = document.getElementById('churu');
const fill = document.getElementById('fill');
const text = document.getElementById('text');
const command = document.getElementById('command');

let satisfaction = 0;
let isDone = false;

let currentCommand = null;
let clickCount = 0;
let holdTimer = null;
let isHolding = false;

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
   새 지시 생성
===================== */

function newCommand() {
  if (isDone) return;

  clickCount = 0;
  currentCommand = patterns[Math.floor(Math.random() * patterns.length)];

  if (currentCommand.type === 'click') {
    command.textContent = currentCommand.count;
    text.textContent = `${currentCommand.count}번 눌러줘!`;
  } else {
    command.textContent = '무한 3초';
    text.textContent = '꾹 눌러줘!';
  }
}

/* =====================
   클릭 처리
===================== */

churu.addEventListener('click', () => {
  if (isDone) return;
  if (!currentCommand || currentCommand.type !== 'click') return;

  clickCount++;
  eatOnce();

  if (clickCount >= currentCommand.count) {
    success();
  }
});

/* =====================
   꾹 누르기 처리
===================== */

churu.addEventListener('mousedown', startHold);
churu.addEventListener('touchstart', startHold);

churu.addEventListener('mouseup', stopHold);
churu.addEventListener('mouseleave', stopHold);
churu.addEventListener('touchend', stopHold);

function startHold() {
  if (isDone) return;
  if (!currentCommand || currentCommand.type !== 'hold') return;
  if (isHolding) return;

  isHolding = true;
  cat.src = 'cat_eating.png';
  churu.classList.add('eating');

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
  if (!isDone) cat.src = 'cat_idle.png';
}

/* =====================
   공통 먹기 연출
===================== */

function eatOnce() {
  cat.src = 'cat_eating.png';
  churu.classList.add('eating');

  setTimeout(() => {
    churu.classList.remove('eating');
    if (!isHolding && !isDone) cat.src = 'cat_idle.png';
  }, 300);
}

/* =====================
   성공 처리
===================== */

function success() {
  clearTimeout(holdTimer);
  holdTimer = null;
  isHolding = false;

  satisfaction += 12;
  if (satisfaction >= 100) satisfaction = 100;

  fill.style.width = satisfaction + '%';
  command.textContent = '😋';
  text.textContent = '맛있다냥!';

  cat.src = 'cat_eating.png';
  churu.classList.remove('eating');

  setTimeout(() => {
    if (satisfaction >= 100) {
      cat.src = 'cat_happy.png';
      command.textContent = '💖';
      text.textContent = '완전 만족!';
      isDone = true;
    } else {
      cat.src = 'cat_idle.png';
      newCommand();
    }
  }, 500);
}

/* =====================
   게임 시작
===================== */

newCommand();
