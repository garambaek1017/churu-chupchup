const board = document.getElementById('game-board');
const timerText = document.getElementById('timer-count');
const startOverlay = document.getElementById('start-overlay');
const finalMessage = document.getElementById('final-message');

// 1. 이미지 파일명 준비
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
    prepareCards(pairCount);
    createBoard();
    
    // [소리 추가] 게임 시작 시 BGM 재생
    document.getElementById('bgm').volume = 0.3;
    playSound('bgm'); 

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

// 2. 난이도별 이미지 랜덤 추출 로직
function prepareCards(pairCount) {
    const allNumbers = Array.from({length: totalImages}, (_, i) => i + 1);
    allNumbers.sort(() => Math.random() - 0.5);
    const selectedImages = allNumbers.slice(0, pairCount);
    gameCards = [...selectedImages, ...selectedImages];
}

// 3. 카드 생성
function createBoard() {
    board.innerHTML = '';
    gameCards.sort(() => Math.random() - 0.5);
    
    gameCards.forEach(imageNum => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.value = imageNum;
        
        card.innerHTML = `
            <div class="card-inner">
                <div class="card-face card-front"></div>
                <div class="card-face card-back">
                    <img src="image/${imageNum}.png"> 
                </div>
            </div>`;

        card.addEventListener('click', flipCard);
        board.appendChild(card);
    });
}

// [핵심 수정] 카드 뒤집기 함수에 소리 추가
function flipCard() {
    if (lockBoard || this === firstCard) return;

    // [소리 추가] 카드 뒤집을 때 촥!
    playSound('s-flip'); 

    this.classList.add('flipped');

    if (!hasFlippedCard) {
        hasFlippedCard = true;
        firstCard = this;
        return;
    }

    secondCard = this;

    if (firstCard.dataset.value === secondCard.dataset.value) {
        // [소리 추가] 짝 맞췄을 때 띠링!
        playSound('s-match'); 

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

function resetTurn() { 
    [hasFlippedCard, lockBoard] = [false, false]; 
    [firstCard, secondCard] = [null, null]; 
}

// [핵심 수정] 게임 종료 함수에 소리 추가
function endGame() {
    clearInterval(timerInterval);
    
    // [소리 추가] BGM 끄고, 승리 효과음 재생!
    stopSound('bgm');
    playSound('s-success');

    finalMessage.innerHTML = `${seconds}초`; // [수정] 텍스트 깔끔하게 초만 표시
    setTimeout(() => showScreen('end-screen'), 800);
}

function startTimer() {
    timerInterval = setInterval(() => {
        seconds++;
        timerText.innerText = seconds;
    }, 1000);
}

function initGame() { 
    matchedPairs = 0; 
    seconds = 0; 
    timerText.innerText = '0'; 
    clearInterval(timerInterval); 
}

function restartGame() { loadingGame(currentDifficulty); }

// [핵심 수정] 홈으로 갈 때 소리 끄기
function goToHome() { 
    // [소리 추가] 모든 소리 끄기
    stopSound('bgm');
    stopSound('s-success');
    
    showScreen('start-screen'); 
}

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

function startGameRandom() {
    const difficulties = [5, 10, 15];
    const randomIndex = Math.floor(Math.random() * difficulties.length);
    const randomDifficulty = difficulties[randomIndex];
    console.log(`랜덤 선택된 난이도: ${randomDifficulty}쌍`);
    loadingGame(randomDifficulty);
}

/* --- 치트키 (오른쪽 클릭) --- */
let isHinting = false;
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    const gameScreen = document.getElementById('game-screen');
    if (gameScreen.classList.contains('hidden') || isHinting) return;

    isHinting = true;
    const allCards = document.querySelectorAll('.card:not(.matched)');
    
    // 힌트 쓸 때도 소리 나면 재밌음 (선택사항)
    playSound('s-hint'); 

    allCards.forEach(card => {
        card.classList.add('flipped');
    });

    setTimeout(() => {
        allCards.forEach(card => {
            card.classList.remove('flipped');
        });
        flippedCards = []; // 변수명 주의: 위쪽 전역 변수가 firstCard/secondCard이므로 이 부분은 로직상 사실 resetTurn()이 더 안전함. 
        // 하지만 기존 코드 유지 차원에서 둠 (엄밀히는 resetTurn 호출 권장)
        
        // 치트키 끝나면 변수 초기화 확실하게
        [hasFlippedCard, lockBoard] = [false, false]; 
        [firstCard, secondCard] = [null, null];

        isHinting = false;
    }, 1500);
});


/* --- [필수] 소리 재생 헬퍼 함수 --- */
function playSound(id) {
   const audio = document.getElementById(id);
    if (audio) {
        audio.currentTime = 0; 
        
        // [추가] 배경음악(bgm)은 0.3, 나머지는 0.5로 설정하는 로직
        if (id === 'bgm') {
            audio.volume = 0.3; // 배경음악은 잔잔하게
        } else {
            audio.volume = 0.5; // 효과음은 적당하게 (절반 크기)
        }
        
        audio.play().catch(e => console.log('소리 재생 차단됨:', e));
    }
}

function stopSound(id) {
    const audio = document.getElementById(id);
    if (audio) {
        audio.pause();
        audio.currentTime = 0;
    }
}