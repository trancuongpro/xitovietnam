// botxito.js - AI XÌ TỐ THÔNG MINH NHƯ POKER THẬT

class BotXiTo {

    constructor(name) {

        this.name = name;

        this.cards = [];
    }

    // =========================
    // CẬP NHẬT BÀI
    // =========================

    capNhatBai(cards) {

        this.cards = [...cards];
    }

    // =========================
    // ĐẾM RANK
    // =========================

    demRank(ranks) {

        const counts = {};

        ranks.forEach(v => {

            counts[v] =
                (counts[v] || 0) + 1;
        });

        return counts;
    }

    // =========================
    // KIỂM TRA SẢNH TIỀM NĂNG
    // =========================

    kiemTraSanhTiemNang(ranks) {

        const unique =
            [...new Set(ranks)]
            .sort((a,b)=>a-b);

        let consecutive = 1;

        for (let i = 1; i < unique.length; i++) {

            const diff =
                unique[i] -
                unique[i - 1];

            // liền nhau
            if (diff === 1) {

                consecutive++;

                if (consecutive >= 3) {

                    return true;
                }
            }

            // cách 1 lá
            else if (diff === 2) {

                consecutive++;

                if (consecutive >= 4) {

                    return true;
                }
            }

            else {

                consecutive = 1;
            }
        }

        return false;
    }

    // =========================
    // KIỂM TRA THÙNG TIỀM NĂNG
    // =========================

    kiemTraThungTiemNang(suits) {

        const suitCount = {};

        suits.forEach(s => {

            suitCount[s] =
                (suitCount[s] || 0) + 1;
        });

        return Object
            .values(suitCount)
            .some(v => v >= 3);
    }

    // =========================
    // PHÂN TÍCH BÀI
    // =========================

    phanTichBai() {

        const ranks =
            this.cards
            .map(c => c.rankValue)
            .sort((a,b)=>a-b);

        const suits =
            this.cards
            .map(c => c.suit);

        const counts =
            this.demRank(ranks);

        const values =
            Object.values(counts);

        const pairCount =
            values.filter(v => v >= 2)
            .length;

        const hasThree =
            values.some(v => v >= 3);

        const hasFour =
            values.some(v => v >= 4);

        const straightChance =
            this.kiemTraSanhTiemNang(ranks);

        const flushChance =
            this.kiemTraThungTiemNang(suits);

        const highest =
            Math.max(...ranks);

        // =========================
        // ĐIỂM AI
        // =========================

        let strength = 0;

        // tứ quý
        if (hasFour) {

            strength += 100;
        }

        // xám cô
        else if (hasThree) {

            strength += 75;
        }

        // 2 đôi
        else if (pairCount >= 2) {

            strength += 55;
        }

        // 1 đôi
        else if (pairCount === 1) {

            strength += 30;
        }

        // tiềm năng sảnh
        if (straightChance) {

            strength += 18;
        }

        // tiềm năng thùng
        if (flushChance) {

            strength += 15;
        }

        // lá lớn
        if (highest >= 12) {

            strength += 8;
        }

        return {

            pairCount,
            hasThree,
            hasFour,
            straightChance,
            flushChance,
            strength,
            highest
        };
    }

    // =========================
    // AI CƯỢC
    // =========================

    quyetDinhCuoc(
        money,
        minBet,
        maxBet,
        round
    ) {

        const info =
            this.phanTichBai();

        // =====================
        // BÀI SIÊU MẠNH
        // =====================

        if (

            info.hasFour ||

            info.hasThree

        ) {

            return maxBet;
        }

        // =====================
        // HAI ĐÔI
        // =====================

        if (info.pairCount >= 2) {

            return Math.floor(
                maxBet * 0.85
            );
        }

        // =====================
        // ĐÔI + TIỀM NĂNG
        // =====================

        if (

            info.pairCount === 1 &&

            (
                info.straightChance ||
                info.flushChance
            )

        ) {

            return Math.floor(
                maxBet * 0.75
            );
        }

        // =====================
        // ĐÔI THƯỜNG
        // =====================

        if (info.pairCount === 1) {

            return Math.floor(
                maxBet * 0.55
            );
        }

        // =====================
        // BÀI TIỀM NĂNG
        // =====================

        if (

            info.straightChance ||

            info.flushChance

        ) {

            return Math.floor(
                maxBet * 0.45
            );
        }

        // =====================
        // CHỈ CÓ BÀI LỚN
        // =====================

        if (info.highest >= 13) {

            return Math.floor(
                maxBet * 0.3
            );
        }

        // =====================
        // RÁC
        // =====================

        return minBet;
    }

    // =========================
    // AI THEO / BỎ
    // =========================

    quyetDinhTheo(
        currentBet,
        money,
        round
    ) {

        const info =
            this.phanTichBai();

        const cardCount =
            this.cards.length;

        // =====================
        // 2 LÁ ĐẦU
        // =====================

        if (cardCount <= 2) {

            return true;
        }

        // =====================
        // TỨ QUÝ / XÁM
        // =====================

        if (

            info.hasFour ||

            info.hasThree

        ) {

            return true;
        }

        // =====================
        // HAI ĐÔI
        // =====================

        if (info.pairCount >= 2) {

            return true;
        }

        // =====================
        // ĐÔI + TIỀM NĂNG
        // =====================

        if (

            info.pairCount === 1 &&

            (
                info.straightChance ||

                info.flushChance
            )

        ) {

            return true;
        }

        // =====================
        // 4 LÁ:
        // chỉ theo nếu còn cửa
        // =====================

        if (cardCount === 4) {

            if (

                info.pairCount >= 1 ||

                info.straightChance ||

                info.flushChance

            ) {

                return true;
            }

            return false;
        }

        // =====================
        // 5 LÁ:
        // bài rác bỏ luôn
        // =====================

        if (cardCount >= 5) {

            // có đôi mới theo
            if (info.pairCount >= 1) {

                return true;
            }

            // có khả năng thùng/sảnh
            if (

                info.straightChance ||

                info.flushChance

            ) {

                return true;
            }

            return false;
        }

        // =====================
        // 3 LÁ
        // =====================

        if (cardCount === 3) {

            // có tiềm năng
            if (

                info.pairCount >= 1 ||

                info.straightChance ||

                info.flushChance ||

                info.highest >= 13

            ) {

                return true;
            }

            return false;
        }

        return true;
    }
}

// =========================
// KHỞI TẠO BOT
// =========================

const bots = {

    botWest:
        new BotXiTo('Bot Tây'),

    botNorth:
        new BotXiTo('Bot Bắc'),

    botEast:
        new BotXiTo('Bot Đông')
};