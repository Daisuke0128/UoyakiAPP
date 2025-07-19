// 各画面の要素を取得
const setupScreen = document.getElementById('setup-screen');
const themeScreen = document.getElementById('theme-screen');
const voterConfirmScreen = document.getElementById('voter-confirm-screen');
const voteScreen = document.getElementById('vote-screen');
const preResultScreen = document.getElementById('pre-result-screen');
const resultScreen = document.getElementById('result-screen');
const allVotesScreen = document.getElementById('all-votes-screen');

// ボタンなどの要素を取得
const addPlayerBtns = document.querySelectorAll('.add-player-btn');
const startBtn = document.getElementById('start-btn');
const themeConfirmBtn = document.getElementById('theme-confirm-btn');
const backToSetupBtn = document.getElementById('back-to-setup-btn');
const confirmVoterBtn = document.getElementById('confirm-voter-btn');
const backToConfirmBtn = document.getElementById('back-to-confirm-btn');
const showResultBtn = document.getElementById('show-result-btn');
const playAgainBtn = document.getElementById('play-again-btn');
const startOverBtn = document.getElementById('start-over-btn');
const showAllVotesBtn = document.getElementById('show-all-votes-btn');
const backToResultsBtn = document.getElementById('back-to-results-btn');
const groupAInputs = document.getElementById('group-a-inputs');
const groupBInputs = document.getElementById('group-b-inputs');

// アプリのデータを保存する変数
let players = []; // {name: '名前', group: 'a'} のようなオブジェクトの配列
let votes = {};
let currentVoterIndex = 0;

// --- イベントリスナー（ボタンが押された時の処理） ---

// 「参加者を追加」ボタンの処理 (A, B両方に対応)
addPlayerBtns.forEach(button => {
    button.addEventListener('click', (e) => {
        const group = e.target.dataset.group;
        const targetContainer = group === 'a' ? groupAInputs : groupBInputs;
        const playerCount = targetContainer.getElementsByTagName('input').length;

        if (playerCount < 10) {
            const newInput = document.createElement('input');
            newInput.type = 'text';
            newInput.placeholder = `参加者${playerCount + 1}の名前`;
            targetContainer.appendChild(document.createElement('br'));
            targetContainer.appendChild(newInput);
        } else {
            alert(`グループ${group.toUpperCase()}の参加者は最大10名までです。`);
        }
    });
});

// 「登録完了」ボタンの処理
startBtn.addEventListener('click', () => {
    const groupAPlayers = Array.from(groupAInputs.getElementsByTagName('input'))
                               .map(input => input.value.trim())
                               .filter(name => name !== "")
                               .map(name => ({ name, group: 'a' })); // グループ情報を付与

    const groupBPlayers = Array.from(groupBInputs.getElementsByTagName('input'))
                               .map(input => input.value.trim())
                               .filter(name => name !== "")
                               .map(name => ({ name, group: 'b' })); // グループ情報を付与

    players = [...groupAPlayers, ...groupBPlayers];

    if (players.length < 4) {
        alert('参加者は合計4名以上で入力してください。');
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

showAllVotesBtn.addEventListener('click', () => {
    if (confirm('オーナー（司会者）の方のみご覧ください。\nよろしいですか？')) {
        resultScreen.classList.add('hidden');
        displayAllVotes();
        allVotesScreen.classList.remove('hidden');
    }
});

backToResultsBtn.addEventListener('click', () => {
    allVotesScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');
});


// --- アプリの主な機能に関する関数 ---

function showVoterConfirmation() {
    const currentVoter = players[currentVoterIndex];
    document.getElementById('confirm-voter-name').textContent = currentVoter.name;
    voterConfirmScreen.classList.remove('hidden');
}

function setupVoteScreen() {
    const currentVoter = players[currentVoterIndex];
    document.getElementById('voter-name').textContent = currentVoter.name;
    const choicesContainer = document.getElementById('choices');
    choicesContainer.innerHTML = ''; 
    players.forEach(player => {
        if (player.name !== currentVoter.name) {
            const choiceBtn = document.createElement('button');
            choiceBtn.textContent = player.name;
            choiceBtn.addEventListener('click', () => castVote(player.name));
            choicesContainer.appendChild(choiceBtn);
        }
    });
}

function castVote(votedPlayerName) {
    votes[players[currentVoterIndex].name] = votedPlayerName;
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
    allVotesScreen.classList.add('hidden');
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
        const player1Name = player1.name;
        const player2Name = votes[player1Name];
        if (votes[player2Name] === player1Name) {
            if (!checkedPlayers.includes(player1Name) && !checkedPlayers.includes(player2Name)) {
                couples.push([player1Name, player2Name]);
                checkedPlayers.push(player1Name, player2Name);
            }
        }
    });

    // 席順をグループ分けで固定
    players.forEach(player => {
        const playerBox = document.createElement('div');
        playerBox.classList.add('player-box');
        playerBox.id = `player-${player.name}`;
        playerBox.textContent = player.name;
        if (player.group === 'a') {
            sideLeft.appendChild(playerBox);
        } else {
            sideRight.appendChild(playerBox);
        }
    });

    if (couples.length > 0) {
        document.getElementById('no-couple-message').classList.add('hidden');
        setTimeout(() => drawConnections(couples), 100);
    } else {
        document.getElementById('no-couple-message').classList.remove('hidden');
    }
}

function displayAllVotes() {
    const listContainer = document.getElementById('all-votes-list');
    listContainer.innerHTML = '';
    for (const voter in votes) {
        const votedFor = votes[voter];
        const voteEntry = document.createElement('p');
        voteEntry.innerHTML = `<span class="voter-name">${voter}</span> 👉 <span class="voted-name">${votedFor}</span>`;
        listContainer.appendChild(voteEntry);
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
