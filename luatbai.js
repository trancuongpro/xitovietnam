// luatbai.js - FULL XÌ TỐ / POKER AI SMART

class LuatBai {

    constructor() {

        this.thuTuRank = {
            '2': 2,
            '3': 3,
            '4': 4,
            '5': 5,
            '6': 6,
            '7': 7,
            '8': 8,
            '9': 9,
            '10': 10,
            'J': 11,
            'Q': 12,
            'K': 13,
            'A': 14
        };
    }

    layGiaTriRank(rank) {

        return this.thuTuRank[rank] || 0;
    }

    // =====================================
    // KIỂM TRA SẢNH THẬT
    // =====================================

    kiemTraSanh(ranks) {

        const unique =
            [...new Set(ranks)]
            .sort((a,b)=>a-b);

        if (unique.length < 5) {

            return false;
        }

        // A2345
        if (
            JSON.stringify(unique)
            === JSON.stringify([2,3,4,5,14])
        ) {

            return true;
        }

        for (let i = 1; i < unique.length; i++) {

            if (
                unique[i]
                !==
                unique[i - 1] + 1
            ) {

                return false;
            }
        }

        return true;
    }

    // =====================================
    // KIỂM TRA TIỀM NĂNG SẢNH
    // =====================================

    tinhDiemTiemNangSanh(cards) {

        const ranks =
            [...new Set(
                cards.map(c =>
                    this.layGiaTriRank(c.rank)
                )
            )]
            .sort((a,b)=>a-b);

        if (ranks.length < 4) {

            return 0;
        }

        let best = 0;

        // kiểm tra mọi nhóm 4 lá
        for (let i = 0; i < ranks.length; i++) {

            const temp = [...ranks];

            // thử thêm mọi lá
            for (let add = 2; add <= 14; add++) {

                if (!temp.includes(add)) {

                    const test =
                        [...temp, add]
                        .sort((a,b)=>a-b);

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

        const suitCount = {};

        cards.forEach(card => {

            suitCount[card.suit] =
                (suitCount[card.suit] || 0) + 1;
        });

        let best = 0;

        for (const suit in suitCount) {

            const count = suitCount[suit];

            // 4 lá cùng chất
            if (count === 4) {

                best = Math.max(best, 700);
            }

            // 3 lá cùng chất
            else if (count === 3) {

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

        score +=
            this.tinhDiemTiemNangSanh(cards);

        score +=
            this.tinhDiemTiemNangThung(cards);

        return score;
    }

    // =====================================
    // XẾP HẠNG BÀI
    // =====================================

    xepHangBai(cards) {

        if (!cards || cards.length === 0) {

            return {
                rank: 0,
                value: 0,
                name: 'Rỗng',
                potential: 0
            };
        }

        const ranks = cards
            .map(c =>
                this.layGiaTriRank(c.rank)
            )
            .sort((a,b)=>a-b);

        const suits =
            cards.map(c => c.suit);

        const rankCount = {};

        ranks.forEach(r => {

            rankCount[r] =
                (rankCount[r] || 0) + 1;
        });

        const counts =
            Object.values(rankCount);

        const isFlush =
            suits.every(
                s => s === suits[0]
            );

        const isStraight =
            this.kiemTraSanh(ranks);

        const potential =
            this.tinhDiemTiemNang(cards);

        // =====================
        // THÙNG PHÁ SẢNH
        // =====================

        if (
            isStraight &&
            isFlush
        ) {

            return {
                rank: 9,
                value: Math.max(...ranks),
                name: 'Thùng Phá Sảnh',
                potential
            };
        }

        // =====================
        // TỨ QUÝ
        // =====================

        if (counts.includes(4)) {

            return {
                rank: 8,
                value:
                    this.getFourValue(rankCount),
                name: 'Tứ Quý',
                potential
            };
        }

        // =====================
        // CÙ LŨ
        // =====================

        if (
            counts.includes(3)
            &&
            counts.includes(2)
        ) {

            return {
                rank: 7,
                value:
                    this.getTripleValue(rankCount),
                name: 'Cù Lũ',
                potential
            };
        }

        // =====================
        // THÙNG
        // =====================

        if (isFlush) {

            return {
                rank: 6,
                value: Math.max(...ranks),
                name: 'Thùng',
                potential
            };
        }

        // =====================
        // SẢNH
        // =====================

        if (isStraight) {

            return {
                rank: 5,
                value: Math.max(...ranks),
                name: 'Sảnh',
                potential
            };
        }

        // =====================
        // XÁM CÔ
        // =====================

        if (counts.includes(3)) {

            return {
                rank: 4,
                value:
                    this.getTripleValue(rankCount),
                name: 'Xám Cô',
                potential
            };
        }

        // =====================
        // HAI ĐÔI
        // =====================

        const pairCount =
            counts.filter(c => c === 2)
            .length;

        if (pairCount >= 2) {

            return {
                rank: 3,
                value:
                    this.getPairValue(rankCount),
                name: 'Hai Đôi',
                potential
            };
        }

        // =====================
        // MỘT ĐÔI
        // =====================

        if (pairCount === 1) {

            return {
                rank: 2,
                value:
                    this.getPairValue(rankCount),
                name: 'Một Đôi',
                potential
            };
        }

        // =====================
        // MẬU THẦU
        // =====================

        return {
            rank: 1,
            value: Math.max(...ranks),
            name: 'Mậu Thầu',
            potential
        };
    }

    // =====================================
    // VALUE
    // =====================================

    getFourValue(rankCount) {

        for (const rank in rankCount) {

            if (rankCount[rank] === 4) {

                return parseInt(rank);
            }
        }

        return 0;
    }

    getTripleValue(rankCount) {

        for (const rank in rankCount) {

            if (rankCount[rank] === 3) {

                return parseInt(rank);
            }
        }

        return 0;
    }

    getPairValue(rankCount) {

        let max = 0;

        for (const rank in rankCount) {

            if (rankCount[rank] >= 2) {

                max = Math.max(
                    max,
                    parseInt(rank)
                );
            }
        }

        return max;
    }

    // =====================================
// SO SÁNH BÀI THẬT
// =====================================

soSanh(hand1, hand2) {

    const rank1 =
        this.xepHangBai(hand1);

    const rank2 =
        this.xepHangBai(hand2);

    // =========================
    // SO LOẠI BÀI
    // =========================

    if (rank1.rank !== rank2.rank) {

        return rank1.rank - rank2.rank;
    }

    // =========================
    // SO GIÁ TRỊ CHÍNH
    // =========================

    if (rank1.value !== rank2.value) {

        return rank1.value - rank2.value;
    }

    // =========================
    // SO KICKER
    // =========================

    const sorted1 = hand1
        .map(c =>
            this.layGiaTriRank(c.rank)
        )
        .sort((a,b)=>b-a);

    const sorted2 = hand2
        .map(c =>
            this.layGiaTriRank(c.rank)
        )
        .sort((a,b)=>b-a);

    for (let i = 0; i < sorted1.length; i++) {

        if (sorted1[i] !== sorted2[i]) {

            return sorted1[i] - sorted2[i];
        }
    }

    return 0;
}

// =====================================
// SO BÀI MỞ XÌ TỐ
// CHỈ DÙNG ĐỂ XÁC ĐỊNH NGƯỜI CƯỢC
// =====================================

soSanhBaiMo(hand1, hand2) {

    const ranks1 = hand1
        .map(c => this.layGiaTriRank(c.rank))
        .sort((a,b)=>b-a);

    const ranks2 = hand2
        .map(c => this.layGiaTriRank(c.rank))
        .sort((a,b)=>b-a);

    // =========================
    // ĐẾM ĐÔI / SÁM
    // =========================

    const countRanks = (ranks) => {

        const obj = {};

        ranks.forEach(r => {

            obj[r] = (obj[r] || 0) + 1;

        });

        return obj;
    };

    const c1 = countRanks(ranks1);
    const c2 = countRanks(ranks2);

    const getPower = (counts) => {

        const values = Object.values(counts);

        // xám
        if (values.includes(3)) {

            const triple =
                parseInt(
                    Object.keys(counts)
                    .find(k => counts[k] === 3)
                );

            return {
                type: 3,
                value: triple
            };
        }

        // đôi
        if (values.includes(2)) {

            const pair =
                parseInt(
                    Object.keys(counts)
                    .find(k => counts[k] === 2)
                );

            return {
                type: 2,
                value: pair
            };
        }

        // mậu thầu
        return {
            type: 1,
            value: ranks1[0]
        };
    };

    const p1 = getPower(c1);
    const p2 = getPower(c2);

    // =========================
    // SO LOẠI BÀI
    // =========================

    if (p1.type !== p2.type) {

        return p1.type - p2.type;
    }

    // =========================
    // SO GIÁ TRỊ CHÍNH
    // =========================

    if (p1.value !== p2.value) {

        return p1.value - p2.value;
    }

    // =========================
    // SO KICKER
    // =========================

    for (let i = 0; i < ranks1.length; i++) {

        if (ranks1[i] !== ranks2[i]) {

            return ranks1[i] - ranks2[i];
        }
    }

    return 0;
}


    // =====================================
    // TÌM NGƯỜI THẮNG
    // =====================================

    timNguoiThang(hands) {

        let winner = 0;

        for (let i = 1; i < hands.length; i++) {

            const compare =
                this.soSanh(
                    hands[i],
                    hands[winner]
                );

            if (compare > 0) {

                winner = i;
            }
        }

        return winner;
    }
}

const luatBai = new LuatBai();