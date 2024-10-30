// Call generateHash on page load
document.addEventListener("DOMContentLoaded", generateHash);
class Block {
    constructor(index, timestamp, data, previousHash = '') {
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
    }

    calculateHash() {
        return CryptoJS.SHA256(
            this.index + this.previousHash + this.timestamp + JSON.stringify(this.data)
        ).toString();
    }
}

class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
    }

    createGenesisBlock() {
        return new Block(0, "01/01/2024", "Genesis Block", "0");
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addBlock(newBlock) {
        newBlock.previousHash = this.getLatestBlock().hash;
        newBlock.hash = newBlock.calculateHash();
        this.chain.push(newBlock);
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }
        return true;
    }

    printBlockchain() {
        return JSON.stringify(this.chain, null, 4);
    }
}

let myCoin = new Blockchain();
myCoin.addBlock(new Block(1, "10/01/2024", { amount: 4 }));
myCoin.addBlock(new Block(2, "12/01/2024", { amount: 10 }));

document.getElementById("blockchainOutput").textContent = myCoin.printBlockchain();

// Hàm tạo mã băm SHA-256 tự động khi có thay đổi
function generateHash() {
    const inputData = document.getElementById("inputData").value.trim();
    const hashOutput = document.getElementById("hashOutput");

    // Generate the hash even if inputData is empty
    const hash = CryptoJS.SHA256(inputData).toString();
    hashOutput.value = hash; // Display the hash
}
