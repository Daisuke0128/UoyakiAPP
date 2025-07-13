// 各画面の要素を取得
const setupScreen = document.getElementById('setup-screen');
const themeScreen = document.getElementById('theme-screen');
const voterConfirmScreen = document.getElementById('voter-confirm-screen');
const voteScreen = document.getElementById('vote-screen');
const preResultScreen = document.getElementById('pre-result-screen');
const resultScreen = document.getElementById('result-screen');

// ボタンなどの要素を取得
const addPlayerBtn = document.getElementById('add-player-btn');
const startBtn = document.getElementById('start-btn');
const themeConfirmBtn = document.getElementById('theme-confirm-btn');
const backToSetupBtn = document.getElementById('back-to-setup-btn');
const confirmVoterBtn = document.getElementById('confirm-voter-btn');
const backToConfirmBtn = document.getElementById('back-to-confirm-btn');
const showResultBtn = document.getElementById('show-result-btn');
const playAgainBtn = document.getElementById('play-again-btn');
const startOverBtn = document.getElementById('start-over-btn');
const playerInputsContainer = document.getElementById('player-inputs');

// アプリのデータを保存する変数
let players = []; // 参加者の名前リスト
let votes = {};   // 投票結果 {投票者: 投票された人}
let currentVoterIndex = 0; // 現在投票する人のインデックス

// --- イベントリスナー（ボタンが押された時の処理） ---

addPlayerBtn.addEventListener('click', () => {
    const playerCount = playerInputsContainer.getElementsByTagName('input').length;
    if (playerCount < 20) {
        const newInput = document.createElement('input');
        newInput.type = 'text';
        newInput.placeholder = `参加者${playerCount + 1}の名前`;
        playerInputsContainer.appendChild(document.createElement('br'));
        playerInputsContainer.appendChild(newInput);
    } else {
        alert('参加者は最大20名までです。');
    }
});

startBtn.addEventListener('click', () => {
    players = Array.from(playerInputsContainer.getElementsByTagName('input'))
                   .map(input => input.value.trim())
                   .filter(name => name !== "");

    if (players.length < 4) {
        alert('参加者は4名以上で入力してください。');
        return;
    }

    setupScreen.classList.add('hidden');
    themeScreen.classList.remove('hidden');
});

themeConfirmBtn.addEventListener('click', () => {
    const theme = document.getElementById('theme-input').value;
    if (theme.trim() === '') {
        alert('お題を入力してください。');
        return;
    }
    document.getElementById('theme-display').textContent = `お題：${theme}`;
    themeScreen.classList.add('hidden');
    showVoterConfirmation();
});

backToSetupBtn.addEventListener('click', () => {
    themeScreen.classList.add('hidden');
    setupScreen.classList.remove('hidden');
});

confirmVoterBtn.addEventListener('click', () => {
    voterConfirmScreen.classList.add('hidden');
    voteScreen.classList.remove('hidden');
    setupVoteScreen();
});

backToConfirmBtn.addEventListener('click', () => {
    voteScreen.classList.add('hidden');
    showVoterConfirmation();
});

showResultBtn.addEventListener('click', () => {
    preResultScreen.classList.add('hidden');
    showResults();
});

playAgainBtn.addEventListener('click', () => {
    resetForNewRound();
});

startOverBtn.addEventListener('click', () => {
    location.reload();
});


// --- アプリの主な機能に関する関数 ---

function showVoterConfirmation() {
    const currentVoter = players[currentVoterIndex];
    document.getElementById('confirm-voter-name').textContent = currentVoter;
    voterConfirmScreen.classList.remove('hidden');
}

function setupVoteScreen() {
    const currentVoter = players[currentVoterIndex];
    document.getElementById('voter-name').textContent = currentVoter;

    const choicesContainer = document.getElementById('choices');
    choicesContainer.innerHTML = ''; 
    
    players.forEach(player => {
        if (player !== currentVoter) {
            const choiceBtn = document.createElement('button');
            choiceBtn.textContent = player;
            choiceBtn.addEventListener('click', () => {
                castVote(player);
            });
            choicesContainer.appendChild(choiceBtn);
        }
    });
}

function castVote(votedPlayer) {
    const currentVoter = players[currentVoterIndex];
    votes[currentVoter] = votedPlayer;

    currentVoterIndex++;
    voteScreen.classList.add('hidden');

    if (currentVoterIndex < players.length) {
        showVoterConfirmation();
    } else {
        preResultScreen.classList.remove('hidden');
    }
}

function resetForNewRound() {
    votes = {};
    currentVoterIndex = 0;

    resultScreen.classList.add('hidden');
    
    const canvas = document.getElementById('connection-canvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    document.getElementById('no-couple-message').classList.add('hidden');

    themeScreen.classList.remove('hidden');
    document.getElementById('theme-input').value = '';
}

function showResults() {
    resultScreen.classList.remove('hidden');

    const sideLeft = document.getElementById('side-left');
    const sideRight = document.getElementById('side-right');
    const couples = [];
    const checkedPlayers = [];

    sideLeft.innerHTML = '';
    sideRight.innerHTML = '';

    players.forEach(player1 => {
        const player2 = votes[player1];
        if (votes[player2] === player1) {
            if (!checkedPlayers.includes(player1) && !checkedPlayers.includes(player2)) {
                couples.push([player1, player2]);
                checkedPlayers.push(player1, player2);
            }
        }
    });

    players.forEach((player, index) => {
        const playerBox = document.createElement('div');
        playerBox.classList.add('player-box');
        playerBox.id = `player-${player}`;
        playerBox.textContent = player;

        if (index % 2 === 0) {
            sideLeft.appendChild(playerBox);
        } else {
            sideRight.appendChild(playerBox);
        }
    });

    if (couples.length > 0) {
        document.getElementById('no-couple-message').classList.add('hidden');
        setTimeout(() => {
            drawConnections(couples);
        }, 100);
    } else {
        document.getElementById('no-couple-message').classList.remove('hidden');
    }
}

function drawConnections(couples) {
    const canvas = document.getElementById('connection-canvas');
    const tableContainer = document.getElementById('table-container');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    canvas.width = tableContainer.offsetWidth;
    canvas.height = tableContainer.offsetHeight;
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';

    ctx.strokeStyle = '#ff4757';
    ctx.lineWidth = 4;
    ctx.shadowColor = 'rgba(255, 255, 255, 0.7)';
    ctx.shadowBlur = 10;
    ctx.lineCap = 'round';
    ctx.setLineDash([15, 10]);

    let delay = 0;
    const lineDuration = 500;

    couples.forEach(couple => {
        setTimeout(() => {
            const name1Element = document.getElementById(`player-${couple[0]}`);
            const name2Element = document.getElementById(`player-${couple[1]}`);
            if (name1Element && name2Element) {
                const rect1 = name1Element.getBoundingClientRect();
                const rect2 = name2Element.getBoundingClientRect();
                const canvasRect = tableContainer.getBoundingClientRect();

                const startX = rect1.left + rect1.width / 2 - canvasRect.left;
                const startY = rect1.top + rect1.height / 2 - canvasRect.top;
                const endX = rect2.left + rect2.width / 2 - canvasRect.left;
                const endY = rect2.top + rect2.height / 2 - canvasRect.top;
                
                animateLine(ctx, startX, startY, endX, endY, lineDuration);

                setTimeout(() => {
                    const midX = startX + (endX - startX) / 2;
                    const midY = startY + (endY - startY) / 2;
                    drawHeart(ctx, midX, midY, 40);
                }, lineDuration); 
            }
        }, delay);
        delay += lineDuration + 200; 
    });
}

function animateLine(ctx, startX, startY, endX, endY, duration) {
    const startTime = performance.now();

    function draw(currentTime) {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);

        const currentX = startX + (endX - startX) * progress;
        const currentY = startY + (endY - startY) * progress;

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();

        if (progress < 1) {
            requestAnimationFrame(draw);
        }
    }

    requestAnimationFrame(draw);
}

function drawHeart(ctx, x, y, size) {
    ctx.save();
    ctx.setLineDash([]); 
    ctx.font = `${size}px sans-serif`;
    ctx.fillStyle = '#ff4757';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'white';
    ctx.shadowBlur = 15;
    ctx.fillText('❤️', x, y);
    ctx.restore();
}
