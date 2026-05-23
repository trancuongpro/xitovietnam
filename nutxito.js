// nutxito.js

console.log("Khởi Chạy Game XÌ TỐ OK");

function disableAllButtons() {

    minusBet.disabled = true;
    plusBet.disabled = true;
    confirmBetBtn.disabled = true;

    followBtn.disabled = true;
    foldBtn.disabled = true;
}

function enableBetControls() {

    minusBet.disabled = false;
    plusBet.disabled = false;
    confirmBetBtn.disabled = false;

    followBtn.disabled = true;
    foldBtn.disabled = true;
}

function enableFollowControls() {

    minusBet.disabled = true;
    plusBet.disabled = true;
    confirmBetBtn.disabled = true;

    followBtn.disabled = false;
    foldBtn.disabled = false;
}

function resetAllControls() {

    disableAllButtons();

    currentBetAmount = 1000;

    if (betAmountSpan) {

        betAmountSpan.textContent =
            currentBetAmount.toLocaleString();
    }
}