// botxito.js - AI BOT XÌ TỐ THÔNG MINH NÂNG CẤP THEO YÊU CẦU ANH TRẦN CƯỜNG
// Đã xử lý triệt để lỗi Bot cầm đôi nhỏ cố tình theo đôi to lộ thiên của Player
// CẬP NHẬT 2026: Thêm logic phán đoán lá úp đối thủ ở lá thứ 5 (vòng cuối) để tối ưu né đòn

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
    // HÀM MỚI: TIÊN ĐOÁN LÁ ÚP VÀ TÍNH TỶ LỆ THẮNG Ở LÁ THỨ 5 (VÒNG CUỐI)
    // =================================================================
    tinhTyLeThangVongCuoi(allCards, myId) {
        if (!allCards || typeof boBai === 'undefined' || typeof luatBai === 'undefined') return 1.0;

        // 1. Thu thập toàn bộ các lá bài đã lộ diện để loại trừ khỏi bộ bài ngầm
        const cardKeysSeen = new Set();
        
        // Thêm bài của chính Bot này (bao gồm cả lá úp của chính nó)
        this.cards.forEach(c => cardKeysSeen.add(`${c.rank}-${c.suit}`));

        // Thêm tất cả bài NGỬA của các đối thủ đang còn chơi hoạt động
        const activeOpponents = [];
        for (const id in allCards) {
            if (id === myId) continue;
            // Chỉ xét những đối thủ thực sự còn chơi trong vòng này
            if (typeof gameState !== 'undefined' && gameState.activePlayers && !gameState.activePlayers.includes(id)) {
                continue;
            }
            
            const oppCards = allCards[id] || [];
            if (oppCards.length >= 2) {
                activeOpponents.push({ id: id, openCards: oppCards.slice(1) });
                // Đánh dấu các lá bài mở đã biết của đối thủ
                oppCards.slice(1).forEach(c => cardKeysSeen.add(`${c.rank}-${c.suit}`));
            }
        }

        if (activeOpponents.length === 0) return 1.0; // Không còn ai đấu lại thì tỷ lệ thắng 100%

        // 2. Khôi phục danh sách các lá bài còn lại có khả năng nằm trong lá úp của đối thủ
        const possibleHiddenCards = [];
        const suits = ['cơ', 'rô', 'chuồn', 'bích'];
        // Tạo lại danh sách 52 lá dựa theo cấu trúc bộ bài trong game
        const ranks = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
        const rankValues = {
            '2':2,'3':3,'4':4,'5':5,'6':6,'7':7,'8':8,'9':9,'10':10,
            'J':11,'Q':12,'K':13,'A':14
        };

        ranks.forEach(r => {
            suits.forEach(s => {
                const key = `${r}-${s}`;
                if (!cardKeysSeen.has(key)) {
                    possibleHiddenCards.push({
                        rank: r,
                        suit: s,
                        rankValue: rankValues[r]
                    });
                }
            });
        });

        if (possibleHiddenCards.length === 0) return 0.5;

        let totalSimulations = 0;
        let winCount = 0;

        // 3. Chạy giả lập toàn bộ các trường hợp lá bài úp khả thi của từng đối thủ
        // Với mỗi lá bài chưa xuất hiện, giả định nó là lá bài úp (index 0) của đối thủ
        possibleHiddenCards.forEach(simulatedCard => {
            let botWinsAll = true;

            for (let opp of activeOpponents) {
                // Tạo tổ hợp bài hoàn chỉnh 5 lá giả lập của đối thủ (1 lá giả lập + 4 lá mở)
                const simulatedOppHand = [simulatedCard, ...opp.openCards];
                
                // So sánh bài thật của Bot (đầy đủ 5 lá) với bài giả lập của đối thủ bằng bộ luật luatBai.js
                const compareResult = luatBai.soSanh(this.cards, simulatedOppHand);
                
                if (compareResult < 0) {
                    botWinsAll = false; // Có một trường hợp giả lập đối thủ thắng bài Bot
                    break;
                }
            }

            totalSimulations++;
            if (botWinsAll) {
                winCount++;
            }
        });

        // Trả về tỷ lệ thắng (từ 0.0 đến 1.0)
        return winCount / totalSimulations;
    }

    // =================================================================
    // HÀM CHÍNH: XỬ LÝ THEO TIỀN HOẶC BỎ BÀI 
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
        // XỬ LÝ KHI CẦM ĐỦ LÁ THỨ 5 (VÒNG CUỐI: 4 LÁ MỞ + 1 LÁ ÚP) - TIÊN ĐOÁN ĐỈNH CAO
        // -------------------------------------------------------------
        if (cardCount === 5) {
            // Tính toán tỷ lệ phần trăm cơ hội ăn tiền thực tế dựa trên phân tích lá bài giấu kín
            const tyLeThang = this.tinhTyLeThangVongCuoi(allCards, myId);
            console.log(`[AI TIÊN ĐOÁN - ${this.name}]: Tỷ lệ thắng phân tích vòng cuối là: ${(tyLeThang * 100).toFixed(1)}%`);

            // Nếu cơ hội thắng thấp hơn 35% ở vòng cuối cùng (bài quá nhỏ hoặc đối thủ có cửa thắng quá cao), 
            // Bot sẽ chủ động úp bài, tránh việc theo tiền vô ích làm thâm hụt ngân sách
            if (tyLeThang < 0.35) {
                console.log(`[AI - ${this.name}]: Tỷ lệ thắng quá thấp (${(tyLeThang * 100).toFixed(1)}%). Chủ động BỎ BÀI để tránh mất tiền oan! hihi.`);
                return false;
            }
        }

        // -------------------------------------------------------------
        // XỬ LÝ LÁ THỨ 4 (1 ÚP + 3 MỞ) & CÁC TRƯỜNG HỢP CƠ BẢN: NÉ ĐÒN THÔNG MINH
        // -------------------------------------------------------------
        if (cardCount >= 4) {
            // Trường hợp đối thủ ngửa đôi to hơn đôi của mình (Ví dụ: Anh có Đôi 8, Bot có Đôi 5)
            if (info.pairCount >= 1 && doiNguaToNhatCuaDoiThu > info.maxPairValue) {
                console.log(`[AI - ${this.name}]: Phát hiện đối thủ ngửa đôi ${doiNguaToNhatCuaDoiThu} to hơn đôi ${info.maxPairValue} của mình. BỎ BÀI gấp!`);
                return false; // Úp bài ngay lập tức, không theo vô ích!
            }

            // Nếu đối thủ lộ Sảnh/Thùng (Cấp độ nguy hiểm 3) mà mình chỉ có đôi nhỏ hoặc bài rác
            if (moiDeDoaLonNhat === 3 && info.pairCount === 0 && !info.hasThree) {
                return false;
            }

            // Tiêu chuẩn theo bài thông thường nếu bài an toàn hoặc mình có đôi to hơn
            if (info.pairCount >= 1 || info.straightChance || info.flushChance || info.hasThree || info.hasFour) {
                return true;
            }
            return false;
        }

        return true;
    }

    // =================================================================
    // HÀM CHÍNH: TỐ TIỀN ĐẦU VÒNG (NÂNG CẤP THEO GIỚI HẠN VÒNG MIN/MAX)
    // =================================================================
    quyetDinhCuoc(money, minBet, maxBet, currentRound) {
        const allCards = typeof gameState !== 'undefined' ? gameState.cards : null;
        let myId = 'botEast';
        
        if (allCards) {
            for (const id in allCards) {
                if (allCards[id] === this.cards) { myId = id; break; }
            }
        }

        const info = this.phanTichBai();
        const cardCount = this.cards.length;
        const { doiNguaToNhatCuaDoiThu } = this.quetBaiNguaDoiThu(allCards, myId);

        // Trường hợp đặc biệt 1: Nếu đang ở vòng cuối (lá thứ 5), chạy giả lập nâng cao để định đoạt
        if (cardCount === 5) {
            const tyLeThang = this.tinhTyLeThangVongCuoi(allCards, myId);
            
            // Nếu bài siêu lớn, cơ hội thắng trên 70%, quất luôn số tiền max của vòng đó
            if (tyLeThang >= 0.70) {
                console.log(`[AI CƯỢC - ${this.name}]: Bài vòng cuối cực mạnh (${(tyLeThang*100).toFixed(1)}%). CƯỢC MAX: ${maxBet}`);
                return Math.min(maxBet, money);
            }
            // Nếu bài ở mức trung bình, tỉ lệ ăn hên xui nhưng vẫn có cơ hội
            if (tyLeThang >= 0.45 && tyLeThang < 0.70) {
                let mucCuocTrungBinh = Math.floor((minBet + maxBet) / 2);
                mucCuocTrungBinh = Math.floor(mucCuocTrungBinh / 1000) * 1000;
                console.log(`[AI CƯỢC - ${this.name}]: Bài trung bình khá, cược mức giữa: ${mucCuocTrungBinh}`);
                return Math.min(mucCuocTrungBinh, money);
            }
            
            // Còn lại nếu bài nhỏ hoặc tỷ lệ dưới 45%, đặt mức cược min thấp nhất quy định để thăm dò
            console.log(`[AI CƯỢC - ${this.name}]: Bài yếu hoặc chưa chắc chắn ăn, đặt tiền MIN: ${minBet}`);
            return Math.min(minBet, money);
        }

        // Trường hợp đặc biệt 2: Bài ĐÃ LỚN RỒI (Có ba lá, tứ quý hoặc có đôi to vượt trội hơn bài ngửa đối phương)
        const bàiĐãLớn = info.hasFour || info.hasThree || (info.pairCount >= 1 && info.maxPairValue > doiNguaToNhatCuaDoiThu);
        if (bàiĐãLớn) {
            console.log(`[AI CƯỢC - ${this.name}]: Bài đã lớn/Đôi to vượt bài ngửa đối thủ. ĐẶT TIỀN MAX VÒNG: ${maxBet}`);
            return Math.min(maxBet, money);
        }

        // Trường hợp đặc biệt 3: Bài ĐANG CHỜ CƠ HỘI (Có sảnh chance, thùng chance nhưng chưa thành sảnh/thùng)
        const bàiChờCơHội = info.straightChance || info.flushChance;
        if (bàiChờCơHội) {
            console.log(`[AI CƯỢC - ${this.name}]: Bài đang chờ sảnh/thùng cơ hội. ĐẶT TIỀN THẤP NHẤT (MIN VÒNG): ${minBet}`);
            return Math.min(minBet, money);
        }

        // Các trường hợp mặc định còn lại (Có đôi nhỏ hoặc bài rác vừa phải): Cược min quy định vòng
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