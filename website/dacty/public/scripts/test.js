let startTime;
let referenceText = "Hello It's the reference text for this app.";
let alreadyLaunched = false;
let stopTimer = false;

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
    startTimer();
}

function endTest() {
    stopTimer = true;
    let endTime = new Date().getTime();
    let elapsedTime = (endTime - startTime) / 1000;
    let typedText = document.getElementById("input-field").value.trim();
    
    let typedWords = typedText.split(" ");
    let referenceWords = referenceText.split(" ");
    let correctWords = 0;
    
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
    if (alreadyLaunched)
        return;
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

function main() {
    let ref = document.getElementById("text-ref");
    ref.innerHTML = `"${referenceText}"`;
}

main();