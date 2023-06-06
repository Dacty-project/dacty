let startTime;
let timerInterval;

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
    startTime = new Date().getTime();

    timerInterval = setInterval(() => {
        let currentTime = new Date().getTime();
        let elapsedTime = Math.floor((currentTime - startTime) / 1000);
        let formattedTime = formatTime(elapsedTime);

        document.getElementById("timer").innerHTML = formattedTime;
    }, 1000);
}

// Stop the timer
function stopTimer() {
    clearInterval(timerInterval);
}

// Attach event listeners to the buttons
document.getElementById("startButton").addEventListener("click", startTimer);
document.getElementById("stopButton").addEventListener("click", stopTimer);
