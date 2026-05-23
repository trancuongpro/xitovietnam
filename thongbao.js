// Quản lý thông báo - ĐÃ SỬA HOÀN CHỈNH
class ThongBao {
    constructor() {
        this.notificationDiv = document.getElementById('notification');
        this.countdownInterval = null;
    }
    
    hienThongBao(message, isError = false) {
        if (!this.notificationDiv) return;
        
        this.notificationDiv.innerHTML = message;
        this.notificationDiv.style.display = 'block';
        this.notificationDiv.style.background = isError ? 
            'linear-gradient(135deg, #ff4444 0%, #cc0000 100%)' : 
            'linear-gradient(135deg, #00ced1 0%, #008080 100%)';
        this.notificationDiv.style.color = 'white';
        this.notificationDiv.style.fontSize = '18px';
        this.notificationDiv.style.border = 'none';
        
        // Chỉ tự động ẩn nếu KHÔNG phải thông báo đếm ngược
        // KHÔNG tự ẩn nếu đang hiện bảng thắng
if (
    !message.includes('giây') &&
    !message.includes('Thắng')
) {

    setTimeout(() => {

        // chỉ ẩn nếu không phải popup thắng
        if (
            !this.notificationDiv.innerHTML.includes(
                'Ván mới sau'
            )
        ) {

            this.anThongBao();
        }

    }, 10000);
}
    }
    
    hienThongBaoThang(nguoiThang, soTien) {
        if (!this.notificationDiv) return;
        
        let countdown = 15;

this.notificationDiv.innerHTML =
`
<div style="
font-size:22px;
font-weight:bold;
margin-bottom:12px;
">
🎉 ${nguoiThang} Thắng ${soTien.toLocaleString()} Phỉnh 🎉
</div>

<div style="
font-size:18px;
color:#8b0000;
">
Ván mới sau ${countdown}s
</div>
`;

const winCountdown =
setInterval(() => {

    countdown--;

    this.notificationDiv.innerHTML =
    `
    🎉 ${nguoiThang} Thắng ${soTien.toLocaleString()} Phỉnh 🎉
    <br>
    Ván mới sau ${countdown}s
    `;

    if (countdown <= 0) {

        clearInterval(
            winCountdown
        );
    }

}, 1000);
        this.notificationDiv.style.display = 'block';
        this.notificationDiv.style.background = 'linear-gradient(135deg, #ffd700 0%, #ffaa00 100%)';
        this.notificationDiv.style.color = '#8b0000';
        this.notificationDiv.style.fontSize = '20px';
        this.notificationDiv.style.border = '2px solid #ff6600';
        this.notificationDiv.style.top = '78%';
        this.notificationDiv.style.left = '50%';
        this.notificationDiv.style.transform =
        'translate(-50%, -50%)';

        this.notificationDiv.style.maxWidth = '85%';

        this.notificationDiv.style.padding =
        '14px 20px';

        this.notificationDiv.style.borderRadius =
        '18px';
        setTimeout(() => {
            this.anThongBao();
        }, 15000);
    }
    
    hienThongBaoDo(message, callback) {
        if (!this.notificationDiv) return;
        
        // Xóa nội dung cũ
        this.anThongBao();
        
        this.notificationDiv.style.background = "linear-gradient(135deg, #ff0000 0%, #8b0000 100%)";
        this.notificationDiv.style.border = "3px solid #ffd700";
        this.notificationDiv.style.color = "white";
        this.notificationDiv.style.fontSize = "16px";
        this.notificationDiv.style.fontWeight = "bold";
        this.notificationDiv.style.padding = "15px 20px";
        this.notificationDiv.style.borderRadius = "16px";
        this.notificationDiv.style.textAlign = "center";
        this.notificationDiv.style.maxWidth = "85%";
        this.notificationDiv.style.left = "50%";
        this.notificationDiv.style.top = "50%";
        this.notificationDiv.style.transform = "translate(-50%, -50%)";
        this.notificationDiv.innerHTML = message;
        this.notificationDiv.style.display = "block";
        
        // Thêm nút OK
        const okBtn = document.createElement('button');
        okBtn.textContent = "✅ OK ✅";
        okBtn.style.marginTop = "15px";
        okBtn.style.marginLeft = "auto";
        okBtn.style.marginRight = "auto";
        okBtn.style.display = "block";
        okBtn.style.padding = "8px 20px";
        okBtn.style.borderRadius = "25px";
        okBtn.style.border = "none";
        okBtn.style.background = "#ffd700";
        okBtn.style.color = "#8b0000";
        okBtn.style.fontWeight = "bold";
        okBtn.style.fontSize = "14px";
        okBtn.style.cursor = "pointer";
        okBtn.style.boxShadow = "0 2px 5px rgba(0,0,0,0.3)";
        
        this.notificationDiv.appendChild(okBtn);
        
        const self = this;
        okBtn.onclick = function() {
            self.anThongBao();
            if (callback) callback();
        };
        
        // Tự động ẩn sau 5 giây nếu không bấm
        setTimeout(() => {
            if (self.notificationDiv.style.display === "block") {
                self.anThongBao();
                if (callback) callback();
            }
        }, 15000);
    }
    
    hienXacNhan(message, callback) {
        const confirmResult = confirm(message);
        if (callback) callback(confirmResult);
        return confirmResult;
    }
    
    anThongBao() {
        if (this.notificationDiv) {
            this.notificationDiv.style.display = 'none';
            this.notificationDiv.innerHTML = ''; // Xóa nội dung
            this.notificationDiv.style.color = 'white';
            this.notificationDiv.style.fontSize = '18px';
            this.notificationDiv.style.background = '';
            this.notificationDiv.style.border = '';
            this.notificationDiv.style.padding = '';
        }
    }
}

const thongBao = new ThongBao();