let difficulty = "0000"; // The required leading zeros for valid hash

function calculateHash() {
    let blockNumber = document.getElementById("blockNumber").value;
    let data = document.getElementById("data").value;
    let nonce = document.getElementById("nonce").value;

    let hash = CryptoJS.SHA256(blockNumber + nonce + data).toString();
    document.getElementById("hash").value = hash;

    // Get the container element by its class name
    let container = document.querySelector('.container');

    // Check if the hash is valid
    if (hash.startsWith(difficulty)) {
        container.style.backgroundColor = "#fffbe6"; // Valid (light yellow)
    } else {
        container.style.backgroundColor = "#F7DED0"; // Invalid (light red)
    }
}

function mineBlock() {
    let blockNumber = document.getElementById("blockNumber").value;
    let data = document.getElementById("data").value;

    let nonce = 0;
    let hash = "";

    do {
        nonce++;
        hash = CryptoJS.SHA256(blockNumber + nonce + data).toString();
    } while (hash.substring(0, difficulty.length) !== difficulty);

    // Set the nonce field to the calculated nonce
    document.getElementById("nonce").value = nonce;
    document.getElementById("hash").value = hash;

    // After mining, set the background color to valid (light yellow)
    document.querySelector('.container').style.backgroundColor = "#fffbe6";
}

// Event listeners for input fields
document.getElementById("data").addEventListener("input", calculateHash);
document.getElementById("nonce").addEventListener("input", calculateHash);

// Mining button functionality
document.getElementById("mineButton").addEventListener("click", mineBlock);

// Automatically calculate hash and mine on page load
document.addEventListener("DOMContentLoaded", function() {
    mineBlock(); // Automatically mine the block
    calculateHash(); // Call the function to calculate hash
});
