let currentScreen = "start-screen"; // Use "start-screen" to match the HTML element id
let timeLeft = 40;
let timerInterval = null;
let score = 0;
let highScores = JSON.parse(localStorage.getItem("highScores")) || [];

const items = [
    { name: "teabag", category: "organic", image: "images/teabag.png" },
    { name: "used napkin", category: "residual", image: "images/tissues.png" },
    { name: "snack wrapper", category: "plastic", image: "images/snicker.png" },
    { name: "banana peel", category: "organic", image: "images/bananapeel.png" },
    { name: "gloves", category: "residual", image: "images/gloves.png" },
    { name: "paper cups", category: "residual", image: "images/papercups.png" },
    { name: "dirty paper plate", category: "residual", image: "images/paperplates.png" }
];
let shuffledItems = [];
let currentItem = null;

function shuffleItems() {
    shuffledItems = [...items].sort(() => Math.random() - 0.5);
}

function showScreen(screenId) {
    document.getElementById("start-screen").classList.add("hidden");
    document.getElementById("why-separate").classList.add("hidden");
    document.getElementById("but-fear-not").classList.add("hidden");
    document.getElementById("how-to-play").classList.add("hidden");
    document.getElementById("game-screen").classList.add("hidden");
    document.getElementById("game-over").classList.add("hidden");
    document.getElementById(screenId).classList.remove("hidden");
    currentScreen = screenId;

    if (screenId === "game-screen") {
        startGame();
    } else if (screenId === "game-over") {
        saveScore();
        displayHighScores();
    }}

function startGame() {
    shuffleItems();
    showNextItem();
    startTimer();
    updateScore(0);
}

function startTimer() {
    clearInterval(timerInterval);
    timeLeft = 40;
    let timerElement = document.getElementById("timer");
    timerElement.textContent = `Time Left: ${timeLeft}`;

    timerInterval = setInterval(() => {
        timeLeft--;
        timerElement.textContent = `Time Left: ${timeLeft}`;

        // If 10 seconds left, start blinking the timer fast
        if (timeLeft <= 10) {
            timerElement.classList.add("flicker-fast");
        } else {
            timerElement.classList.remove("flicker-fast");
        }

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            showScreen("game-over");
        }
    }, 1000);
}


function showNextItem() {
    if (shuffledItems.length === 0) {
        shuffleItems();
    }
    
    if (shuffledItems.length > 0) {
        currentItem = shuffledItems.pop();
        let wasteImage = document.getElementById("waste-image");
        wasteImage.src = currentItem.image;
        wasteImage.alt = currentItem.name;
        wasteImage.setAttribute("data-category", currentItem.category);

        // Create and display the title for the image
        let imageTitle = document.getElementById("image-title");
        imageTitle.textContent = currentItem.name; // Set the title text
    }
}

function updateScore(points) {
    score += points;
    document.getElementById("score").textContent = `Score: ${score}`;
}

function checkAnswer(selectedCategory) {
    if (!currentItem) return;
    let correctCategory = currentItem.category;
    let correctButton = document.querySelector(`.option[data-type='${correctCategory}']`);

    if (selectedCategory === correctCategory) {
        // ✅ Add points for a correct answer!
        updateScore(100);
    } else {
        // Flash the entire screen red when wrong
        document.getElementById("game-screen").classList.add("flash-red");

        setTimeout(() => {
            document.getElementById("game-screen").classList.remove("flash-red");
        }, 300);
    }

    // Make the correct button blink green (whether user was right or wrong)
    correctButton.classList.add("correct-blink");

    // Reset styles and move to the next item after 1 second
    setTimeout(() => {
        correctButton.classList.remove("correct-blink");
        showNextItem();
    }, 1000);
}



function saveScore() {
    highScores.push(score);
    highScores.sort((a, b) => b - a);
    highScores = highScores.slice(0, 6);
    localStorage.setItem("highScores", JSON.stringify(highScores));
}

function displayHighScores() {
    let highScoresList = document.getElementById("high-scores");
    let yourScoreHTML = `<h2 style="color: red;">Your score is ${score}</h2>`;
    highScoresList.innerHTML = yourScoreHTML;

    highScoresList.innerHTML += "<h2>Top Scores</h2>";
    let foundFirstInstance = false;
    highScores.forEach((sc, index) => {
        let flickerClass = "";
        let colorStyle = "";
        
        if (sc === score && !foundFirstInstance) {
            flickerClass = "flicker";
            colorStyle = "color: red;";
            foundFirstInstance = true;
        }
        
        highScoresList.innerHTML += `<p class="${flickerClass}" style="${colorStyle}">${index + 1}. ${sc}</p>`;
    });
}

function resetGame() {
    score = 0;
    timeLeft = 40;
    clearInterval(timerInterval);
    document.getElementById("score").textContent = `Score: ${score}`;
    document.getElementById("timer").textContent = `Time Left: ${timeLeft}`;
}

document.addEventListener("click", function(e) {
    if (e.target.closest(".option")) return;
    if (currentScreen !== "game-screen") {
        if (currentScreen === "start-screen") {
            showScreen("why-separate");
        } else if (currentScreen === "why-separate") {
            showScreen("but-fear-not");
        } else if (currentScreen === "but-fear-not") {
            showScreen("how-to-play");
        } else if (currentScreen === "how-to-play") {
            showScreen("game-screen");
        } else if (currentScreen === "game-over") {
            resetGame();
            showScreen("start-screen");
        }
    }
});

document.addEventListener("keydown", function () {
    if (currentScreen === "start-screen") {
        showScreen("why-separate");
    } else if (currentScreen === "why-separate") {
        showScreen("but-fear-not");
    } else if (currentScreen === "but-fear-not") {
        showScreen("how-to-play");
    } else if (currentScreen === "how-to-play") {
        showScreen("game-screen");
    } else if (currentScreen === "game-over") {
        resetGame();
        showScreen("start-screen");
    }
});

document.querySelectorAll(".option").forEach(button => {
    button.addEventListener("click", function (e) {
        e.stopPropagation();
        checkAnswer(this.getAttribute("data-type"));
    });
});

