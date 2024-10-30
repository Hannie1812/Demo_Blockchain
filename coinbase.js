document.addEventListener('DOMContentLoaded', function () {
    let peers = ['A', 'B', 'C'];

    // Transactions for each block
    const blockTransactions = {
        block1: [],
        block2: [
            { amount: 10.00, from: "Anders", to: "Sophia" },
            { amount: 20.00, from: "Anders", to: "Lucas" },
            { amount: 15.00, from: "Anders", to: "Emily" },
            { amount: 15.00, from: "Anders", to: "Madison" }
        ],
        block3: [
            { amount: 10.00, from: "Emily", to: "Jackson" },
            { amount: 5.00, from: "Madison", to: "Jackson" },
            { amount: 20.00, from: "Lucas", to: "Grace" }
        ],
        block4: [
            { amount: 15.00, from: "Jackson", to: "Ryan" },
            { amount: 5.00, from: "Emily", to: "Madison" },
            { amount: 8.00, from: "Sophia", to: "Jackson" }
        ],
        block5: [
            { amount: 2.00, from: "Jackson", to: "Alexander" },
            { amount: 6.00, from: "Ryan", to: "Carter" },
            { amount: 4.00, from: "Ryan", to: "Riley" },
            { amount: 9.95, from: "Grace", to: "Katherine" }
        ]
    };

    peers.forEach(peer => {
        for (let i = 1; i <= 5; i++) {
            let blockId = `block${peer}${i}`;
            let peerElement = document.getElementById(`block${peer}${i}`);
            // Block structure
            peerElement.innerHTML = `
                <label>Block Number:</label>
                <input type="text" value="${i}" readonly>
                <label>Nonce:</label>
                <input type="text" id="nonce${blockId}" value="0" readonly>

                <!-- Thêm phần Coinbase -->
                <label>Coinbase:</label>
                <table>
                    <tr>
                        <td colspan="3">
                            <div class="coinbase-container">
                                <span>$</span>
                                <input type="text" id="coinbaseAmount${blockId}" value="100.00">
                                <span class="arrow">→</span>
                                <input type="text" id="coinbaseTo${blockId}" value="Anders">
                            </div>
                        </td>
                    </tr>
                </table>

                <label>Tx:</label>
                <table id="tx${blockId}"></table>
                <label>Previous Hash:</label>
                <input type="text" id="previousHash${blockId}" value="${i === 1 ? '00000000000000000000000000000000000000000000000000000000000000' : ''}" readonly>
                <label>Hash:</label>
                <input type="text" id="hash${blockId}" readonly>
                <button onclick="mineBlock('${blockId}', '${peer}', ${i})">Mine</button>
            `;

            // Add transactions to the block
            let txTable = document.getElementById(`tx${blockId}`);
            let transactions = blockTransactions[`block${i}`];
            if (transactions) {
                transactions.forEach(tx => {
                    let row = document.createElement('tr');
                    row.innerHTML = `
                        <td>$<input type="text" value="${tx.amount}"></td>
                        <td>From: <input type="text" value="${tx.from}"></td>
                        <td>To: <input type="text" value="${tx.to}"></td>
                    `;
                    txTable.appendChild(row);
                });
            }
            // Listen for transaction changes to recalculate the hash
            document.querySelectorAll(`#tx${blockId} input[type="text"]`).forEach(input => {
                input.addEventListener('input', () => updateHash(blockId, peer, i));
            });
            // Lắng nghe sự kiện thay đổi từ phần coinbase
            document.getElementById(`coinbaseAmount${blockId}`).addEventListener('input', () => updateHash(blockId, peer, i));
            document.getElementById(`coinbaseTo${blockId}`).addEventListener('input', () => updateHash(blockId, peer, i));
        }
    });
    // Automatically mine all blocks after page load to ensure they are valid
    peers.forEach(peer => {
        for (let i = 1; i <= 5; i++) {
            mineBlock(`block${peer}${i}`, peer, i);
        }
    });
});

// Hàm cập nhật hash khi có thay đổi
function updateHash(blockId, peer, blockNumber) {
    let nonce = document.getElementById(`nonce${blockId}`).value;
    let prevHash = document.getElementById(`previousHash${blockId}`).value;

    // Lấy dữ liệu từ Coinbase
    let coinbaseAmount = document.getElementById(`coinbaseAmount${blockId}`).value;
    let coinbaseTo = document.getElementById(`coinbaseTo${blockId}`).value;

    // Gather transaction data for the block
    let txData = '';
    document.querySelectorAll(`#tx${blockId} input[type="text"]`).forEach(input => {
        txData += input.value;
    });

    // Combine nonce, coinbase data, transaction data, and previous hash to create the hash
    let dataToHash = `${nonce}${coinbaseAmount}${coinbaseTo}${txData}${prevHash}`;
    let hash = CryptoJS.SHA256(dataToHash).toString();

    // Cập nhật giá trị hash
    document.getElementById(`hash${blockId}`).value = hash;

    // Revalidate and update the chain starting from this block
    checkChainValidity(peer, blockNumber);
}
function mineBlock(blockId, peer, blockNumber) {
    let nonceElement = document.getElementById(`nonce${blockId}`);
    let hashElement = document.getElementById(`hash${blockId}`);
    let prevHashElement = document.getElementById(`previousHash${blockId}`);

    let nonce = 0;
    let prevHash = prevHashElement.value;

    // Lấy dữ liệu từ Coinbase
    let coinbaseAmount = document.getElementById(`coinbaseAmount${blockId}`).value;
    let coinbaseTo = document.getElementById(`coinbaseTo${blockId}`).value;

    // Gather transaction data for mining
    let txData = '';
    document.querySelectorAll(`#tx${blockId} input[type="text"]`).forEach(input => {
        txData += input.value;
    });

    // Combine nonce, coinbase data, transaction data, and previous hash to create the hash
    let hash = CryptoJS.SHA256(nonce + coinbaseAmount + coinbaseTo + txData + prevHash).toString();

    // Increment nonce until a valid hash is found
    while (!hash.startsWith('0000')) {
        nonce++;
        hash = CryptoJS.SHA256(nonce + coinbaseAmount + coinbaseTo + txData + prevHash).toString();
    }

    // Set the valid nonce and hash
    nonceElement.value = nonce;
    hashElement.value = hash;

    // Update the next block's previous hash
    if (blockNumber < 5) {
        let nextBlockId = `block${peer}${blockNumber + 1}`;
        document.getElementById(`previousHash${nextBlockId}`).value = hash;
    }

    // Validate and update the chain
    checkChainValidity(peer, blockNumber);
}


function checkChainValidity(peer, startBlockNumber) {
    let isValid = true;

    for (let i = startBlockNumber; i <= 5; i++) {
        let blockId = `block${peer}${i}`;
        let nonce = document.getElementById(`nonce${blockId}`).value;
        let prevHash = document.getElementById(`previousHash${blockId}`).value;
        let hash = document.getElementById(`hash${blockId}`).value;

        // Lấy dữ liệu từ Coinbase
        let coinbaseAmount = document.getElementById(`coinbaseAmount${blockId}`).value;
        let coinbaseTo = document.getElementById(`coinbaseTo${blockId}`).value;

        // Gather transaction data for validation
        let txData = '';
        document.querySelectorAll(`#tx${blockId} input[type="text"]`).forEach(input => {
            txData += input.value;
        });

        // Combine nonce, coinbase data, transaction data, and previous hash to create the hash
        let calculatedHash = CryptoJS.SHA256(nonce + coinbaseAmount + coinbaseTo + txData + prevHash).toString();

        // Validate the current block's hash
        if (hash !== calculatedHash || !hash.startsWith('0000')) {
            isValid = false;
        }

        // Update block color based on validity
        updateBlockColor(blockId, isValid);

        // Fix next block's previous hash and recalculate if invalid
        if (i < 5 && !isValid) {
            let nextBlockId = `block${peer}${i + 1}`;
            document.getElementById(`previousHash${nextBlockId}`).value = calculatedHash;
            updateHash(nextBlockId, peer, i + 1);  // Recalculate the next block's hash
        }
    }
}

function updateBlockColor(blockId, isValid) {
    const blockElement = document.getElementById(blockId);
    blockElement.style.backgroundColor = isValid ? "#ffFbe6" : "#F7DED0";  // Yellow for valid, red for invalid
}
