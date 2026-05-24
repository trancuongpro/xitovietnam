// cuocnhieu.js - FILE DUY NHẤT TỰ ĐỘNG CHÈN STYLE, GIAO DIỆN VÀ THEO DÕI VÒNG CƯỢC
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
                display: none; /* Mặc định ẩn, chỉ hiện khi có cược */
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
    // 2. LỚP QUẢN LÝ HIỂN THỊ TIỀN CƯỢC THEO VÒNG
    // ==========================================
    class BoPhanCuocNhieu {
        constructor() {
            this.displayDiv = null;
        }

        // Chuyển đổi chỉ số vòng (0, 1, 2, 3) sang tên gọi Tiếng Việt theo yêu cầu
        getTenVong(roundIndex) {
            switch (roundIndex) {
                case 0: return "Đầu";
                case 1: return "3";
                case 2: return "4";
                case 3: return "Cuối";
                default: return "Đầu";
            }
        }

        // Tạo phần tử HTML dưới dòng chữ "Xì Tố Việt Nam" nếu chưa có
        taoElementHienThi() {
            if (this.displayDiv) return this.displayDiv;

            this.displayDiv = document.getElementById('dongChuCuocDisplay');
            if (!this.displayDiv) {
                this.displayDiv = document.createElement('div');
                this.displayDiv.id = 'dongChuCuocDisplay';
                this.displayDiv.className = 'gold-bet-glow';
                
                // Tìm header chứa chữ "Xì Tố Việt Nam" để chèn vào ngay bên dưới
                const header = document.querySelector('.header');
                if (header) {
                    header.appendChild(this.displayDiv);
                }
            }
            return this.displayDiv;
        }

        // Ghi nhận và hiển thị chuỗi chữ tiền cược lên màn hình
        hienThiTienCuoc(roundIndex, soTien) {
            // Nếu ván đấu đã kết thúc hoặc chưa chơi thì không thông báo tiền cược
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

        // Ẩn dòng chữ thông báo tiền cược khi kết thúc ván bài hoặc reset ván mới
        anThongBao() {
            const el = document.getElementById('dongChuCuocDisplay');
            if (el) {
                el.style.display = 'none';
            }
        }
    }

    const troLyCuoc = new BoPhanCuocNhieu();

    // ==========================================
    // 3. CAN THIỆP VÀO SỰ KIỆN CỦA GAME (HOOKS)
    // ==========================================
    function kiemTraVaTichHop() {
        // A. Bắt sự kiện khi Người chơi bấm OK xác nhận cược thành công
        if (typeof window.confirmBet === 'function' && !window.confirmBet.isHooked) {
            const originalConfirmBet = window.confirmBet;
            window.confirmBet = function () {
                originalConfirmBet.apply(this, arguments);
                // Sau khi chạy hàm gốc thành công, lấy dữ liệu từ gameState để hiển thị
                if (typeof gameState !== 'undefined') {
                    troLyCuoc.hienThiTienCuoc(gameState.currentRound, currentBetAmount);
                }
            };
            window.confirmBet.isHooked = true;
        }

        // B. Bắt sự kiện khi Bot ra quyết định đặt cược đầu vòng thành công
        if (typeof window.botPlaceBet === 'function' && !window.botPlaceBet.isHooked) {
            const originalBotPlaceBet = window.botPlaceBet;
            window.botPlaceBet = function (botId) {
                originalBotPlaceBet.apply(this, arguments);
                // Sau khi Bot cược, trích xuất số tiền cược hiện tại của vòng để hiển thị
                if (typeof gameState !== 'undefined' && typeof tienGame !== 'undefined') {
                    const cuocHienTai = tienGame.layCuocHienTai();
                    if (cuocHienTai > 0) {
                        troLyCuoc.hienThiTienCuoc(gameState.currentRound, cuocHienTai);
                    }
                }
            };
            window.botPlaceBet.isHooked = true;
        }

        // C. Bắt sự kiện Kết thúc trận bài (So bài tìm người thắng) để ẩn chữ đi ngay lập tức
        if (typeof window.endGameAndCompare === 'function' && !window.endGameAndCompare.isHooked) {
            const originalEndGameAndCompare = window.endGameAndCompare;
            window.endGameAndCompare = function () {
                troLyCuoc.anThongBao(); // Ẩn thông báo tiền cược ngay khi hết trận
                originalEndGameAndCompare.apply(this, arguments);
            };
            window.endGameAndCompare.isHooked = true;
        }

        // D. Bắt sự kiện đặt lại game hoặc chuẩn bị ván mới để dọn sạch dòng chữ cũ
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

    // Tự động kiểm tra liên tục mỗi 300ms cho đến khi các file script của hệ thống tải xong hoàn toàn để gán logic vào
    const intervalHook = setInterval(() => {
        if (typeof gameState !== 'undefined' && typeof window.confirmBet === 'function') {
            kiemTraVaTichHop();
            clearInterval(intervalHook); // Gán thành công thì dừng vòng lặp kiểm tra
        }
    }, 300);
})();