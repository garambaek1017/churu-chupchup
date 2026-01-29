const board = document.getElementById('game-board');
const timerText = document.getElementById('timer-count');
const startOverlay = document.getElementById('start-overlay');
const finalMessage = document.getElementById('final-message');

// 게임 설정 변수
const totalImages = 30; 
let gameCards = [];
let firstCard, secondCard;
let hasFlippedCard = false, lockBoard = true;
let matchedPairs = 0, seconds = 0, timerInterval;
let currentDifficulty = 15;

// [생명력 & 아이템 변수]
let maxLives = 5;
let currentLives = 5;
let hintCount = 3;
let isHinting = false; // 힌트 보는 중인지 체크

// 카드 번호(이미지)별 배경색 지정
const cardColors = {
    1: "#FFCFE1", // 연한 핑크
    2: "#CDF0EA", // 연한 민트
    3: "#F9F9C5", // 연한 노랑
    4: "#D6E5FA", // 연한 하늘
    5: "#E8D3FF", // 연한 보라
    6: "#FFDCA9", // 연한 주황
    7: "#D3F4D3", // 연한 연두
    8: "#FFB7B2", // [추가됨] 연한 코랄 (살구빛 핑크)
};

// 1. 게임 로딩
function loadingGame(pairCount) {
    currentDifficulty = pairCount;
    showScreen('game-screen');
    
    initGame();       // 점수, 시간 초기화
    initLives();      // [하트] 5개로 초기화
    resetItems();     // [돋보기] 3개로 초기화
    
    prepareCards(pairCount);
    createBoard();
    
    // BGM 재생 및 볼륨 조절
    const bgm = document.getElementById('bgm');
    if(bgm) bgm.volume = 0.3;
    playSound('bgm'); 

    // 게임 시작 연출
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

function prepareCards(pairCount) {
    // 전체 이미지를 1번부터 순서대로 만듭니다.
    const allNumbers = Array.from({length: totalImages}, (_, i) => i + 1);
    
    // [삭제됨] 랜덤으로 섞는 코드를 지웠습니다.
    // allNumbers.sort(() => Math.random() - 0.5); 

    // 앞에서부터 pairCount 개수만큼 자릅니다 (즉, 1번 ~ pairCount번)
    const selectedImages = allNumbers.slice(0, pairCount);
    
    gameCards = [...selectedImages, ...selectedImages];
}

// 3. 보드 생성
function createBoard() {
    board.innerHTML = '';
    
    // 카드 섞기
    gameCards.sort(() => Math.random() - 0.5);
    
    gameCards.forEach(imageNum => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.value = imageNum;
        
        // [추가] 2. 현재 이미지 번호에 맞는 색상 가져오기 (없으면 흰색)
        const bgColor = cardColors[imageNum] || '#FFFFFF';

        // [수정] 3. style 속성을 이용해 배경색 적용
        card.innerHTML = `
            <div class="card-inner">
                <div class="card-face card-front"></div>
                <div class="card-face card-back" style="background-color: ${bgColor};">
                    <img src="image/${imageNum}.png" alt="card image"> 
                </div>
            </div>`;

        card.addEventListener('click', flipCard);
        board.appendChild(card);
    });
}

// 4. [핵심] 카드 뒤집기 (HP 감소 로직 포함)
function flipCard() {
    // 잠겨있거나, 이미 뒤집은 카드거나, 힌트 보는 중이면 클릭 금지
    if (lockBoard || this === firstCard || isHinting) return;

    playSound('s-flip');
    this.classList.add('flipped');

    if (!hasFlippedCard) {
        hasFlippedCard = true;
        firstCard = this;
        return;
    }

    secondCard = this;

    // 매칭 성공?
    if (firstCard.dataset.value === secondCard.dataset.value) {
        playSound('s-match');
        matchedPairs++;
        lockBoard = true;
        
        setTimeout(() => {
            firstCard.classList.add('matched');
            secondCard.classList.add('matched');
            if (matchedPairs === currentDifficulty) endGame(true); // 성공!
            resetTurn();
        }, 600);
    } 
    // 매칭 실패? (목숨 까임!)
    else {
        lockBoard = true;
        
        // 목숨 감소
        currentLives--;
        updateLifeUI();
        
        // 목숨 0이면 게임 오버
        if (currentLives <= 0) {
            setTimeout(() => {
                endGame(false); // 실패!
            }, 800);
            return;
        }

        // 틀렸으니 다시 뒤집기
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

// 5. 게임 종료 (성공/실패 분기)
function endGame(isSuccess) {
    clearInterval(timerInterval);
    stopSound('bgm');

    if (isSuccess) {
        playSound('s-success');
        finalMessage.innerHTML = `${seconds}초`; 
        setTimeout(() => showScreen('end-screen'), 500);
    } else {
        // 실패 화면 띄우기 (실패 효과음 있으면 여기에 추가)
        // playSound('s-fail'); 
        setTimeout(() => showScreen('fail-screen'), 500);
    }
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

function goToHome() { 
    stopSound('bgm');
    stopSound('s-success');
    showScreen('start-screen'); 
}

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

function startGameRandom() {
    const difficulties = [8];
    const randomIndex = Math.floor(Math.random() * difficulties.length);
    loadingGame(difficulties[randomIndex]);
}

/* --- [기능 1] 생명력(HP) UI 관리 --- */
function initLives() {
    currentLives = maxLives;
    updateLifeUI();
}

function updateLifeUI() {

    const lifeContainer = document.getElementById('life-hearts');

    let heartsHTML = '';
    
    for (let i = 0; i < maxLives; i++) {
        if (i < currentLives) {
            // 꽉 찬 하트 이미지
            heartsHTML += '<img src="image/heart_full.png" class="heart-icon">';
        } else {
            // 빈 하트 이미지
            heartsHTML += '<img src="image/heart_empty.png" class="heart-icon">';
        }
    }
    
    // innerText 대신 innerHTML을 써야 태그가 먹힙니다!
    lifeContainer.innerHTML = heartsHTML;
}

/* --- [기능 2] 돋보기 아이템 & 치트키 통합 --- */

// 아이템 개수 초기화
function resetItems() {
    hintCount = 3;
    updateHintUI();
}

function updateHintUI() {
    document.getElementById('hint-count').innerText = hintCount;
    // 0개면 버튼 흐리게
    document.getElementById('btn-hint').disabled = (hintCount <= 0);
}

// 돋보기 사용 (버튼 클릭 / 우클릭 공용)
function useHint() {
    if (hintCount <= 0 || isHinting || lockBoard) return;

    hintCount--;
    updateHintUI();
    playSound('s-flip'); 

    isHinting = true;
    const allCards = document.querySelectorAll('.card:not(.matched)');
    
    allCards.forEach(card => card.classList.add('flipped'));

    setTimeout(() => {
        allCards.forEach(card => card.classList.remove('flipped'));
        isHinting = false;
    }, 1500);
}

// PC 우클릭 -> 돋보기 사용으로 연결
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    const gameScreen = document.getElementById('game-screen');
    if (!gameScreen.classList.contains('hidden')) {
        useHint(); // 아이템 사용 함수 호출!
    }
});

// 모바일 꾹 누르기 -> 돋보기 사용으로 연결
let touchTimer;
const gameScreen = document.getElementById('game-screen');
gameScreen.addEventListener('touchstart', function(e) {
    touchTimer = setTimeout(() => {
        if (!gameScreen.classList.contains('hidden')) useHint();
    }, 1000);
});
gameScreen.addEventListener('touchend', () => clearTimeout(touchTimer));
gameScreen.addEventListener('touchmove', () => clearTimeout(touchTimer));


/* --- 소리 헬퍼 --- */
function playSound(id) {
    const audio = document.getElementById(id);
    if (audio) {
        audio.currentTime = 0; 
        audio.play().catch(e => {});
    }
}
function stopSound(id) {
    const audio = document.getElementById(id);
    if (audio) {
        audio.pause();
        audio.currentTime = 0;
    }
}

/* --- [추가] 시작 화면에서 클릭하면 바로 노래 재생 --- */
// 사용자가 화면을 처음 클릭할 때(터치할 때) BGM 재생 시도
document.body.addEventListener('click', function() {
    // 배경음악이 재생 중이 아니라면 재생!
    const bgm = document.getElementById('bgm');
    if (bgm && bgm.paused) {
        bgm.volume = 0.3; // 볼륨 설정
        bgm.play().catch(e => console.log('아직 재생 못함'));
    }
}, { once: true }); // once: true -> 딱 한 번만 실행하고 사라짐 (계속 클릭할 때마다 실행되면 안 되니까)