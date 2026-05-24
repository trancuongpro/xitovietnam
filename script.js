// script.js - FULL CODE ĐÃ SỬA (Fix bot cược hoài sau fold)
let boBai = new BoBai();
let gameState = {
    isPlaying: false,
    currentRound: 0,
    currentBetter: null,
    players: ['player', 'botWest', 'botNorth', 'botEast'],
    activePlayers: ['player', 'botWest', 'botNorth', 'botEast'],
    cards: { player: [], botWest: [], botNorth: [], botEast: [] },
    gameEnded: false,
    hasFolded: false,
    waitingForAction: false,  // THÊM: tránh gọi nhiều lần
    roundBetLimits: {
        0: { min: 1000, max: 5000,   step: 1000 },
        1: { min: 5000, max: 20000,  step: 5000 },
        2: { min: 10000, max: 50000, step: 10000 },
        3: { min: 20000, max: 200000,step: 20000 }
    }
};

const dealBtn = document.getElementById('dealBtn');
const minusBet = document.getElementById('minusBet');
const plusBet = document.getElementById('plusBet');
const betAmountSpan = document.getElementById('betAmount');
const confirmBetBtn = document.getElementById('confirmBetBtn');
const followBtn = document.getElementById('followBtn');
const foldBtn = document.getElementById('foldBtn');
const soundToggle = document.getElementById('soundToggle');
const guideBtn = document.getElementById('guideBtn');

let currentBetAmount = 1000;
let countdownInterval = null;
let isMusicPlaying = false;
let musicStarted = false;
const bgMusic = document.getElementById('bgMusic');

function init() {
    updateMoneyDisplay();
    createPotDisplay();
    dealBtn.addEventListener('click', startNewGame);
    minusBet.addEventListener('click', () => changeBet(-getCurrentStep()));
    plusBet.addEventListener('click', () => changeBet(getCurrentStep()));
    confirmBetBtn.addEventListener('click', confirmBet);
    followBtn.addEventListener('click', followBet);
    foldBtn.addEventListener('click', foldHand);
    soundToggle.addEventListener('click', toggleSound);
    guideBtn.addEventListener('click', showGuide);
    disableAllButtons();
    
    document.addEventListener('click',()=>{
        if(!musicStarted){
            bgMusic.play();
            isMusicPlaying = true;
            musicStarted = true;
            soundToggle.textContent = '🔊 Nhạc Nền';
        }
    },{once:true});
}

function createPotDisplay() {
    let potDiv = document.getElementById('potDisplay');
    if (!potDiv) {
        potDiv = document.createElement('div');
        potDiv.id = 'potDisplay';
        const container = document.querySelector('.game-container');
        container.appendChild(potDiv);
    }
}

function updatePotDisplay() {
    const potDiv = document.getElementById('potDisplay');
    if (potDiv) {
        potDiv.textContent = `Tiền Tổng: ${tienGame.tongCuoc.toLocaleString()} Phỉnh`;
        potDiv.style.display = 'block';
    }
}

function getCurrentStep() {
    return gameState.roundBetLimits[gameState.currentRound]?.step || 1000;
}

function changeBet(delta) {
    if (gameState.hasFolded || gameState.gameEnded) return;
    const limits = gameState.roundBetLimits[gameState.currentRound];
    if (!limits) return;
    let newBet = currentBetAmount + delta;
    if (newBet >= limits.min && newBet <= limits.max) {
        currentBetAmount = newBet;
        betAmountSpan.textContent = currentBetAmount.toLocaleString();
    }
}

// ============================
// LOGIC CƯỢC XÌ TỐ FIX FULL
// ============================

gameState.currentTurnIndex = 0;
gameState.playersNeedAction = [];

function confirmBet() {

    if (gameState.hasFolded || gameState.gameEnded) return;

    if (gameState.currentBetter !== 'player') return;

    const playerMoney = tienGame.layTien('player');

    if (currentBetAmount > playerMoney) {

        return thongBao.hienThongBao(
            "Không đủ tiền!",
            true
        );
    }

    clearCountdown();

    tienGame.truTien(
        'player',
        currentBetAmount
    );

    tienGame.congTongCuoc(
        currentBetAmount
    );

    tienGame.capNhatCuocHienTai(
        currentBetAmount
    );
	
	gameState.currentBetter = 'player';

    updateMoneyDisplay();
    updatePotDisplay();

    thongBao.hienThongBao(
    `Bạn cược ${currentBetAmount.toLocaleString()} Phỉnh`
);

// HIỆN DÒNG VÀNG CƯỢC
const dongCuoc =
    document.getElementById(
        'dongChuCuocDisplay'
    );

if (dongCuoc) {

    const tenVong =
        gameState.currentRound === 0
        ? 'Đầu'
        : gameState.currentRound === 1
        ? '3'
        : gameState.currentRound === 2
        ? '4'
        : 'Cuối';

    dongCuoc.textContent =
        `Vòng ${tenVong} Họ Cược : ${currentBetAmount.toLocaleString()} Phỉnh`;

    dongCuoc.style.display =
        'block';
}

    disableAllButtons();

    startFollowTurns();
}

function followBet() {

    if (gameState.hasFolded || gameState.gameEnded) return;

    const bet =
        tienGame.layCuocHienTai();

    if (
        bet >
        tienGame.layTien('player')
    ) {

        return thongBao.hienThongBao(
            "Không đủ tiền theo!",
            true
        );
    }

    clearCountdown();

    tienGame.truTien(
        'player',
        bet
    );

    tienGame.congTongCuoc(
        bet
    );

    updateMoneyDisplay();
    updatePotDisplay();

    thongBao.hienThongBao(
        `Bạn theo ${bet.toLocaleString()} Phỉnh`
    );

    disableAllButtons();

    gameState.currentTurnIndex++;

    nextFollowTurn();
}

async function foldHand() {

    if (
        gameState.hasFolded ||
        gameState.gameEnded
    ) {
        return;
    }

    clearCountdown();

    thongBao.hienThongBao(
        "Bạn đã bỏ bài",
        true
    );

    

    disableAllButtons();

    gameState.activePlayers =
        gameState.activePlayers.filter(
            p => p !== 'player'
        );

    if (
        gameState.activePlayers.length <= 1
    ) {

        endGameAndCompare();

        return;
    }

    gameState.currentTurnIndex++;

    nextFollowTurn();
}

function continueAfterBet() {

    // bỏ
}

function processBotFollows() {

    // bỏ
}

function startFollowTurns() {

    // THỨ TỰ THEO CHIỀU KIM ĐỒNG HỒ
    const tableOrder = [
        'player',
        'botWest',
        'botNorth',
        'botEast'
    ];

    gameState.playersNeedAction = [];

    // tìm vị trí người vừa cược
    const betterIndex =
        tableOrder.indexOf(
            gameState.currentBetter
        );

    thongBao.hienThongBao(
        `${getPlayerName(gameState.currentBetter)} đang là người cược`
    );

    // hỏi lần lượt theo chiều kim đồng hồ
    for (
        let i = 1;
        i < tableOrder.length;
        i++
    ) {

        const index =
            (betterIndex + i)
            % tableOrder.length;

        const targetPlayer =
            tableOrder[index];

        // chỉ hỏi người còn chơi
        if (
            gameState.activePlayers.includes(
                targetPlayer
            )
        ) {

            gameState.playersNeedAction.push(
                targetPlayer
            );
        }
    }

    gameState.currentTurnIndex = 0;

    nextFollowTurn();
}

function nextFollowTurn() {

    if (gameState.gameEnded) return;

    // ĐÃ HỎI XONG TẤT CẢ
    if (
        gameState.currentTurnIndex >=
        gameState.playersNeedAction.length
    ) {

        thongBao.hienThongBao(
            "Đã kết thúc vòng cược"
        );

        if (
    gameState.activePlayers.length <= 1
) {

    thongBao.hienThongBao(
        "Ồ Ai Cũng Bỏ Hết Vậy Ha Ha Ha Lụm Lúa Thôi Nè"
    );

    
        setTimeout(() => {

    endGameAndCompare();

}, 2000);

        return;
}

        // CHƯA TỚI LÁ THỨ 5
        if (gameState.currentRound < 3) {

            thongBao.hienThongBao(
                `Chuẩn bị chia lá ${
                    gameState.currentRound + 3
                }`
            );

            setTimeout(() => {

                dealNextRound();

            }, 1500);

        } else {

            thongBao.hienThongBao(
                "Tiến hành so bài tìm người thắng"
            );

            setTimeout(() => {

                endGameAndCompare();

            }, 2000);
        }

        return;
    }

    const playerId =
        gameState.playersNeedAction[
            gameState.currentTurnIndex
        ];

    // người đã bỏ bài
    if (
        !gameState.activePlayers.includes(
            playerId
        )
    ) {

        gameState.currentTurnIndex++;

        nextFollowTurn();

        return;
    }

    thongBao.hienThongBao(
        `Đến lượt ${getPlayerName(playerId)}`
    );

    // NGƯỜI CHƠI
    if (playerId === 'player') {

        thongBao.hienThongBao(
            "Bạn chọn Theo hoặc Bỏ"
        );
		
		highlightTurn('player');
        
		setTimeout(() => {

    enableFollowControls();

    startCountdown();

}, 2000);
    } else {

        // BOT
		highlightTurn(playerId);
        processSingleBotTurn(playerId);
    }
}

async function processSingleBotTurn(botId) {

    const currentBet =
        tienGame.layCuocHienTai();

    thongBao.hienThongBao(
        `${getBotName(botId)} Theo Hay Bỏ`
    );

    // CHỜ 5 GIÂY ĐỌC THÔNG BÁO
    await delay(3000);

    // BẮT ĐẦU 30 GIÂY SUY NGHĨ
    let remain = 30;

    thongBao.hienThongBao(
        `${getBotName(botId)} (${remain}s)`
    );

    const countdown = setInterval(() => {

        remain--;

        thongBao.hienThongBao(
            `${getBotName(botId)} (${remain}s)`
        );

    }, 3000);

    // BOT SUY NGHĨ
    await delay(
        1000 + Math.random() * 1000
    );

    clearInterval(countdown);

    // QUÁ 30S TỰ BỎ
    if (remain <= 0) {

        thongBao.hienThongBao(
            `${getBotName(botId)} Bỏ`
        );

        gameState.activePlayers =
            gameState.activePlayers.filter(
                p => p !== botId
            );

        gameState.currentTurnIndex++;

        nextFollowTurn();

        return;
    }

    const botAI = bots[botId];

    botAI.capNhatBai(
        gameState.cards[botId]
    );

    const money =
        tienGame.layTien(botId);

    const theo =
        botAI.quyetDinhTheo(
            currentBet,
            money,
            gameState.currentRound
        );

    if (
        theo &&
        money >= currentBet
    ) {

        tienGame.truTien(
            botId,
            currentBet
        );

        tienGame.congTongCuoc(
            currentBet
        );

        thongBao.hienThongBao(
            `${getBotName(botId)} Theo ${currentBet.toLocaleString()}`
        );

    } else {

        thongBao.hienThongBao(
            `${getBotName(botId)} Bỏ`
        );

        gameState.activePlayers =
            gameState.activePlayers.filter(
                p => p !== botId
            );
    }

    updateMoneyDisplay();
    updatePotDisplay();

    gameState.currentTurnIndex++;

    setTimeout(() => {

        nextFollowTurn();

    }, 3000);
}


function startNewGame() {
    if (gameState.isPlaying) return;
    gameState.isPlaying = true;
    gameState.gameEnded = false;
    gameState.hasFolded = false;
    gameState.waitingForAction = false;
    gameState.currentRound = 0;
    gameState.activePlayers = [...gameState.players];
    gameState.cards = { player: [], botWest: [], botNorth: [], botEast: [] };
    tienGame.resetTongCuoc();

    ['playerCards', 'westCards', 'northCards', 'eastCards'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'flex';
    });

    gameState.players.forEach(p => {
        tienGame.truTien(p, 1000);
        tienGame.congTongCuoc(1000);
    });

    dealBtn.disabled = true;
    updateMoneyDisplay();
    updatePotDisplay();
    dealInitialCards();
}

function delay(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function dealInitialCards() {
    gameState.cards.player = [];
    gameState.cards.botEast = [];
    gameState.cards.botNorth = [];
    gameState.cards.botWest = [];

    displayCards();

    const order = ['player', 'botEast', 'botNorth', 'botWest'];

    for(let round = 0; round < 2; round++){
        for(const player of order){
            await animateDealTo(player);
            gameState.cards[player].push(boBai.chiaBai());
            displayCards();
            await delay(120);
        }
    }

    setTimeout(determineFirstBetter, 1200);
}

async function animateDealTo(playerId){
    const table = document.querySelector('.table-area');
    const target = {
        player: document.querySelector('.player-main'),
        botEast: document.querySelector('.bot-east'),
        botNorth: document.querySelector('.bot-north'),
        botWest: document.querySelector('.bot-west')
    }[playerId];

    const tableRect = table.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const flying = document.createElement('div');

    flying.style.position = 'absolute';
    flying.style.width = '38px';
    flying.style.height = '54px';
    flying.style.backgroundImage = "url('labai.png')";
    flying.style.backgroundSize = 'cover';
    flying.style.backgroundPosition = 'center';
    flying.style.borderRadius = '6px';
    flying.style.left = (tableRect.width / 2 - 19) + 'px';
    flying.style.top = (tableRect.height / 2 - 27) + 'px';
    flying.style.zIndex = '99999';
    flying.style.pointerEvents = 'none';
    flying.style.transition = 'all .42s ease';
    table.appendChild(flying);

    await delay(20);
    flying.style.left = (targetRect.left - tableRect.left + targetRect.width/2 - 19) + 'px';
    flying.style.top = (targetRect.top - tableRect.top + targetRect.height/2 - 27) + 'px';
    flying.style.transform = 'rotate(360deg) scale(.9)';

    await delay(430);
    flying.remove();
}

function displayCards() {
    const posMap = { player: 'playerCards', botWest: 'westCards', botNorth: 'northCards', botEast: 'eastCards' };
    Object.keys(posMap).forEach(player => {
        const container = document.getElementById(posMap[player]);
        if (!container) return;
        container.innerHTML = '';

        gameState.cards[player].forEach((card, i) => {
            const div = document.createElement('div');
            div.className = 'card';
            if (i === 0 && player !== 'player' && !gameState.gameEnded) {
                div.classList.add('back-card');
            } else {
                const suitMap = { 
    'cơ':'♥', 
    'rô':'♦', 
    'chuồn':'♣', 
    'bích':'♠' 
};
                const suitSymbol = suitMap[card.suit] || '♠';
                div.innerHTML = `
    <div class="top-corner">${suitSymbol}</div>
    <div class="center-value">${card.rank}</div>
`;
                div.style.color = card.suit === 'cơ' || card.suit === 'rô' ? 'red' : 'black';
                div.style.fontSize = '22px';
                div.style.fontWeight = 'bold';
            }
            container.appendChild(div);
        });
    });
}

function determineFirstBetter() {
    if (gameState.hasFolded) return;
    
    let bestPlayer = 'player';
    let bestValue = -1;

    gameState.players.forEach(p => {
        const openCardValue = gameState.cards[p][1].rankValue;
        if (openCardValue > bestValue) {
            bestValue = openCardValue;
            bestPlayer = p;
        }
    });

    gameState.currentBetter = bestPlayer;

    if (bestPlayer === 'player') {

    thongBao.hienThongBao(
        "Bạn có bài mở lớn nhất! Hãy cược."
    );

    currentBetAmount = 1000;

    betAmountSpan.textContent = "1.000";

    enableBetControls();
	

    // Đợi 3 giây mới countdown
    setTimeout(() => {
        startCountdown();
    }, 1500);
	
} else {
        thongBao.hienThongBao(`${getBotName(bestPlayer)} có bài lớn nhất và đang cược...`);
        setTimeout(() => botPlaceBet(bestPlayer), 1500);
    }
}

function botPlaceBet(botId) {

    if (
        gameState.gameEnded ||
        gameState.hasFolded
    ) return;

    const botAI = bots[botId];

    botAI.capNhatBai(
        gameState.cards[botId]
    );

    const limits =
        gameState.roundBetLimits[
            gameState.currentRound
        ];

    const betAmount =
        botAI.quyetDinhCuoc(
            tienGame.layTien(botId),
            limits.min,
            limits.max,
            gameState.currentRound
        );

    if (
        betAmount > 0 &&
        tienGame.layTien(botId) >= betAmount
    ) {

        tienGame.truTien(
            botId,
            betAmount
        );

        tienGame.congTongCuoc(
            betAmount
        );

        tienGame.capNhatCuocHienTai(
            betAmount
        );

        updateMoneyDisplay();
        updatePotDisplay();

        thongBao.hienThongBao(
    `${getBotName(botId)} Cược ${betAmount.toLocaleString()}`
);

        // QUAN TRỌNG:
        // người cược hiện tại
        gameState.currentBetter = botId;

        // bắt đầu hỏi lần lượt
        startFollowTurns();

    } else {

        thongBao.hienThongBao(
            `${getBotName(botId)} bỏ bài`,
            true
        );

        gameState.activePlayers =
            gameState.activePlayers.filter(
                p => p !== botId
            );

        if (
            gameState.activePlayers.length <= 1
        ) {

            endGameAndCompare();

            return;
        }

        determineNextBetter();
    }
}
      
	  

function clearCountdown() {

    if (countdownInterval) {

        clearInterval(countdownInterval);

        countdownInterval = null;
    }
}

function startCountdown() {
    if (gameState.hasFolded || gameState.gameEnded) return;
    clearCountdown();
    let timeLeft = 30;
    countdownInterval = setInterval(() => {
        if (gameState.hasFolded || gameState.gameEnded) {
            clearCountdown();
            return;
        }
        timeLeft--;
        if (timeLeft <= 0) {
            clearCountdown();
            thongBao.hienThongBao("Hết thời gian! Bạn bỏ bài.", true);
            foldHand();
        } else {
            thongBao.hienThongBao(`Còn ${timeLeft} giây...`);
        }
    }, 2000);
}

async function dealNextRound() {

    gameState.currentRound++;

    if (gameState.currentRound >= 4) {

        endGameAndCompare();

        return;
    }

    thongBao.hienThongBao(
        `Bắt đầu chia lá ${
            gameState.currentRound + 2
        }`
    );

    // THỨ TỰ CHIỀU KIM ĐỒNG HỒ
    const tableOrder = [
        'player',
        'botWest',
        'botNorth',
        'botEast'
    ];

    // AI MẠNH NHẤT CHIA TRƯỚC
    const startIndex =
        tableOrder.indexOf(
            gameState.currentBetter
        );

    for (
        let i = 0;
        i < tableOrder.length;
        i++
    ) {

        const index =
            (startIndex + i)
            % tableOrder.length;

        const playerId =
            tableOrder[index];

        // bỏ qua người đã bỏ bài
        if (
            !gameState.activePlayers.includes(
                playerId
            )
        ) {
            continue;
        }

        const laBaiMoi =
    boBai.chiaBai();

gameState.cards[playerId].push(
    laBaiMoi
);

thongBao.hienThongBao(
    `Chia bài cho ${getPlayerName(playerId)}`
);

// GIỮ HIỆU ỨNG BAY BÀI
await animateDealTo(
    playerId,
    laBaiMoi
);

displayCards();

await delay(300);
    }

    thongBao.hienThongBao(
        "Đang xác định người mạnh nhất"
    );

    setTimeout(() => {

        determineNextBetter();

    }, 2000);
}

function determineNextBetter() {

    if (
        gameState.activePlayers.length <= 1
    ) {

        endGameAndCompare();

        return;
    }

    // chỉ lấy bài mở
    function layBaiMo(cards) {

        // lá đầu tiên úp
        return cards.slice(1);
    }

    let bestPlayer =
        gameState.activePlayers[0];

    let bestHand =
        layBaiMo(
            gameState.cards[bestPlayer]
        );

    gameState.activePlayers.forEach(playerId => {

        const openCards =
            layBaiMo(
                gameState.cards[playerId]
            );

        // DÙNG luatBai.js thật
        const compare =
            luatBai.soSanh(
                openCards,
                bestHand
            );

        if (compare > 0) {

            bestPlayer = playerId;

            bestHand = openCards;
        }
    });

    gameState.currentBetter =
        bestPlayer;

    thongBao.hienThongBao(
    `${getPlayerName(bestPlayer)} Bài Lớn`
);

    // PLAYER
    if (bestPlayer === 'player') {

        const limits =
            gameState.roundBetLimits[
                gameState.currentRound
            ];

        currentBetAmount =
            limits.min;

        betAmountSpan.textContent =
            currentBetAmount.toLocaleString();

        setTimeout(() => {

            thongBao.hienThongBao(
    "Bạn Được Cược"
);

setTimeout(() => {

    thongBao.hienThongBao(
        "Bạn Cược Bao Nhiêu?"
    );

}, 2000);

            enableBetControls();

startCountdown();

        }, 2000);

    } else {

        setTimeout(() => {

    thongBao.hienThongBao(
        `${getPlayerName(bestPlayer)} Được Cược`
    );

    setTimeout(() => {

        botPlaceBet(bestPlayer);

    }, 3000);

}, 3000);
    }
}



function endGameAndCompare() {
    if (gameState.gameEnded) return;
    
    const tienThang = tienGame.tongCuoc;
    gameState.gameEnded = true;
    clearCountdown();

    document.querySelectorAll('.back-card').forEach(card => {
        card.classList.remove('back-card');
    });

    displayCards();

    setTimeout(() => {
        if (gameState.activePlayers.length === 0) {
            resetGame();
            return;
        }

        const hands = gameState.activePlayers.map(p => gameState.cards[p]);
        const winnerIndex = luatBai.timNguoiThang(hands);
        const winner = gameState.activePlayers[winnerIndex];

        thongBao.hienThongBaoThang(getPlayerName(winner), tienThang);
        tienGame.traThuong(winner);

        updateMoneyDisplay();
        updatePotDisplay();

        setTimeout(resetGame, 10000);
    }, 1500);
}

function resetGame() {
    clearCountdown();
    gameState.isPlaying = false;
    gameState.gameEnded = false;
    gameState.hasFolded = false;
    gameState.waitingForAction = false;
    dealBtn.disabled = false;
    resetAllControls();
    ['playerCards','westCards','northCards','eastCards'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = '';
    });
    const potDiv = document.getElementById('potDisplay');
    if (potDiv) potDiv.style.display = 'none';
    thongBao.anThongBao();
}

function getBotName(id) {
    const names = {botWest:'Bot Tây', botNorth:'Bot Bắc', botEast:'Bot Đông'};
    return names[id] || id;
}



function getPlayerName(id) {
    return id === 'player' ? 'Bạn' : getBotName(id);
}

function delay(ms) {

    return new Promise(resolve =>
        setTimeout(resolve, ms)
    );
}


// DÁN NGAY DƯỚI ĐÂY
function highlightTurn(playerId) {

    clearAllHighlights();

    let el = null;

    // PLAYER
    if (playerId === 'player') {

        el = document.querySelector(
            '.player-main'
        );

    }

    // BOT TÂY
    else if (playerId === 'botWest') {

        el = document.querySelector(
            '.bot-west'
        );

    }

    // BOT BẮC
    else if (playerId === 'botNorth') {

        el = document.querySelector(
            '.bot-north'
        );

    }

    // BOT ĐÔNG
    else if (playerId === 'botEast') {

        el = document.querySelector(
            '.bot-east'
        );
    }

    if (el) {

        el.classList.add(
            'active-turn'
        );
    }
}

function clearAllHighlights() {

    const all = document.querySelectorAll(
        '.active-turn'
    );

    all.forEach(el => {

        el.classList.remove(
            'active-turn'
        );
    });
}

function setActionButtonsEnabled(enabled) {
    followBtn.disabled = !enabled;
    foldBtn.disabled = !enabled;
    confirmBetBtn.disabled = !enabled;
    minusBet.disabled = !enabled;
    plusBet.disabled = !enabled;
}

function updateMoneyDisplay() {
    const playerMoney = document.getElementById('playerMoney');
    const westMoney = document.getElementById('westMoney');
    const northMoney = document.getElementById('northMoney');
    const eastMoney = document.getElementById('eastMoney');
    const myMoneyDisplay = document.getElementById('myMoneyDisplay');
    
    if (playerMoney) playerMoney.textContent = tienGame.layTien('player').toLocaleString();
    if (westMoney) westMoney.textContent = tienGame.layTien('botWest').toLocaleString();
    if (northMoney) northMoney.textContent = tienGame.layTien('botNorth').toLocaleString();
    if (eastMoney) eastMoney.textContent = tienGame.layTien('botEast').toLocaleString();
    if (myMoneyDisplay) myMoneyDisplay.textContent = tienGame.layTien('player').toLocaleString();
}

function toggleSound() {
    if (isMusicPlaying) {
        bgMusic.pause();
        soundToggle.textContent = '🔇 Tắt Nhạc';
        isMusicPlaying = false;
    } else {
        bgMusic.play();
        soundToggle.textContent = '🔊 Nhạc Nền';
        isMusicPlaying = true;
        musicStarted = true;
    }
}

init();