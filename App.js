const { WebcastPushConnection } = require('tiktok-live-connector');
const { keyboard, Key } = require('@nut-tree-fork/nut-js');
const path = require('path');
const fs = require('fs');

// Konfigurasi nut.js untuk mempercepat pengetikan
keyboard.config.autoDelayMs = 0;

// Ganti dengan username atau URL dari siaran langsung TikTok yang ingin Anda hubungkan
const tiktokUsername = 'zumeethriftstore';

// Path ke file config.cfg
const configPath = path.join('C:/Valve/Condition Zero/', 'czero/', 'config.cfg');

// Path ke file BotProfile.db
const botProfilePath = path.join('C:/Valve/Condition Zero/', 'czero/', 'BotProfile.db');

// Membuat koneksi ke siaran langsung TikTok
let tiktokLiveConnection = new WebcastPushConnection(tiktokUsername);

// Counter untuk taps
let tapCount = 0;

// Fungsi untuk memeriksa apakah username sudah ada di BotProfile.db
function isUsernameInBotProfile(username) {
    const botProfileContent = fs.readFileSync(botProfilePath, 'utf8');
    return botProfileContent.includes(`Easy ${username}`);
}

// Fungsi untuk menambahkan perintah ke file config.cfg
function updateConfigWithUsername(username) {
    const bindCommand = `bind "F1" "bot_add ${username}"`;

    // Membaca isi file config.cfg
    const configContent = fs.readFileSync(configPath, 'utf8');

    // Mengganti atau menambahkan baris dengan bind F1
    const updatedConfigContent = configContent.replace(/bind "F1" ".*"/, bindCommand);

    // Menyimpan kembali file config.cfg
    fs.writeFileSync(configPath, updatedConfigContent);
}

// Fungsi untuk menambahkan profil bot ke BotProfile.db
function addBotProfile(username) {
    const botProfile = `
Easy ${username}
    VoicePitch = 110
End
`;

    fs.appendFileSync(botProfilePath, botProfile);
}

// Event saat berhasil terhubung
tiktokLiveConnection.connect().then(state => {
    console.log(`Terhubung ke siaran langsung TikTok ${tiktokUsername}`);
}).catch(err => {
    console.error('Gagal terhubung ke siaran langsung:', err);
});

// Event untuk menerima likes/taps
tiktokLiveConnection.on('like', async (data) => {
    tapCount += data.likeCount;
    console.log(`Received ${data.likeCount} likes from ${data.uniqueId}. Total likes: ${tapCount}`);

    if (tapCount >= 15 && !isUsernameInBotProfile(data.uniqueId)) {
        // Tambahkan profil bot jika username belum ada
        addBotProfile(data.uniqueId);
        
        // Update config.cfg dengan username baru
        updateConfigWithUsername(data.uniqueId);

        // Menjalankan perintah F1 untuk menambahkan bot dengan username tersebut
        await keyboard.pressKey(Key.F1);
        await keyboard.releaseKey(Key.F1);

        tapCount = 0; // Reset counter setelah menambahkan bot
    }
});

// Event untuk menangani kesalahan
tiktokLiveConnection.on('error', err => {
    console.error('Error:', err);
});
