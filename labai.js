// 52 lá bài theo tiêu chuẩn quốc tế
const SUITS = ['cơ', 'rô', 'chuồn', 'bích'];
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

class BoBai {
    constructor() {
        this.bai = [];
        this.khoiTao();
    }
    
    khoiTao() {
        this.bai = [];
        for (let suit of SUITS) {
            for (let rank of RANKS) {
                this.bai.push({
                    rank: rank,
                    suit: suit,
                    rankValue: this.getRankValue(rank)
                });
            }
        }
        this.tronBai();
    }
    
    getRankValue(rank) {
        const values = {
            '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
            'J': 11, 'Q': 12, 'K': 13, 'A': 14
        };
        return values[rank];
    }
    
    tronBai() {
        for (let i = this.bai.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.bai[i], this.bai[j]] = [this.bai[j], this.bai[i]];
        }
    }
    
    chiaBai() {
        if (this.bai.length === 0) this.khoiTao();
        return this.bai.pop();
    }
    
    layHinhAnh(card) {
        // Trả về text representation của lá bài
        let suitSymbol = '';
        switch(card.suit) {
            case 'cơ': suitSymbol = '♥'; break;
            case 'rô': suitSymbol = '♦'; break;
            case 'chuồn': suitSymbol = '♣'; break;
            case 'bích': suitSymbol = '♠'; break;
        }
        let color = (card.suit === 'cơ' || card.suit === 'rô') ? 'red' : 'black';
        return { text: card.rank + suitSymbol, color: color };
    }
}

// Hàm so sánh bài (gọi từ luatbai.js)
function soSanhBai(bai1, bai2) {
    return bai1.rankValue - bai2.rankValue;
}