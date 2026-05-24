// cuocnhieu.js - CHỈ GHI NHẬN TIỀN NGƯỜI PHÁT ĐỘNG CƯỢC ĐẦU MỖI VÒNG, HẾT TRẬN TẮT CHỮ
(function () {
    // ==========================================
    // 1. TỰ ĐỘNG CHÈN STYLE CHỚP VÀNG GOLD 24K VÀO TRANG
    // ==========================================
    const styleId = 'style-cuoc-nhieu-gold';
    if (!document.getElementById(styleId)) {
        const styleEl = document.createElement('style');
        styleEl.id = styleId;
        styleEl.innerHTML = `
            .gold-bet-glow {
                color: #FFD700; /* Vàng Gold 24k */
                font-family: 'Arial', sans-serif;
                font-size: 18px;
                font-weight: bold;
                text-align: center;
                margin-top: 8px;
                text-shadow: 0 0 6px rgba(255, 215, 0, 0.6), 0 0 12px rgba(255, 140, 0, 0.4);
                animation: lightBlink 2.5s infinite ease-in-out;
                display: none; /* Mặc định ẩn */
                width: 100%;
            }
            @keyframes lightBlink {
                0%, 100% { opacity: 1; text-shadow: 0 0 6px rgba(255, 215, 0, 0.6); }
                50% { opacity: 0.75; text-shadow: 0 0 3px rgba(255, 215, 0, 0.3); }
            }
        `;
        document.head.appendChild(styleEl);
    }

    // ==========================================
    // 2. LỚP QUẢN LÝ HIỂN THỊ TIỀN CƯỢC THEO YÊU CẦU
    // ==========================================
    class BoPhanCuocNhieu {
        constructor() {
            this.displayDiv = null;
        }

        // Chuyển đổi chỉ số vòng (0 -> Đầu, 1 -> 3, 2 -> 4, 3 -> Cuối)
        getTenVong(roundIndex) {
            switch (roundIndex) {
                case 0: return "Đầu";
                case 1: return "3";
                case 2: return "4";
                case 3: return "Cuối";
                default: return "Đầu";
            }
        }

        // Tạo phần tử hiển thị nằm ngay dưới dòng "Xì Tố Việt Nam"
        taoElementHienThi() {
            if (this.displayDiv) return this.displayDiv;

            this.displayDiv = document.getElementById('dongChuCuocDisplay');
            if (!this.displayDiv) {
                this.displayDiv = document.createElement('div');
                this.displayDiv.id = 'dongChuCuocDisplay';
                this.displayDiv.className = 'gold-bet-glow';
                
                // Tìm header chứa chữ "Xì Tố Việt Nam" để chèn vào ngay dưới
                const header = document.querySelector('.header');
                if (header) {
                    header.appendChild(this.displayDiv);
                }
            }
            return this.displayDiv;
        }

        // Ghi nhận và hiển thị chính xác số tiền cược đầu tiên của vòng
        hienThiTienCuoc(roundIndex, soTien) {
            // Nếu game kết thúc hoặc chưa chơi thì dẹp thông báo luôn
            if (typeof gameState !== 'undefined' && (gameState.gameEnded || !gameState.isPlaying)) {
                this.anThongBao();
                return;
            }

            const el = this.taoElementHienThi();
            if (el) {
                const tenVongText = this.getTenVong(roundIndex);
                el.textContent = `Vòng ${tenVongText} Họ Cược : ${soTien.toLocaleString()} Phỉnh`;
                el.style.display = 'block';
            }
        }

        // Ẩn dòng chữ thông báo tiền cược
        anThongBao() {
            const el = document.getElementById('dongChuCuocDisplay');
            if (el) {
                el.style.display = 'none';
            }
        }
    }

    const troLyCuoc = new BoPhanCuocNhieu();

    // ==========================================
    // 3. CAN THIỆP VÀO LOGIC CƯỢC ĐẦU VÒNG (HOOKS)
    // ==========================================
    function kiemTraVaTichHop() {
        
        // A. Trường hợp NGƯỜI CHƠI lớn nhất và bấm OK để ra tiền cược phát động vòng
        if (typeof window.confirmBet === 'function' && !window.confirmBet.isHooked) {
            const originalConfirmBet = window.confirmBet;
            window.confirmBet = function () {
                originalConfirmBet.apply(this, arguments);
                if (typeof gameState !== 'undefined' && typeof currentBetAmount !== 'undefined') {
                    // Hiển thị ngay số tiền người chơi vừa chọn cược đầu vòng
                    troLyCuoc.hienThiTienCuoc(gameState.currentRound, currentBetAmount);
                }
            };
            window.confirmBet.isHooked = true;
        }

        // B. Trường hợp một BOT bất kỳ lớn nhất vòng đứng ra phát động tiền cược
        if (typeof window.botPlaceBet === 'function' && !window.botPlaceBet.isHooked) {
            const originalBotPlaceBet = window.botPlaceBet;
            window.botPlaceBet = function (botId) {
                originalBotPlaceBet.apply(this, arguments);
                if (typeof gameState !== 'undefined' && typeof tienGame !== 'undefined') {
                    // Lấy số tiền cược hiện tại mà Bot vừa áp đặt cho vòng chơi này để hiển thị
                    setTimeout(() => {
                        const cuocHienTai = tienGame.layCuocHienTai();
                        if (cuocHienTai > 0) {
                            troLyCuoc.hienThiTienCuoc(gameState.currentRound, cuocHienTai);
                        }
                    }, 50); // Chờ một chút nhỏ để bảo đảm hàm gốc cập nhật xong tiền vào hệ thống
                }
            };
            window.botPlaceBet.isHooked = true;
        }

        // C. Hết trận bài (Xác định người thắng hoặc so bài): Tắt ngay chữ, dọn đợi ván mới
        if (typeof window.endGameAndCompare === 'function' && !window.endGameAndCompare.isHooked) {
            const originalEndGameAndCompare = window.endGameAndCompare;
            window.endGameAndCompare = function () {
                troLyCuoc.anThongBao(); // Kết thúc ván tắt ngay chữ đợi trận mới
                originalEndGameAndCompare.apply(this, arguments);
            };
            window.endGameAndCompare.isHooked = true;
        }

        // D. Các hàm reset chuẩn bị hoặc bắt đầu ván mới: Đảm bảo xóa sạch thông báo cũ
        if (typeof window.resetGame === 'function' && !window.resetGame.isHooked) {
            const originalResetGame = window.resetGame;
            window.resetGame = function () {
                troLyCuoc.anThongBao();
                originalResetGame.apply(this, arguments);
            };
            window.resetGame.isHooked = true;
        }
        
        if (typeof window.startNewGame === 'function' && !window.startNewGame.isHooked) {
            const originalStartNewGame = window.startNewGame;
            window.startNewGame = function () {
                troLyCuoc.anThongBao();
                originalStartNewGame.apply(this, arguments);
            };
            window.startNewGame.isHooked = true;
        }
    }

    // Vòng lặp kiểm tra load file core game để kích hoạt liên kết hooks
    const intervalHook = setInterval(() => {
        if (typeof gameState !== 'undefined' && typeof window.confirmBet === 'function' && typeof window.botPlaceBet === 'function') {
            kiemTraVaTichHop();
            clearInterval(intervalHook);
        }
    }, 200);
})();