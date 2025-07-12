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
const playerInputsContainer = document.getElementById('player-inputs');

// アプリのデータを保存する変数
let players = []; // 参加者の名前リスト
let votes = {};   // 投票結果 {投票者: 投票された人}
let currentVoterIndex = 0; // 現在投票する人のインデックス

// --- イベントリスナー（ボタンが押された時の処理）をここにまとめます ---

// 「参加者を追加」ボタンが押された時の処理
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

// 「登録完了」ボタンが押された時の処理
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

// 「お題決定」ボタンが押された時の処理
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

// 「参加者名入力に戻る」ボタンが押された時の処理
backToSetupBtn.addEventListener('click', () => {
    themeScreen.classList.add('hidden');
    setupScreen.classList.remove('hidden');
});

// 「はい、そうです」（本人確認）ボタンが押された時の処理
confirmVoterBtn.addEventListener('click', () => {
    voterConfirmScreen.classList.add('hidden');
    voteScreen.classList.remove('hidden');
    setupVoteScreen();
});

// 「いいえ、違います」（本人確認に戻る）ボタンが押された時の処理
backToConfirmBtn.addEventListener('click', () => {
    voteScreen.classList.add('hidden');
    showVoterConfirmation();
});

// 「結果を見る」ボタンが押された時の処理
showResultBtn.addEventListener('click', () => {
    preResultScreen.classList.add('hidden');
    showResults();
});


// --- アプリの主な機能に関する関数 ---

// 本人確認画面を表示する関数
function showVoterConfirmation() {
    const currentVoter = players[currentVoterIndex];
    document.getElementById('confirm-voter-name').textContent = currentVoter;
    voterConfirmScreen.classList.remove('hidden');
}

// 投票画面を準備する関数
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

// 投票を行い、次の人に進む関数
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

// 結果を表示する関数
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
        setTimeout(() => {
            drawConnections(couples);
        }, 100);
    } else {
        const noCoupleMsg = document.createElement('p');
        noCoupleMsg.textContent = '残念ながら、カップル不成立です...';
        noCoupleMsg.style.color = 'white';
        noCoupleMsg.style.fontSize = '24px';
        noCoupleMsg.style.width = '100%';
        noCoupleMsg.style.position = 'absolute';
        noCoupleMsg.style.top = '45%';
        document.getElementById('table-container').appendChild(noCoupleMsg);
    }
}

// 線を描画する専門の関数（点線＆ハート付きアニメーション版）
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

// 1本の線をアニメーションさせる関数
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

// ハートを描画する専門の関数
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
