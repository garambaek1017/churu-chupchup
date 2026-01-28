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

function startGameRandom() {
    // 난이도 목록: 15(하), 20(중), 25(상)
    //const difficulties = [15, 20, 25];

    const difficulties = [5, 10, 15];
    
    // 3개 중 하나를 랜덤으로 뽑음
    const randomIndex = Math.floor(Math.random() * difficulties.length);
    const randomDifficulty = difficulties[randomIndex];
    
    console.log(`랜덤 선택된 난이도: ${randomDifficulty}쌍`); // 확인용 로그
    
    // 선택된 난이도로 게임 로딩
    loadingGame(randomDifficulty);
}


let isHinting = false;

// 화면 어디서든 오른쪽 마우스를 누르면 실행
document.addEventListener('contextmenu', function(e) {
    // 1. 기본 오른쪽 클릭 메뉴(저장, 인쇄 등)가 안 뜨게 막음
    e.preventDefault();

    // 2. 게임 중이 아니거나, 이미 힌트 보는 중이면 무시
    const gameScreen = document.getElementById('game-screen');
    if (gameScreen.classList.contains('hidden') || isHinting) return;

    // 3. 힌트 시작!
    isHinting = true;
    
    // 아직 짝을 못 맞춘 카드들만 찾음
    const allCards = document.querySelectorAll('.card:not(.matched)');
    
    // 찾은 카드들을 전부 강제로 뒤집음 (보여줌)
    allCards.forEach(card => {
        card.classList.add('flipped');
    });

    // 4. 1.5초 뒤에 다시 덮기
    setTimeout(() => {
        allCards.forEach(card => {
            // 주의: 사용자가 직접 뒤집어둔 카드도 이때 같이 덮입니다 (초기화)
            // 힌트를 봤으니 공평하게 다시 시작하는 느낌!
            card.classList.remove('flipped');
        });
        
        // 현재 뒤집힌 카드 목록(flippedCards) 배열도 비워줘야 에러가 안 남
        flippedCards = []; 
        
        // 힌트 종료 (이제 다시 클릭 가능)
        isHinting = false;
        
    }, 1500); // 1500 = 1.5초 (시간 조절 가능)
});