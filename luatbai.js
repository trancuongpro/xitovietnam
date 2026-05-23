// luatbai.js - FULL XÌ TỐ / POKER AI SMART (ĐÃ SỬA LỖI XÉT VÒNG 2)
// Thiết kế và tối ưu cho hệ thống của anh Trần Cường

class LuatBai {

    constructor() {
        this.thuTuRank = {
            '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
            'J': 11, 'Q': 12, 'K': 13, 'A': 14
        };
    }

    layGiaTriRank(rank) {
        return this.thuTuRank[rank] || 0;
    }

    // =====================================
    // KIỂM TRA SẢNH THẬT
    // =====================================
    kiemTraSanh(ranks) {
        if (!ranks || ranks.length < 5) return false;
        
        const unique = [...new Set(ranks)].sort((a,b)=>a-b);
        if (unique.length < 5) return false;

        // Trường hợp sảnh đặc biệt: A2345
        if (JSON.stringify(unique) === JSON.stringify([2,3,4,5,14])) {
            return true;
        }

        for (let i = 1; i < unique.length; i++) {
            if (unique[i] !== unique[i - 1] + 1) {
                return false;
            }
        }
        return true;
    }

    // =====================================
    // KIỂM TRA TIỀM NĂNG SẢNH
    // =====================================
    tinhDiemTiemNangSanh(cards) {
        if (!cards || cards.length < 3) return 0;
        const ranks = [...new Set(cards.map(c => this.layGiaTriRank(c.rank)))].sort((a,b)=>a-b);
        if (ranks.length < 4) return 0;

        let best = 0;
        for (let i = 0; i < ranks.length; i++) {
            const temp = [...ranks];
            for (let add = 2; add <= 14; add++) {
                if (!temp.includes(add)) {
                    const test = [...temp, add].sort((a,b)=>a-b);
                    if (this.kiemTraSanh(test)) {
                        best = Math.max(best, 800);
                    }
                }
            }
        }
        return best;
    }

    // =====================================
    // KIỂM TRA TIỀM NĂNG THÙNG
    // =====================================
    tinhDiemTiemNangThung(cards) {
        if (!cards || cards.length === 0) return 0;
        const suitCount = {};
        cards.forEach(card => {
            suitCount[card.suit] = (suitCount[card.suit] || 0) + 1;
        });

        let best = 0;
        for (const suit in suitCount) {
            const count = suitCount[suit];
            if (count === 4) {
                best = Math.max(best, 700);
            } else if (count === 3) {
                best = Math.max(best, 300);
            }
        }
        return best;
    }

    // =====================================
    // ĐIỂM TIỀM NĂNG
    // =====================================
    tinhDiemTiemNang(cards) {
        let score = 0;
        score += this.tinhDiemTiemNangSanh(cards);
        score += this.tinhDiemTiemNangThung(cards);
        return score;
    }

    // =====================================
    // XẾP HẠNG BÀI
    // =====================================
    xepHangBai(cards) {
        if (!cards || cards.length === 0) {
            return { rank: 0, value: 0, name: 'Rỗng', potential: 0 };
        }

        const ranks = cards.map(c => this.layGiaTriRank(c.rank)).sort((a,b)=>a-b);
        const suits = cards.map(c => c.suit);
        const rankCount = {};

        ranks.forEach(r => {
            rankCount[r] = (rankCount[r] || 0) + 1;
        });

        const counts = Object.values(rankCount);
        const isFlush = suits.length >= 5 && suits.every(s => s === suits[0]);
        const isStraight = this.kiemTraSanh(ranks);
        const potential = this.tinhDiemTiemNang(cards);

        // THÙNG PHÁ SẢNH
        if (isStraight && isFlush) {
            return { rank: 9, value: Math.max(...ranks), name: 'Thùng Phá Sảnh', potential };
        }
        // TỨ QUÝ
        if (counts.includes(4)) {
            return { rank: 8, value: this.getFourValue(rankCount), name: 'Tứ Quý', potential };
        }
        // CÙ LŨ
        if (counts.includes(3) && counts.includes(2)) {
            return { rank: 7, value: this.getTripleValue(rankCount), name: 'Cù Lũ', potential };
        }
        // THÙNG
        if (isFlush) {
            return { rank: 6, value: Math.max(...ranks), name: 'Thùng', potential };
        }
        // SẢNH
        if (isStraight) {
            return { rank: 5, value: Math.max(...ranks), name: 'Sảnh', potential };
        }
        // XÁM CÔ
        if (counts.includes(3)) {
            return { rank: 4, value: this.getTripleValue(rankCount), name: 'Xám Cô', potential };
        }
        // HAI ĐÔI
        const pairCount = counts.filter(c => c === 2).length;
        if (pairCount >= 2) {
            return { rank: 3, value: this.getPairValue(rankCount), name: 'Hai Đôi', potential };
        }
        // MỘT ĐÔI
        if (pairCount === 1) {
            return { rank: 2, value: this.getPairValue(rankCount), name: 'Một Đôi', potential };
        }
        // MẬU THẦU
        return { rank: 1, value: Math.max(...ranks), name: 'Mậu Thầu', potential };
    }

    getFourValue(rankCount) {
        for (const rank in rankCount) {
            if (rankCount[rank] === 4) return parseInt(rank);
        }
        return 0;
    }

    getTripleValue(rankCount) {
        for (const rank in rankCount) {
            if (rankCount[rank] === 3) return parseInt(rank);
        }
        return 0;
    }

    getPairValue(rankCount) {
        let max = 0;
        for (const rank in rankCount) {
            if (rankCount[rank] >= 2) {
                max = Math.max(max, parseInt(rank));
            }
        }
        return max;
    }

    // =====================================
    // SO SÁNH BÀI (Dùng cho AI và tổng kết)
    // =====================================
    soSanh(hand1, hand2) {
        const rank1 = this.xepHangBai(hand1);
        const rank2 = this.xepHangBai(hand2);

        // So sánh hạng bài trước (Tứ quý > Cù lũ > Thùng...)
        if (rank1.rank !== rank2.rank) {
            return rank1.rank - rank2.rank;
        }

        // So sánh giá trị cốt lõi bài (Đôi A > Đôi K...)
        if (rank1.value !== rank2.value) {
            return rank1.value - rank2.value;
        }

        // Kicker phụ từ cao xuống thấp
        const sorted1 = hand1.map(c => this.layGiaTriRank(c.rank)).sort((a,b)=>b-a);
        const sorted2 = hand2.map(c => this.layGiaTriRank(c.rank)).sort((a,b)=>b-a);

        for (let i = 0; i < Math.max(sorted1.length, sorted2.length); i++) {
            const v1 = sorted1[i] || 0;
            const v2 = sorted2[i] || 0;
            if (v1 !== v2) return v1 - v2;
        }
        return 0;
    }

    // =================================================================
    // HÀM ĐẶC BIỆT: XÉT QUYỀN CƯỢC VÒNG GIỮA (Lá 3, 4, 5) - CHỈ TÍNH BÀI NGỬA
    // =================================================================
    timNguoiDuocQuyenCuoc(allCards, activePlayers) {
        if (!activePlayers || activePlayers.length === 0) return 'player';
        
        let nguoiUuTien = activePlayers[0];
        let hạngNgửaLớnNhất = null;

        activePlayers.forEach(id => {
            const totalHand = allCards[id] || [];
            if (totalHand.length < 2) return; 

            // LUẬT XÌ PHÉ: Bỏ lá bài đầu tiên (Lá Úp ở index 0), chỉ lấy các lá bài Ngửa còn lại!
            const danhSachBaiNgua = totalHand.slice(1);

            // Chấm điểm thuần túy trên bài ngửa
            const ketQuaPhanTich = this.xepHangBai(danhSachBaiNgua);

            // Tiến hành so sánh bài ngửa thuần túy (Tuyệt đối KHÔNG cộng điểm tiềm năng potential gây lỗi lượt)
            if (!hạngNgửaLớnNhất) {
                hạngNgửaLớnNhất = ketQuaPhanTich;
                nguoiUuTien = id;
            } else {
                let check = 0;
                // 1. So hạng bài ngửa (Đôi > Mậu thầu)
                if (ketQuaPhanTich.rank !== hạngNgửaLớnNhất.rank) {
                    check = ketQuaPhanTich.rank - hạngNgửaLớnNhất.rank;
                } 
                // 2. So giá trị lá bài ngửa (Lá bài ngửa A > K)
                else if (ketQuaPhanTich.value !== hạngNgửaLớnNhất.value) {
                    check = ketQuaPhanTich.value - hạngNgửaLớnNhất.value;
                }
                // 3. So lá bài phụ nếu trùng nhau
                else {
                    const s1 = danhSachBaiNgua.map(c => this.layGiaTriRank(c.rank)).sort((a,b)=>b-a);
                    const s2 = danhSachBaiNgua.map(c => this.layGiaTriRank(c.rank)).sort((a,b)=>b-a); // So sánh tương quan
                    for (let i = 0; i < s1.length; i++) {
                        if (s1[i] !== s2[i]) { check = s1[i] - s2[i]; break; }
                    }
                }

                if (check > 0) {
                    hạngNgửaLớnNhất = ketQuaPhanTich;
                    nguoiUuTien = id;
                }
            }
        });

        return nguoiUuTien;
    }

    // =====================================
    // TÌM NGƯỜI THẮNG CUỐI VÁN (Tính trọn 5 lá)
    // =====================================
    timNguoiThang(hands) {
        let winner = 0;
        for (let i = 1; i < hands.length; i++) {
            const compare = this.soSanh(hands[i], hands[winner]);
            if (compare > 0) {
                winner = i;
            }
        }
        return winner;
    }
}

const luatBai = new LuatBai();