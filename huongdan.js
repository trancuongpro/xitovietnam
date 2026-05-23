// Nội dung hướng dẫn
const huongDan = `
<div style="color: #ffd700; font-size: 24px; font-weight: bold; margin-bottom: 20px; text-align: center;">
    🎴 HƯỚNG DẪN CHƠI XÌ PHÉ 🎴
</div>

<div style="line-height: 1.8;">
    <p><strong style="color: #ffd700;">1. Luật chơi cơ bản:</strong></p>
	<p>- Mới Chơi Nhấn Chia Bài để chơi, chú ý có chớp tới lượt rõ ràng , vui lòng nhìn bảng cụ thể để thao tác các nút</p>
	<p>- Nhìn Lượt Chớp Vàng Nếu Bài Lớn Được Cược Nút + - OK  , nút Theo hay Bỏ dành cho người được hỏi để theo hay bỏ bài.</p>
    <p>- Người chơi có 20 giây để Cược hoặc Theo hoặc Bỏ.</p>
	<p>- Mỗi người chơi được chia 2 lá bài (1 úp, 1 mở).</p>
    <p>- Mỗi ván bắt buộc cược 1000 Phỉnh tiền gốc.</p>
    <p>- Có 5 lá bài được chia theo từng vòng.</p>
    
    <p><strong style="color: #ffd700;">2. Thứ tự bài từ nhỏ đến lớn:</strong></p>
    <p>- Bài lẻ → 1 Đôi → 2 Đôi → Xám Cô (3 lá giống) → Sảnh → Thùng → Cù Lũ → Thùng Phá Sảnh</p>
    
    <p><strong style="color: #ffd700;">3. Cách cược:</strong></p>
    <p>- Vòng 1: Cược 1000 - 5000 Phỉnh</p>
    <p>- Vòng 2: Cược 5000 - 20000 Phỉnh</p>
    <p>- Vòng 3: Cược 10000 - 50000 Phỉnh</p>
    <p>- Vòng 4: Cược 20000 - 200000 Phỉnh</p>
    
    <p><strong style="color: #ffd700;">4. Quyền cược:</strong></p>
    <p>- Người có bài lớn nhất được quyền cược trước.</p>    
    
    <p><strong style="color: #ffd700;">5. Chiến thắng:</strong></p>
    <p>- Người có bài mạnh nhất thắng toàn bộ tiền cược trong bàn.</p>
    <p>- Tiền được tự động cộng vào tài khoản và lưu lại.</p>
	<p>- Yên tâm vui chơi không lo hết tiền vì đã có hệ thống luôn tặng bạn tiền khi hết nhé.</p>
	<p>- Trần Cường - Zalo: 0907860662</p>
    
    <p><strong style="color: #ffd700;">🎲 Chúc bạn may mắn và có những giây phút vui vẻ! 🎲</strong></p>
</div>
`;

function showGuide() {
    const modal = document.getElementById('guideModal');
    const content = document.getElementById('guideContent');
    content.innerHTML = huongDan;
    modal.style.display = 'flex';
}

function closeGuide() {
    const modal = document.getElementById('guideModal');
    modal.style.display = 'none';
}
