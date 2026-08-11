const TOTAL_LEVELS = 10;
const POINTS_PER_LEVEL = 10;
const GRID_SIZE = 3; 

let unlockedLevels = 1;
let currentScore = 0;

try {
    unlockedLevels = parseInt(localStorage.getItem('puzzleUnlocked')) || 1;
    currentScore = parseInt(localStorage.getItem('puzzleScore')) || 0;
} catch(e) {}

let currentLevel = 1;
let puzzleState = [];
let selectedPieceIndex = null;

const scoreEl = document.getElementById('score');
const levelsGrid = document.getElementById('levels-grid');
const menuScreen = document.getElementById('menu-screen');
const gameScreen = document.getElementById('game-screen');
const victoryScreen = document.getElementById('victory-screen');
const puzzleBoard = document.getElementById('puzzle-board');
const levelTitle = document.getElementById('current-level-title');
const winSound = document.getElementById('win-sound');

window.onload = () => {
    updateScoreDisplay();
    renderLevels();
};

function updateScoreDisplay() {
    scoreEl.innerText = currentScore;
}

function renderLevels() {
    levelsGrid.innerHTML = '';
    for (let i = 1; i <= TOTAL_LEVELS; i++) {
        const isUnlocked = i <= unlockedLevels;
        
        const col = document.createElement('div');
        col.className = 'col-6 col-sm-4'; 
        
        const card = document.createElement('div');
        card.className = 'level-card';
        card.style.backgroundImage = `url('level${i}.png')`;
        
        if (!isUnlocked) {
            const overlay = document.createElement('div');
            overlay.className = 'locked-overlay';
            overlay.innerHTML = `<i class="fas fa-lock fa-2x"></i>`;
            card.appendChild(overlay);
        } else {
            card.onclick = () => loadLevel(i);
        }
        
        col.appendChild(card);
        levelsGrid.appendChild(col);
    }
}

function showMenu() {
    gameScreen.classList.remove('d-flex');
    gameScreen.classList.add('d-none');
    victoryScreen.classList.remove('d-flex');
    victoryScreen.classList.add('d-none');
    menuScreen.classList.remove('d-none');
    menuScreen.classList.add('d-flex');
    renderLevels();
}

function loadLevel(level) {
    currentLevel = level;
    levelTitle.innerText = `المرحلة ${level}`;
    selectedPieceIndex = null;
    
    menuScreen.classList.remove('d-flex');
    menuScreen.classList.add('d-none');
    gameScreen.classList.remove('d-none');
    gameScreen.classList.add('d-flex');
    
    initPuzzleState();
    renderPuzzleBoard();
}

function isPuzzleSolved() {
    return puzzleState.every((piece, index) => piece.id === index);
}

function initPuzzleState() {
    puzzleState = [];
    const totalPieces = GRID_SIZE * GRID_SIZE;
    for (let i = 0; i < totalPieces; i++) {
        puzzleState.push({ id: i });
    }
    do {
        puzzleState.sort(() => Math.random() - 0.5);
    } while (isPuzzleSolved());
}

function renderPuzzleBoard() {
    puzzleBoard.innerHTML = '';
    const imgSrc = `level${currentLevel}.png`;
    
    puzzleState.forEach((piece, domIndex) => {
        const pieceEl = document.createElement('div');
        pieceEl.className = 'puzzle-piece';
        pieceEl.style.backgroundImage = `url('${imgSrc}')`;
        
        const row = Math.floor(piece.id / GRID_SIZE);
        const col = piece.id % GRID_SIZE;
        pieceEl.style.backgroundPosition = `${col * 50}% ${row * 50}%`;
        
        pieceEl.onclick = () => handlePieceClick(domIndex);
        puzzleBoard.appendChild(pieceEl);
    });
}

function handlePieceClick(index) {
    if (selectedPieceIndex === null) {
        selectedPieceIndex = index;
        puzzleBoard.children[index].classList.add('selected');
    } else {
        if (selectedPieceIndex === index) {
            puzzleBoard.children[index].classList.remove('selected');
            selectedPieceIndex = null;
            return;
        }
        
        const temp = puzzleState[selectedPieceIndex];
        puzzleState[selectedPieceIndex] = puzzleState[index];
        puzzleState[index] = temp;
        
        selectedPieceIndex = null;
        renderPuzzleBoard();
        
        if (isPuzzleSolved()) {
            setTimeout(() => handleLevelComplete(), 200);
        }
    }
}

function checkPuzzleManually() {
    if (isPuzzleSolved()) {
        handleLevelComplete();
    } else {
        alert("لم تنتهِ بعد! رتب قطع الصورة بشكلها الصحيح ثم اضغط تحقق.");
    }
}

function handleLevelComplete() {
    if (currentLevel === unlockedLevels) {
        currentScore += POINTS_PER_LEVEL;
        unlockedLevels = Math.min(unlockedLevels + 1, TOTAL_LEVELS);
        
        try {
            localStorage.setItem('puzzleScore', currentScore);
            localStorage.setItem('puzzleUnlocked', unlockedLevels);
        } catch(e) {}
        
        updateScoreDisplay();
    }
    
    if (currentLevel === TOTAL_LEVELS || currentScore >= 100) {
        triggerVictory();
    } else {
        alert(`🎉 بامتياز! أتممت المرحلة ${currentLevel} بنجاح وتم إضافة 10 نقاط لرصيدك.`);
        showMenu();
    }
}

function triggerVictory() {
    gameScreen.classList.remove('d-flex');
    gameScreen.classList.add('d-none');
    victoryScreen.classList.remove('d-none');
    victoryScreen.classList.add('d-flex');
    winSound.play().catch(e => console.log("الصوت يتطلب تفاعل المستخدم"));
}

function shareGame() {
    if (navigator.share) {
        navigator.share({
            title: 'لعبة تركيب الصور الاحترافية',
            text: `لقد أنهيت لعبة تركيب الصور بـ ${currentScore} نقطة! تفوق علي إن استطعت.`,
            url: window.location.href
        }).catch(console.error);
    } else {
        alert("تم النسخ! يمكنك مشاركة رابط اللعبة مع أصدقائك.");
    }
}

function resetGame() {
    if(confirm("هل تريد تصفير النقاط وإعادة اللعبة من البداية؟")) {
        try { localStorage.clear(); } catch(e) {}
        unlockedLevels = 1;
        currentScore = 0;
        updateScoreDisplay();
        showMenu();
    }
}