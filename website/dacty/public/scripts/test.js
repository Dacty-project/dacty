let startTime;
let referenceText = "Wikipédia est un projet d’encyclopédie collective en ligne, universelle, multilingue et fonctionnant sur le principe du wiki. Ce projet vise à offrir un contenu librement réutilisable, objectif et vérifiable, que chacun peut modifier et améliorer.";
let alreadyLaunched = false;
let stopTimer = false;
let wordsCounter = 0;
let savedInputText = "";
let sessionId = "";

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
    savedInputText = "";
    alreadyLaunched = false;
    startTimer();
    updateProgressBar();
    updateRefText()
    let result = document.getElementById("result");

    result.innerHTML = "<p></p>";
}

function endTest(update) {
    if (update === false)
        stopTimer = true;
    let endTime = new Date().getTime();
    let elapsedTime = (endTime - startTime) / 1000;
    let typedText = savedInputText;
    
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
            sessionId = data.id;
            startTest();
        })
        .catch((error) => {
            console.error("Error: ", error);
        });
}

function updateProgressBar() {
    let ref = referenceText.split(" ");
    var bar = document.getElementById("progress-bar");
    
    
    let pourcent = wordsCounter / ref.length * 100;
    
    console.log(Math.round(pourcent).toString() + "%");
    bar.style.width = Math.round(pourcent).toString() + "%";

    if (Math.round(pourcent).toString() === "100")
        bar.classList.add("bg-success");
    else
        bar.classList.remove("bg-success");
}

function updateRefText() {
    let ref = document.getElementById("text-ref");
    let referenceText = ref.textContent.trim();
    let splittedText = referenceText.split(" ");

    if (document.getElementById("input-field").value.endsWith(" ")) {
        savedInputText += document.getElementById("input-field").value;
        document.getElementById("input-field").value = "";
        wordsCounter++;
    }
    console.log(savedInputText);
    if (wordsCounter >= 0 && wordsCounter < splittedText.length) {
        let wordToBold = splittedText[wordsCounter];
        let boldedText = splittedText
        .map((word, index) => {
            if (index === wordsCounter) {
            return "<strong>" + word + "</strong>";
            }
            return word;
        })
        .join(" ");

        ref.innerHTML = boldedText;
    }
}

function textUpdate() {
    updateProgressBar();
    updateRefText();
    endTest(true);
    console.log("Updated !");
}

function resetSession() {
    if (!alreadyLaunched)
        return;
    const sessionData = {
        "session": sessionId
    };

    fetch("http://localhost:8080/training/reset", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(sessionData),
    })
        .then((reponse) => reponse.json())
        .then((data) => {
            console.log(data);
        })
        .catch((error) => {
            console.log("Error: ", error);
        });
}

function restartTest() {
    console.log("Restart test...");
    resetSession();
    //ref.innerHTML = `"${referenceText}"`;
    startTest();
}

function main() {
    let ref = document.getElementById("text-ref");
    ref.innerHTML = `"${referenceText}"`;
}

main();