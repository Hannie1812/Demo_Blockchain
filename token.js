document.addEventListener('DOMContentLoaded', function () {
    let peers = ['A', 'B', 'C'];

    // Transactions for each block
    const blockTransactions = {
        block1: [
            { amount: 25.00, from: "Darcy", to: "Bingley" },
            { amount: 4.27, from: "Elizabeth", to: "Jane" },
            { amount: 19.22, from: "Wickham", to: "Lydia" },
            { amount: 106.44, from: "Lady Cath", to: "Collins" },
            { amount: 6.42, from: "Charlotte", to: "Elizabeth" }
        ],
        block2: [
            { amount: 97.67, from: "Ripley", to: "Lambert" },
            { amount: 48.61, from: "Kane", to: "Ash" },
            { amount: 6.15, from: "Parker", to: "Dallas" },
            { amount: 10.44, from: "Hicks", to: "Newt" },
            { amount: 88.32, from: "Bishop", to: "Burke" },
            { amount: 45.00, from: "Hudson", to: "Gorman" },
            { amount: 92.00, from: "Vasquez", to: "Apone" }
        ],
        block3: [
            { amount: 10.00, from: "Emily", to: "Jackson" },
            { amount: 5.00, from: "Madison", to: "Jackson" },
            { amount: 20.00, from: "Lucas", to: "Grace" }
        ],
        block4: [
            { amount: 62.19, from: "Rick", to: "Ilsa" },
            { amount: 867.96, from: "Captain Louis R", to: "Strasser" },
            { amount: 276.15, from: "Victor Laszlo", to: "Ilsa" },
            { amount: 97.13, from: "Rick", to: "Sam" },
            { amount: 119.63, from: "Captain Louis R", to: "Jan Brandel" }
        ],
        block5: [
            { amount: 14.12, from: "Denise Lc", to: "Edmund Lc" },
            { amount: 2760.29, from: "Lord Gler", to: "John Moran" },
            { amount: 413.78, from: "Katherine", to: "Miss Audrey" }
        ]
    };

    // Create blocks for each peer
    peers.forEach(peer => {
        for (let i = 1; i <= 5; i++) {
            let blockId = `block${peer}${i}`;
            let peerElement = document.getElementById(blockId);

            // Block structure
            peerElement.innerHTML = `
                <h3>Block ${i}</h3>
                <label>Block Number:</label>
                <input type="text" value="${i}" readonly>
                <label>Nonce:</label>
                <input type="text" id="nonce${blockId}" value="0" readonly>
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
        }
    });

    // Automatically mine all blocks after page load to ensure they are valid
    peers.forEach(peer => {
        for (let i = 1; i <= 5; i++) {
            mineBlock(`block${peer}${i}`, peer, i);
        }
    });
});

function updateHash(blockId, peer, blockNumber) {
    let nonce = document.getElementById(`nonce${blockId}`).value;
    let prevHash = document.getElementById(`previousHash${blockId}`).value;

    // Gather transaction data for the block
    let data = '';
    document.querySelectorAll(`#tx${blockId} input[type="text"]`).forEach(input => {
        data += input.value;
    });

    // Recalculate hash using nonce, data, and previous hash
    let hash = CryptoJS.SHA256(nonce + data + prevHash).toString();
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

    // Gather transaction data for mining
    let data = '';
    document.querySelectorAll(`#tx${blockId} input[type="text"]`).forEach(input => {
        data += input.value;
    });

    let hash = CryptoJS.SHA256(nonce + data + prevHash).toString();

    // Increment nonce until a valid hash is found
    while (!hash.startsWith('0000')) {
        nonce++;
        hash = CryptoJS.SHA256(nonce + data + prevHash).toString();
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

        // Gather transaction data for validation
        let data = '';
        document.querySelectorAll(`#tx${blockId} input[type="text"]`).forEach(input => {
            data += input.value;
        });

        let calculatedHash = CryptoJS.SHA256(nonce + data + prevHash).toString();

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
