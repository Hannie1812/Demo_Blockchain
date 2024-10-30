document.addEventListener("DOMContentLoaded", function () {
    let peers = ['A', 'B', 'C'];

    peers.forEach(peer => {
        for (let i = 1; i <= 5; i++) {
            let blockId = `block${peer}${i}`;
            let blockElement = `
                <h3>Block ${i}</h3>
                <label>Block Number:</label>
                <input type="text" id="blockNumber${blockId}" value="${i}" readonly>
                <label>Nonce:</label>
                <input type="number" id="nonce${blockId}" value="0" oninput="updateHash('${blockId}', '${peer}', ${i})">
                <label>Data:</label>
                <textarea id="data${blockId}" placeholder="Nhập dữ liệu của block tại đây..." oninput="updateHash('${blockId}', '${peer}', ${i})"></textarea>
                <label>Previous Hash:</label>
                <input type="text" id="previousHash${blockId}" value="${i === 1 ? '00000000000000000000000000000000000000000000000000000000000000' : ''}" readonly>
                <label>Hash:</label>
                <input type="text" id="hash${blockId}" readonly>
                <button id="mineButton${blockId}" onclick="mineBlock('${blockId}', '${peer}', ${i})">Mine</button>
            `;
            document.getElementById(`block${peer}${i}`).innerHTML = blockElement;
        }
    });

    // Tự động mine tất cả các block khi tải trang để chúng hợp lệ
    peers.forEach(peer => {
        for (let i = 1; i <= 5; i++) {
            mineBlock(`block${peer}${i}`, peer, i);
        }
    });
});

function updateHash(blockId, peer, blockNumber) {
    let nonce = document.getElementById(`nonce${blockId}`).value;
    let data = document.getElementById(`data${blockId}`).value;
    let prevHash = document.getElementById(`previousHash${blockId}`).value;

    let hash = CryptoJS.SHA256(nonce + data + prevHash).toString();
    document.getElementById(`hash${blockId}`).value = hash;

    // Cập nhật tính hợp lệ và tính toán lại toàn bộ chuỗi sau block hiện tại
    checkChainValidity(peer, blockNumber);
}

function mineBlock(blockId, peer, blockNumber) {
    let nonceElement = document.getElementById(`nonce${blockId}`);
    let hashElement = document.getElementById(`hash${blockId}`);
    let prevHashElement = document.getElementById(`previousHash${blockId}`);

    let nonce = 0;
    let prevHash = prevHashElement.value;
    let data = document.getElementById(`data${blockId}`).value;
    let hash = CryptoJS.SHA256(nonce + data + prevHash).toString();

    while (!hash.startsWith('0000')) {
        nonce++;
        hash = CryptoJS.SHA256(nonce + data + prevHash).toString();
    }

    nonceElement.value = nonce;
    hashElement.value = hash;

    if (blockNumber < 5) {
        let nextBlockId = `block${peer}${blockNumber + 1}`;
        document.getElementById(`previousHash${nextBlockId}`).value = hash;
    }

    // Kiểm tra và cập nhật tính hợp lệ của toàn bộ chuỗi
    checkChainValidity(peer, blockNumber);
}

function checkChainValidity(peer, startBlockNumber) {
    let isValid = true;

    for (let i = startBlockNumber; i <= 5; i++) {
        let blockId = `block${peer}${i}`;
        let nonce = document.getElementById(`nonce${blockId}`).value;
        let data = document.getElementById(`data${blockId}`).value;
        let prevHash = document.getElementById(`previousHash${blockId}`).value;
        let hash = document.getElementById(`hash${blockId}`).value;

        let calculatedHash = CryptoJS.SHA256(nonce + data + prevHash).toString();

        // Kiểm tra xem hash hiện tại có khớp với hash được tính toán không
        if (hash !== calculatedHash || !hash.startsWith('0000')) {
            isValid = false;
        }

        // Cập nhật màu block dựa trên tính hợp lệ
        updateBlockColor(blockId, isValid);

        // Nếu block hiện tại không hợp lệ, tất cả block sau đó cũng sẽ bị ảnh hưởng
        if (i < 5) {
            let nextBlockId = `block${peer}${i + 1}`;
            if (!isValid) {
                document.getElementById(`previousHash${nextBlockId}`).value = calculatedHash;
                updateHash(nextBlockId, peer, i + 1);  // Tính toán lại hash cho block tiếp theo
            }
        }
    }
}

function updateBlockColor(blockId, isValid) {
    const blockElement = document.getElementById(blockId);
    blockElement.style.backgroundColor = isValid ? "#ffFbe6" : "#F7DED0"; // Vàng cho hợp lệ, đỏ cho không hợp lệ
}
