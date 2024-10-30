document.addEventListener("DOMContentLoaded", function () {
    // Tự động mine và cập nhật hash hợp lệ ngay khi trang được tải
    mineBlock(1);
    mineBlock(2);
    mineBlock(3);
    mineBlock(4);
    mineBlock(5);

    // Thêm sự kiện click cho nút "Mine"
    for (let i = 1; i <= 5; i++) {
        document.getElementById(`mineButton${i}`).addEventListener("click", function () {
            mineBlock(i);
        });
        autoUpdateHash(i);
    }
});

function autoUpdateHash(blockNumber) {
    const dataElement = document.getElementById(`data${blockNumber}`);
    const nonceElement = document.getElementById(`nonce${blockNumber}`);

    // Lắng nghe sự kiện thay đổi dữ liệu hoặc nonce
    dataElement.addEventListener("input", function () {
        updateHash(blockNumber);
        handleChange(blockNumber);
    });

    nonceElement.addEventListener("input", function () {
        updateHash(blockNumber);
        handleChange(blockNumber);
    });
}

function updateHash(blockNumber) {
    const blockData = document.getElementById(`data${blockNumber}`).value;
    const nonce = document.getElementById(`nonce${blockNumber}`).value || 0;
    const previousHash = document.getElementById(`previousHash${blockNumber}`).value;

    // Tính toán hash dựa trên block data, nonce và previous hash
    const hash = CryptoJS.SHA256(previousHash + blockData + nonce).toString();

    // Cập nhật giá trị hash
    document.getElementById(`hash${blockNumber}`).value = hash;

    // Nếu blockNumber chưa phải là block cuối cùng, cập nhật previousHash cho block tiếp theo
    if (blockNumber < 5) {
        document.getElementById(`previousHash${blockNumber + 1}`).value = hash;
        updateHash(blockNumber + 1); // Gọi đệ quy để cập nhật hash của block tiếp theo

    }
}
function checkAllBlocks() {
    for (let i = 1; i <= 5; i++) {
        const hashElement = document.getElementById(`hash${i}`);
        const previousHashElement = document.getElementById(`previousHash${i}`);

        // Kiểm tra tính hợp lệ của hash
        const isValid = hashElement.value.startsWith("0000");

        // Cập nhật màu sắc cho block
        updateBlockColor(i, isValid);
    }
}


function mineBlock(blockNumber) {
    let nonce = 0;
    const previousHash = document.getElementById(`previousHash${blockNumber}`).value;
    const blockData = document.getElementById(`data${blockNumber}`).value;
    let hash;

    // Tìm nonce sao cho hash bắt đầu bằng '0000'
    do {
        nonce++;
        hash = CryptoJS.SHA256(previousHash + blockData + nonce).toString();
    } while (!hash.startsWith("0000"));

    // Cập nhật nonce và hash
    document.getElementById(`nonce${blockNumber}`).value = nonce;
    document.getElementById(`hash${blockNumber}`).value = hash;

    // Cập nhật previousHash cho block tiếp theo (nếu có)
    if (blockNumber < 5) {
        document.getElementById(`previousHash${blockNumber + 1}`).value = hash;
        updateHash(blockNumber + 1); // Cập nhật đệ quy cho các block tiếp theo
    }

    // Kiểm tra tất cả các block sau khi khai thác
    checkAllBlocks();
}


function calculateHash(blockNumber, nonce, data) {
    return CryptoJS.SHA256(blockNumber + nonce + data).toString();
}
function updateBlockColor(startBlockNumber, isValid) {
    // Cập nhật màu cho tất cả các block từ startBlockNumber đến block 5
    for (let i = startBlockNumber; i <= 5; i++) {
        const block = document.getElementById(`block${i}`);
        block.style.backgroundColor = isValid ? "#ffFbe6" : "#F7DED0"; // Màu xanh cho hash hợp lệ, đỏ cho không hợp lệ
    }
}
function handleChange(blockNumber) {
    const hashElement = document.getElementById(`hash${blockNumber}`);
    const previousHashElement = document.getElementById(`previousHash${blockNumber}`);
    const isValid = hashElement.value.startsWith("0000") && hashElement.value === previousHashElement.value;

    // Cập nhật màu cho block hiện tại và tất cả các block sau nó
    updateBlockColor(blockNumber, isValid);
}
