const board = document.getElementById('game-board');
const timerText = document.getElementById('timer-count');
const startOverlay = document.getElementById('start-overlay');
const finalMessage = document.getElementById('final-message');

// 1. 이미지 파일명 준비 (1.png ~ 30.png를 위한 숫자들)
const totalImages = 30; 
let gameCards = [];
let firstCard, secondCard;
let hasFlippedCard = false, lockBoard = true;
let matchedPairs = 0, seconds = 0, timerInterval;
let currentDifficulty = 15;

function loadingGame(pairCount) {
    currentDifficulty = pairCount;
    showScreen('game-screen');
    initGame();
    prepareCards(pairCount); // [수정] 이미지 랜덤 추출 로직 포함
    createBoard();
    
    setTimeout(() => {
        document.querySelectorAll('.card').forEach(card => card.classList.add('flipped'));
        setTimeout(() => {
            document.querySelectorAll('.card').forEach(card => card.classList.remove('flipped'));
            startOverlay.classList.remove('hidden');
            setTimeout(() => {
                startOverlay.classList.add('hidden');
                lockBoard = false;
                startTimer();
            }, 800);
        }, 2000); 
    }, 500);
}

// 2. 난이도별 이미지 랜덤 추출 로직 [핵심 수정]
function prepareCards(pairCount) {
    // 1부터 30까지의 숫자 배열 생성
    const allNumbers = Array.from({length: totalImages}, (_, i) => i + 1);
    
    // 전체 이미지(30장) 중에서 랜덤하게 섞기
    allNumbers.sort(() => Math.random() - 0.5);
    
    // 섞인 숫자 중 현재 난이도(pairCount)만큼만 뽑기
    const selectedImages = allNumbers.slice(0, pairCount);
    
    // 뽑힌 숫자들을 짝을 맞춰(2배) 게임 카드 배열 생성
    gameCards = [...selectedImages, ...selectedImages];
}

// 3. 카드 생성 (이모지 대신 <img> 태그 삽입) [수정]
function createBoard() {
    board.innerHTML = '';
    gameCards.sort(() => Math.random() - 0.5); // 다시 한 번 위치 섞기
    
    gameCards.forEach(imageNum => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.value = imageNum; // 이미지 번호를 비교값으로 사용
        
       // 카드 생성 부분의 innerHTML만 한 번 더 확인!
card.innerHTML = `
    <div class="card-inner">
        <div class="card-face card-front">
             </div>
        <div class="card-face card-back">
            <img src="image/${imageNum}.png"> 
        </div>
    </div>`;
    
        card.addEventListener('click', flipCard);
        board.appendChild(card);
    });
}

// --- 아래는 기존 로직과 동일 (비교 로직 등) ---

function flipCard() {
    if (lockBoard || this === firstCard) return;
    this.classList.add('flipped');
    if (!hasFlippedCard) {
        hasFlippedCard = true;
        firstCard = this;
        return;
    }
    secondCard = this;
    if (firstCard.dataset.value === secondCard.dataset.value) {
        matchedPairs++;
        lockBoard = true;
        setTimeout(() => {
            firstCard.classList.add('matched');
            secondCard.classList.add('matched');
            if (matchedPairs === currentDifficulty) endGame();
            resetTurn();
        }, 600);
    } else {
        lockBoard = true;
        setTimeout(() => {
            firstCard.classList.remove('flipped');
            secondCard.classList.remove('flipped');
            resetTurn();
        }, 1000);
    }
}

function resetTurn() { [hasFlippedCard, lockBoard] = [false, false]; [firstCard, secondCard] = [null, null]; }

function endGame() {
    clearInterval(timerInterval);
    finalMessage.innerHTML = `수고하셨습니다.<br>playtime : ${seconds}초`;
    setTimeout(() => showScreen('end-screen'), 800);
}

function startTimer() {
    timerInterval = setInterval(() => {
        seconds++;
        timerText.innerText = seconds;
    }, 1000);
}

function initGame() { matchedPairs = 0; seconds = 0; timerText.innerText = '0'; clearInterval(timerInterval); }
function restartGame() { loadingGame(currentDifficulty); }
function goToHome() { showScreen('start-screen'); }
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}