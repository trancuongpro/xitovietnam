// botxito.js - AI BOT XÌ TỐ THÔNG MINH NÂNG CẤP THEO YÊU CẦU ANH TRẦN CƯỜNG
// Đã xử lý triệt để lỗi Bot cầm đôi nhỏ cố tình theo đôi to lộ thiên của Player

class BotXiTo {

    constructor(name) {

        this.name = name;

        this.cards = [];
    }

    // =====================================
    // CẬP NHẬT BÀI
    // =====================================
    capNhatBai(cards) {

        this.cards = [...cards];
    }

    // =====================================
    // PHÂN TÍCH BÀI GỐC CỦA ANH
    // =====================================
    phanTichBai() {

        const ranks =
            this.cards
            .map(c => c.rankValue)
            .sort((a,b)=>a-b);

        const suits =
            this.cards
            .map(c => c.suit);

        const counts = {};

        ranks.forEach(v => {

            counts[v] =
                (counts[v] || 0) + 1;
        });

        const pairCount =
            Object.values(counts)
            .filter(v => v >= 2)
            .length;

        const hasThree =
            Object.values(counts)
            .some(v => v >= 3);

        const hasFour =
            Object.values(counts)
            .some(v => v >= 4);

        // Tìm giá trị của đôi cao nhất (Nếu có đôi)
        let maxPairValue = 0;
        for (const rank in counts) {
            if (counts[rank] === 2) {
                maxPairValue = Math.max(maxPairValue, parseInt(rank));
            }
        }

        // =========================
        // KIỂM TRA SẢNH CHANCE
        // =========================
        let straightChance = false;
        const uniqueRanks = [...new Set(ranks)];
        if (uniqueRanks.length >= 3) {
            for (let i = 0; i <= uniqueRanks.length - 3; i++) {
                if (uniqueRanks[i+2] - uniqueRanks[i] <= 4) {
                    straightChance = true;
                    break;
                }
            }
        }

        // =========================
        // KIỂM TRA THÙNG CHANCE
        // =========================
        let flushChance = false;
        const suitCounts = {};
        suits.forEach(s => {
            suitCounts[s] = (suitCounts[s] || 0) + 1;
        });
        if (Object.values(suitCounts).some(c => c >= 3)) {
            flushChance = true;
        }

        return {
            pairCount,
            hasThree,
            hasFour,
            straightChance,
            flushChance,
            maxPairValue,
            highestRank: ranks[ranks.length - 1] || 0
        };
    }

    // =================================================================
    // HÀM QUAN SÁT BÀI NGỬA ĐỐI THỦ (QUÉT ĐÔI TO, SẢNH, THÙNG LỘ THIÊN)
    // =================================================================
    quetBaiNguaDoiThu(allCards, myId) {
        let moiDeDoaLonNhat = 0; 
        let doiNguaToNhatCuaDoiThu = 0;

        if (!allCards) return { moiDeDoaLonNhat, doiNguaToNhatCuaDoiThu };

        for (const id in allCards) {
            if (id === myId) continue; 

            const baiDoiThu = allCards[id] || [];
            if (baiDoiThu.length < 2) continue;

            // Chỉ lấy bài NGỬA (Bỏ lá úp đầu tiên ở index 0)
            const baiNgua = baiDoiThu.slice(1);
            
            const giaLapBot = new BotXiTo('GiaLap');
            giaLapBot.capNhatBai(baiNgua);
            const infoNgua = giaLapBot.phanTichBai();

            // Nhận diện Đôi ngửa của đối thủ (Ví dụ đôi 8 lộ thiên của anh)
            if (infoNgua.pairCount >= 1) {
                doiNguaToNhatCuaDoiThu = Math.max(doiNguaToNhatCuaDoiThu, infoNgua.maxPairValue);
                moiDeDoaLonNhat = Math.max(moiDeDoaLonNhat, 2); 
            }
            
            if (infoNgua.hasThree) {
                moiDeDoaLonNhat = Math.max(moiDeDoaLonNhat, 2);
            }
            
            // Nhận diện Sảnh/Thùng lộ thiên từ bài ngửa
            if (baiNgua.length >= 3 && (infoNgua.straightChance || infoNgua.flushChance)) {
                moiDeDoaLonNhat = Math.max(moiDeDoaLonNhat, 3); 
            }
        }
        return { moiDeDoaLonNhat, doiNguaToNhatCuaDoiThu };
    }

    // =================================================================
    // HÀM CHÍNH: XỬ LÝ THEO TIỀN HOẶC BỎ BÀI (ĐÃ SỬA ĐỔI THÔNG MINH)
    // =================================================================
    quyetDinhTheo(currentBet, money, currentRound) {
        const allCards = typeof gameState !== 'undefined' ? gameState.cards : null;
        let myId = 'botEast';
        
        if (allCards) {
            for (const id in allCards) {
                if (allCards[id] === this.cards) { myId = id; break; }
            }
        }

        const info = this.phanTichBai();
        const cardCount = this.cards.length;
        
        // Quét thông tin bài ngửa của đối thủ
        const { moiDeDoaLonNhat, doiNguaToNhatCuaDoiThu } = this.quetBaiNguaDoiThu(allCards, myId);

        // -------------------------------------------------------------
        // LUẬT ÉP BUỘC: KHÔNG BỎ BÀI Ở LÁ THỨ 2 VÀ THỨ 3 (TRỪ KHI ĐỐI THỦ QUÁ KHỦNG)
        // -------------------------------------------------------------
        if (cardCount <= 2) {
            return true; 
        }

        if (cardCount === 3) {
            if (moiDeDoaLonNhat === 3 && info.pairCount === 0 && !info.straightChance && !info.flushChance) {
                return false; 
            }
            return true; 
        }

        // -------------------------------------------------------------
        // XỬ LÝ LÁ THỨ 4 (1 ÚP + 3 MỞ) & THỨ 5: NÉ ĐÒN THÔNG MINH
        // -------------------------------------------------------------
        if (cardCount >= 4) {
            // TRƯỜNG HỢP NHƯ TRONG ẢNH: Đối thủ ngửa đôi to hơn đôi của mình (Ví dụ: Anh có Đôi 8, Bot có Đôi 5)
            if (info.pairCount >= 1 && doiNguaToNhatCuaDoiThu > info.maxPairValue) {
                console.log(`[AI - ${this.name}]: Phát hiện đối thủ ngửa đôi ${doiNguaToNhatCuaDoiThu} to hơn đôi ${info.maxPairValue} của mình. BỎ BÀI gấp!`);
                return false; // Úp bài ngay lập tức, không theo vô ích!
            }

            // Nếu đối thủ lộ Sảnh/Thùng (Cấp độ nguy hiểm 3) mà mình chỉ có đôi nhỏ hoặc bài rác
            if (moiDeDoaLonNhat === 3 && info.pairCount === 0 && !info.hasThree) {
                return false;
            }

            // Tiêu chuẩn theo bài thông thường của anh nếu bài an toàn hoặc mình có đôi to hơn
            if (info.pairCount >= 1 || info.straightChance || info.flushChance || info.hasThree || info.hasFour) {
                return true;
            }
            return false;
        }

        return true;
    }

    // =====================================
    // HÀM CHÍNH: TỐ TIỀN ĐẦU VÒNG
    // =====================================
    quyetDinhCuoc(money, minBet, maxBet, currentRound) {
        const info = this.phanTichBai();
        if (info.pairCount >= 1 || info.hasThree || info.straightChance || info.flushChance) {
            let mucCuoc = Math.floor((minBet + maxBet) / 2);
            mucCuoc = Math.floor(mucCuoc / 1000) * 1000;
            return Math.min(mucCuoc, money);
        }
        return Math.min(minBet, money);
    }
}

// =================================================================
// KHỞI TẠO ĐỒNG BỘ ĐỂ TRÁNH LỖI PHÁT SINH SANG SCRIPT.JS
// =================================================================
const bots = {
    'botWest': new BotXiTo('Bot Tây'),
    'botNorth': new BotXiTo('Bot Bắc'),
    'botEast': new BotXiTo('Bot Đông')
};