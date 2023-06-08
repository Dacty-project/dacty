let startTime;
let referenceText = "Wikipédia est un projet d’encyclopédie collective en ligne, universelle, multilingue et fonctionnant sur le principe du wiki. Ce projet vise à offrir un contenu librement réutilisable, objectif et vérifiable, que chacun peut modifier et améliorer.";
let alreadyLaunched = false;
let stopTimer = false;
let wordsCounter = 0;

// Function to format the time
function formatTime(time) {
    let hours = Math.floor(time / 3600);
    let minutes = Math.floor((time % 3600) / 60);
    let seconds = time % 60;

    return (
        ("0" + hours).slice(-2) +
        ":" +
        ("0" + minutes).slice(-2) +
        ":" +
        ("0" + seconds).slice(-2)
    );
}

// Start the timer
function startTimer() {
    if (alreadyLaunched === true)
        return;
    alreadyLaunched = true;
    startTime = new Date().getTime();

    timerInterval = setInterval(() => {
        if (stopTimer === true)
            return;
        let currentTime = new Date().getTime();
        let elapsedTime = Math.floor((currentTime - startTime) / 1000);
        let formattedTime = formatTime(elapsedTime);

        document.getElementById("timer").innerHTML = formattedTime;
    }, 1000);
}

function startTest() {
    wordsCounter = 0;
    startTimer();
}

function endTest(update) {
    if (update === false)
        stopTimer = true;
    let endTime = new Date().getTime();
    let elapsedTime = (endTime - startTime) / 1000;
    let typedText = document.getElementById("input-field").value.trim();
    
    let typedWords = typedText.split(" ");
    let referenceWords = referenceText.split(" ");
    let correctWords = 0;
    
    if (typedText.length >= referenceText.length)
        stopTimer = true;

    for (let i = 0; i < typedWords.length; i++) {
        if (typedWords[i] === referenceWords[i]) {
            correctWords++;
        }
    }
    
    let accuracy = Math.round((correctWords / referenceWords.length) * 100);
    let speed = Math.round((typedWords.length / elapsedTime) * 60);
    
    let result = document.getElementById("result");
    result.innerHTML = `Accuracy: ${accuracy}%<br>Typing speed: ${speed} words per minute`;
}

function createTrainingSession(username) {
    if (alreadyLaunched) {
        return;
    }
    const sessionData = {
        "user": username
    };
    console.log(sessionData);

    fetch("http://localhost:8080/training/create", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(sessionData),
    })
        .then((response) => response.json())
        .then((data) => {
            console.log(data.message);
            console.log("Session ID:", data.id);
            startTest();
        })
        .catch((error) => {
            console.error("Error:", error);
        });
}

function updateProgressBar() {
    let typedText = document.getElementById("input-field").value.trim();
    var bar = document.getElementById("progress-bar");
    
    
    let pourcent = typedText.length / referenceText.length * 100;
    
    console.log(Math.round(pourcent).toString() + "%");
    bar.style.width = Math.round(pourcent).toString() + "%";

    if (Math.round(pourcent).toString() === "100")
        bar.classList.add("bg-success");
    else
        bar.classList.remove("bg-success");
}

function updateRefText() {
    // Get the text content of the reference element
    let result = document.getElementById("input-field").value;

    console.log("result : [" + result + "]");

    // Check if the text ends with a space
    let endsWithSpace = result.endsWith(" ");

    // Log the result
    console.log("Text ends with space:", endsWithSpace);
    if (endsWithSpace) {
        document.getElementById("input-field").value = "";
        wordsCounter++;
    }
}

function textUpdate() {
    updateProgressBar();
    //updateRefText();
    endTest(true);
    console.log("Updated !");
}

function main() {
    let ref = document.getElementById("text-ref");
    ref.innerHTML = `"${referenceText}"`;
}

main();