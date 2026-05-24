// stopgame.js - QUẢN LÝ DẤU STOP ĐỘC LẬP HOÀN TOÀN
(function () {
    // Lưu trữ trạng thái danh sách người chơi còn hoạt động ở lần kiểm tra trước
    let previousActivePlayers = ['player', 'botWest', 'botNorth', 'botEast'];
    let wasPlayingBefore = false;

    // Danh sách các ảnh thua có sẵn trong thư mục
    const loseImages = ['thua.png', 'thua2.png', 'thua3.png'];

    // Hàm lấy danh sách các ảnh chưa được sử dụng trên màn hình
    function getAvailableImage() {
        // Tìm tất cả các ảnh hiện đang hiển thị trên màn hình
        const currentImages = Array.from(document.querySelectorAll('.stop-game-overlay .thua-img'))
                                   .map(img => {
                                       // Lấy tên file ở cuối đường dẫn src
                                       const parts = img.src.split('/');
                                       return parts[parts.length - 1];
                                   });

        // Lọc ra những ảnh chưa xuất hiện
        const available = loseImages.filter(img => !currentImages.includes(img));

        // Nếu còn ảnh chưa dùng thì bốc ngẫu nhiên một ảnh trong số đó
        if (available.length > 0) {
            const randomIndex = Math.floor(Math.random() * available.length);
            return available[randomIndex];
        }

        // Trường hợp hiếm: Cả 3 ảnh đều đã dùng hết (ví dụ cả 4 người cùng thua), 
        // thì chọn đại ngẫu nhiên 1 trong 3 ảnh ban đầu để tránh bị lỗi hiển thị.
        return loseImages[Math.floor(Math.random() * loseImages.length)];
    }

    // Hàm thực hiện đóng dấu tròn chéo STOP lên khu vực người chơi
    function appendStopOverlay(playerId) {
        let el = null;
        if (playerId === 'player') el = document.querySelector('.player-main');
        else if (playerId === 'botWest') el = document.querySelector('.bot-west');
        else if (playerId === 'botNorth') el = document.querySelector('.bot-north');
        else if (playerId === 'botEast') el = document.querySelector('.bot-east');

        if (el) {
            // Nếu đã có dấu stop/thua rồi thì không tạo trùng nữa
            if (el.querySelector('.stop-game-overlay')) return;

            // Lấy một ảnh ngẫu nhiên chưa trùng với các vị trí thua trước đó
            const selectedImage = getAvailableImage();

            const stopDiv = document.createElement('div');
            stopDiv.className = 'stop-game-overlay';
            
            // Đổ ảnh đã được chọn ngẫu nhiên và không trùng lặp vào đây
            stopDiv.innerHTML = `<img src="${selectedImage}" alt="Thua" class="thua-img" />`;

            // Thiết lập style trực tiếp bằng JS, bảo đảm đè chuẩn toàn bộ khu vực avatar/bài
            stopDiv.style.position = 'absolute';
            stopDiv.style.top = '0';
            stopDiv.style.left = '0';
            stopDiv.style.width = '100%';
            stopDiv.style.height = '100%';
            stopDiv.style.display = 'flex';
            stopDiv.style.justifyContent = 'center';
            stopDiv.style.alignItems = 'center';
            stopDiv.style.background = 'transparent'; // Giữ nền trong suốt
            stopDiv.style.borderRadius = 'inherit';
            stopDiv.style.zIndex = '9999';
            stopDiv.style.pointerEvents = 'none'; // Không cản trở các click chuột nếu có

            // Định dạng và cân chỉnh ảnh cho vừa vặn với khung chứa người chơi
            const imgEl = stopDiv.querySelector('.thua-img');
            if (imgEl) {
                imgEl.style.width = '85%';      // Tự động chiếm 85% chiều rộng khu vực
                imgEl.style.height = '85%';     // Tự động chiếm 85% chiều cao khu vực
                imgEl.style.objectFit = 'contain'; // Giữ nguyên tỷ lệ ảnh, không bị móp méo hình khi co giãn
            }

            // Bảo đảm phần tử cha có thuộc tính position để cố định lớp phủ đè lên
            if (window.getComputedStyle(el).position === 'static') {
                el.style.position = 'relative';
            }

            el.appendChild(stopDiv);
        }
    }

    // Hàm xóa sạch tất cả các dấu STOP trên màn hình khi Reset / Vào ván mới
    function clearAllStopOverlays() {
        const overlays = document.querySelectorAll('.stop-game-overlay');
        overlays.forEach(overlay => {
            overlay.remove();
        });
    }

    // Vòng lặp ngầm tự động quét và kiểm tra sự thay đổi của gameState (mỗi 100ms)
    setInterval(() => {
        // Kiểm tra xem biến gameState của script.js đã sẵn sàng chưa
        if (typeof gameState === 'undefined' || !gameState) return;

        // 1. XỬ LÝ KHI RESET / BẮT ĐẦU VÁN MỚI
        // Nếu ván mới bắt đầu (isPlaying chuyển từ false -> true hoặc đang ở round 0 có đủ 4 người chơi)
        if (gameState.isPlaying && (!wasPlayingBefore || (gameState.currentRound === 0 && gameState.activePlayers.length === 4))) {
            clearAllStopOverlays();
            previousActivePlayers = [...gameState.players];
            wasPlayingBefore = true;
            return;
        }

        // Cập nhật lại trạng thái chơi để đón đầu khi reset game hẳn
        if (!gameState.isPlaying) {
            wasPlayingBefore = false;
            // Khi reset ván chơi, chủ động dọn dẹp sạch sẽ màn hình
            clearAllStopOverlays();
            return;
        }

        // 2. PHÁT HIỆN NGƯỜI CHƠI BỊ LOẠI (BỎ BÀI / HẾT GIỜ)
        // Duyệt qua danh sách người chơi trước đó, xem ai không còn nằm trong activePlayers hiện tại
        previousActivePlayers.forEach(playerId => {
            if (!gameState.activePlayers.includes(playerId)) {
                // Người này vừa bị bỏ bài hoặc hết giờ -> Thực hiện đóng dấu STOP liền
                appendStopOverlay(playerId);
            }
        });

        // Đồng bộ danh sách cũ để chuẩn bị cho chu kỳ quét tiếp theo
        previousActivePlayers = [...gameState.activePlayers];

    }, 100); // Tần suất quét 10 lần/giây, cực nhẹ và phản hồi ngay lập tức khi trạng thái thay đổi
})();