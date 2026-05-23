// anti.js - Chặn chuột phải, copy và preload tài nguyên

// ==================== CHẶN CHUỘT PHẢI ====================
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    return false;
});

// ==================== CHẶN COPY ====================
document.addEventListener('copy', function(e) {
    e.preventDefault();
    return false;
});

document.addEventListener('cut', function(e) {
    e.preventDefault();
    return false;
});

document.addEventListener('paste', function(e) {
    e.preventDefault();
    return false;
});

// ==================== CHẶN PHÍM TẮT ====================
document.addEventListener('keydown', function(e) {
        // Chặn Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
    if (e.ctrlKey && (e.key === 'u' || e.key === 'U' || e.key === 'i' || e.key === 'I' || e.key === 'j' || e.key === 'J')) {
        e.preventDefault();
        return false;
    }
    // Chặn Ctrl+S
    if (e.ctrlKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        return false;
    }
    // Chặn Ctrl+C, Ctrl+X, Ctrl+V (đã chặn copy/cut/paste)
    if (e.ctrlKey && (e.key === 'c' || e.key === 'C' || e.key === 'x' || e.key === 'X' || e.key === 'v' || e.key === 'V')) {
        e.preventDefault();
        return false;
    }
});

// ==================== PRELOAD HÌNH ẢNH ====================
function preloadImages() {
    const images = [
        'labai.png',
        'banxito.png',
        'xito.png'
    ];
    
    images.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// ==================== PRELOAD ÂM THANH ====================
function preloadAudio() {
    const audio = document.getElementById('bgMusic');
    if (audio) {
        audio.load();
    }
}

// ==================== KHỞI TẠO BẢO VỆ ====================
function initAnti() {
    preloadImages();
    preloadAudio();
    console.log('🛡️ Anti-cheat đã được kích hoạt!');
}

// Chạy khi trang load
initAnti();