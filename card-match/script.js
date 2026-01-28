const board = document.getElementById('game-board');
const timerText = document.getElementById('timer-count');
const startOverlay = document.getElementById('start-overlay');
const finalMessage = document.getElementById('final-message');

// 카드 소스 (넉넉하게 25개 이상 준비)
const allCardIcons = [
    '🍎', '🍌', '🍓', '🍋', '🍇', '🍉', '🍒', '🥝', '🍑', '🫐', 
    '🥥', '🥑', '🍍', '🥕', '🌽', '🥦', '🥬', '🍄', '🥜', '🥨',
    '🥞', '🧇', '🧀', '🍔', '🍟'
];
let gameCards = [];
let currentDifficulty = 15; // 기본값

let firstCard, secondCard;
let hasFlippedCard = false;
let lockBoard = true; 
let matchedPairs = 0;
let timerInterval;
let seconds = 0;

// 1. 게임 시작 연출 로직
function loadingGame(pairCount) {
    currentDifficulty = pairCount;
    showScreen('game-screen');
    initGame();
    prepareCards(pairCount); // 난이도에 맞게 카드 준비
    createBoard();
    
    // 연출: 카드 보여주기 -> Start!
    setTimeout(() => {
        const allCards = document.querySelectorAll('.card');
        allCards.forEach(card => card.classList.add('flipped'));

        setTimeout(() => {
            allCards.forEach(card => card.classList.remove('flipped'));
            startOverlay.classList.remove('hidden');
            setTimeout(() => {
                startOverlay.classList.add('hidden');
                lockBoard = false;
                startTimer();
            }, 800);
        }, 2000); 
    }, 500);
}

// 2. 난이도별 카드 배열 준비
function prepareCards(pairCount) {
    // 사용할 아이콘을 난이도 개수만큼 자름
    const selectedIcons = allCardIcons.slice(0, pairCount);
    // 짝을 맞춰서 배열 생성
    gameCards = [...selectedIcons, ...selectedIcons];
}

// 2. 타이머 기능
function startTimer() {
    seconds = 0;
    timerText.innerText = seconds;
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        seconds++;
        timerText.innerText = seconds;
    }, 1000);
}

// 3. 카드 생성 및 배치
function createBoard() {
    board.innerHTML = '';
    // Fisher-Yates shuffle 알고리즘으로 더 확실하게 섞기
    for (let i = gameCards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [gameCards[i], gameCards[j]] = [gameCards[j], gameCards[i]];
    }

    gameCards.forEach(value => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.value = value;
        card.innerHTML = `
            <div class="card-inner">
                <div class="card-face card-front"></div>
                <div class="card-face card-back">${value}</div>
            </div>`;
        card.addEventListener('click', flipCard);
        board.appendChild(card);
    });
}
function flipCard() {
    if (lockBoard || this === firstCard) return;
    this.classList.add('flipped');
    if (!hasFlippedCard) {
        hasFlippedCard = true;
        firstCard = this;
        return;
    }
    secondCard = this;
    checkForMatch();
}

function checkForMatch() {
    let isMatch = firstCard.dataset.value === secondCard.dataset.value;
    isMatch ? disableCards() : unflipCards();
}
// 4. 종료 조건 체크 수정
function disableCards() {
    matchedPairs++;
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    
    setTimeout(() => {
        firstCard.classList.add('matched');
        secondCard.classList.add('matched');
        // 현재 선택한 난이도의 쌍 개수와 비교
        if (matchedPairs === currentDifficulty) endGame();
        resetTurn();
    }, 600);
}

function unflipCards() {
    lockBoard = true;
    setTimeout(() => {
        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');
        resetTurn();
    }, 1000);
}

function resetTurn() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

// 4. 종료 처리 [3-1, 3-2]
function endGame() {
    clearInterval(timerInterval);
    finalMessage.innerHTML = `수고하셨습니다.<br>playtime : ${seconds}초`;
    setTimeout(() => showScreen('end-screen'), 800);
}

function initGame() {
    matchedPairs = 0;
    seconds = 0;
    timerText.innerText = '0';
    lockBoard = true;
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');
}

function goToHome() {
    showScreen('start-screen');
}

// "다시 하기" 버튼 클릭 시 현재 난이도로 다시 시작하도록 수정
function restartGame() {
    loadingGame(currentDifficulty);
}