// botxito.js - AI BOT XÌ TỐ THÔNG MINH

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

        // =========================
        // XÉT THÙNG
        // =========================
        const suitCount = {};

        suits.forEach(s => {

            suitCount[s] =
                (suitCount[s] || 0) + 1;
        });

        const flushChance =
            Object.values(suitCount)
            .some(v => v >= 3);

        // =========================
        // XÉT SẢNH
        // =========================
        let straightChance = false;

        for (let i = 0; i < ranks.length - 1; i++) {

            const diff =
                ranks[i + 1] - ranks[i];

            if (diff <= 2) {

                straightChance = true;
            }
        }

        // =========================
        // ĐIỂM SỨC MẠNH
        // =========================
        let strength = 0;

        // tứ quý
        if (hasFour) {

            strength += 100;
        }

        // xám cô
        if (hasThree) {

            strength += 60;
        }

        // 2 đôi
        if (pairCount >= 2) {

            strength += 45;
        }

        // 1 đôi
        if (pairCount === 1) {

            strength += 25;
        }

        // có khả năng sảnh
        if (straightChance) {

            strength += 18;
        }

        // có khả năng thùng
        if (flushChance) {

            strength += 15;
        }

        // lá lớn
        const highest =
            Math.max(...ranks);

        if (highest >= 11) {

            strength += 10;
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
    // QUYẾT ĐỊNH CƯỢC
    // =========================
    quyetDinhCuoc(
        money,
        minBet,
        maxBet,
        round
    ) {

        const info =
            this.phanTichBai();

        // =========================
        // BÀI CỰC MẠNH
        // =========================
        if (

            info.hasFour ||

            info.hasThree ||

            info.pairCount >= 2

        ) {

            return maxBet;
        }

        // =========================
        // KHÁ MẠNH
        // =========================
        if (

            info.pairCount === 1 &&

            info.straightChance

        ) {

            return Math.floor(
                maxBet * 0.8
            );
        }

        // =========================
        // CÓ TIỀM NĂNG
        // =========================
        if (

            info.straightChance ||

            info.flushChance ||

            info.highest >= 12

        ) {

            return Math.floor(
                maxBet * 0.5
            );
        }

        // =========================
        // BÀI YẾU
        // =========================
        return minBet;
    }

    // =========================
    // QUYẾT ĐỊNH THEO HAY BỎ
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

        // =========================
        // 2 LÁ ĐẦU:
        // KHÔNG BAO GIỜ BỎ
        // =========================
        if (cardCount <= 2) {

            return true;
        }

        // =========================
        // BÀI MẠNH
        // =========================
        if (

            info.hasFour ||

            info.hasThree ||

            info.pairCount >= 2

        ) {

            return true;
        }

        // =========================
        // CÓ TIỀM NĂNG
        // =========================
        if (

            info.pairCount >= 1 ||

            info.straightChance ||

            info.flushChance

        ) {

            return true;
        }

        // =========================
        // LÁ THỨ 3:
        // bài chết thì bỏ
        // ví dụ:
        // 2 6 J
        // =========================
        if (cardCount === 3) {

            return false;
        }

        // =========================
        // LÁ THỨ 4:
        // nếu còn hy vọng thì theo
        // =========================
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

        // =========================
        // LÁ CUỐI
        // =========================
        if (cardCount >= 5) {

            if (

                info.pairCount >= 1 ||

                info.hasThree

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