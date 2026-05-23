// Quản lý tiền và lưu vào localStorage
class TienGame {
    constructor() {
        this.tien = {
            player: 1000000,
            botWest: 1000000,
            botNorth: 1000000,
            botEast: 1000000
        };
        this.tongCuoc = 0;
        this.cuocHienTai = 0;
        this.loadTuStorage();
    }
    
    loadTuStorage() {
        const saved = localStorage.getItem('xiphe_tien');
        if (saved) {
            const parsed = JSON.parse(saved);
            this.tien = { ...this.tien, ...parsed };
        }
    }
    
    luuStorage() {
        localStorage.setItem('xiphe_tien', JSON.stringify(this.tien));
    }
    
    layTien(nguoi) {
        return this.tien[nguoi];
    }
    
    truTien(nguoi, soTien) {

    if (this.tien[nguoi] >= soTien) {

        this.tien[nguoi] -= soTien;

        this.luuStorage();

        this.kiemTraTien(nguoi);

        return true;
    }

    return false;
}
    
    congTien(nguoi, soTien) {

    this.tien[nguoi] += soTien;

    this.luuStorage();

    this.kiemTraTien(nguoi);
}
    
    datCuoc(nguoi, soTien) {
        if (this.truTien(nguoi, soTien)) {
            this.tongCuoc += soTien;
            return true;
        }
        return false;
    }
    
    congTongCuoc(soTien) {
        this.tongCuoc += soTien;
    }
    
    resetTongCuoc() {
        this.tongCuoc = 0;
    }
    
    traThuong(nguoiThang) {
        this.congTien(nguoiThang, this.tongCuoc);
        const tienThang = this.tongCuoc;
        this.resetTongCuoc();
        return tienThang;
    }
    
    capNhatCuocHienTai(soTien) {
        this.cuocHienTai = soTien;
    }
    
    layCuocHienTai() {
        return this.cuocHienTai;
    }
}


// ===============================
// KIỂM TRA HẾT TIỀN / ĐẠI GIA
// ===============================

TienGame.prototype.kiemTraTien = function(nguoi) {

    // =========================
    // HẾT TIỀN
    // =========================
    if (this.tien[nguoi] <= 50000) {

        // PLAYER
        if (nguoi === 'player') {

            setTimeout(() => {

                showMoneyPopup(
                    "Vì Bạn Chơi Mạnh Tay Nên Hệ Thống Hoàn Lại Phỉnh Cho Bạn Chơi Vui Nha !...",
                    "OK",
                    () => {

                        this.tien.player = 1000000;

                        this.luuStorage();

                        updateMoneyDisplay();

                        thongBao.hienThongBao(
                            "Đã hoàn lại 1.000.000 Phỉnh"
                        );
                    }
                );

            }, 500);

        }

        // BOT
        else {

            this.tien[nguoi] = 1000000;

            this.luuStorage();

            console.log(
                `${nguoi} được hoàn lại 1.000.000`
            );
        }
    }

    // =========================
    // THÀNH ĐẠI GIA
    // =========================
    if (this.tien[nguoi] >= 100000000) {

        setTimeout(() => {

            showMoneyPopup(
                "Bây Giờ Bạn Là Đại Gia Khu Vực Này Rồi . Xin Mời Sang Bàn Lớn Hơn Chúng Ta Tái Đấu",
                "Dĩ Nhiên",
                () => {

                    // RESET TOÀN BỘ
                    this.tien = {
                        player: 1000000,
                        botWest: 1000000,
                        botNorth: 1000000,
                        botEast: 1000000
                    };

                    this.tongCuoc = 0;

                    this.cuocHienTai = 0;

                    this.luuStorage();

                    updateMoneyDisplay();

                    location.reload();
                }
            );

        }, 500);
    }
};

// ===============================
// POPUP ĐỎ
// ===============================

function showMoneyPopup(text, buttonText, callback) {

    const old =
        document.getElementById(
            'money-popup'
        );

    if (old) old.remove();

    const popup =
        document.createElement('div');

    popup.id = 'money-popup';

    popup.innerHTML = `
        <div class="money-popup-box">
            <div class="money-popup-text">
                ${text}
            </div>

            <button id="money-popup-btn">
                ${buttonText}
            </button>
        </div>
    `;

    document.body.appendChild(
        popup
    );

    document
        .getElementById(
            'money-popup-btn'
        )
        .onclick = () => {

            popup.remove();

            if (callback)
                callback();
        };
}

// ===============================
// CSS POPUP
// ===============================

const popupStyle =
document.createElement('style');

popupStyle.innerHTML = `

#money-popup{
    position:fixed;
    inset:0;
    background:rgba(0,0,0,.75);
    display:flex;
    align-items:center;
    justify-content:center;
    z-index:999999;
}

.money-popup-box{
    width:420px;
    max-width:90%;
    background:#a40000;
    border:4px solid #ff4444;
    border-radius:18px;
    padding:30px;
    text-align:center;
    box-shadow:0 0 30px red;
    animation:popupShow .35s ease;
}

.money-popup-text{
    color:white;
    font-size:24px;
    font-weight:bold;
    line-height:1.5;
    margin-bottom:25px;
}

#money-popup-btn{
    background:white;
    color:#a40000;
    border:none;
    padding:12px 30px;
    border-radius:12px;
    font-size:22px;
    font-weight:bold;
    cursor:pointer;
}

#money-popup-btn:hover{
    transform:scale(1.05);
}

@keyframes popupShow{
    from{
        transform:scale(.7);
        opacity:0;
    }
    to{
        transform:scale(1);
        opacity:1;
    }
}
`;

document.head.appendChild(
    popupStyle
);


const tienGame = new TienGame();