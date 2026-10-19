const hoursDisplay = document.querySelector('.hours');
const minutesDisplay = document.querySelector('.minutes');
const secondsDisplay = document.querySelector('.seconds');
const hundredthsDisplay = document.querySelector('.hundredths');
const startButton = document.querySelector('.start');
const pauseButton = document.querySelector('.pause');
const resetButton = document.querySelector('.reset');
const lapButton = document.querySelector('.lap');
const clearLapsButton = document.querySelector('.clear-laps');
const lapList = document.querySelector('.lap-list');
const lapCount = document.querySelector('.lap-count');
const runState = document.querySelector('.run-state');
const stateLabel = document.querySelector('.state-label');

let elapsedBeforeStart = 0;
let startedAt = 0;
let timerInterval = null;
let previousLapTime = 0;
let laps = [];

function formatTime(value) {
    return String(value).padStart(2, '0');
}

function getElapsedTime(now = performance.now()) {
    return elapsedBeforeStart + (timerInterval === null ? 0 : now - startedAt);
}

function formatDuration(duration) {
    const totalHundredths = Math.floor(duration / 10);
    const hundredths = totalHundredths % 100;
    const totalSeconds = Math.floor(totalHundredths / 100);
    const seconds = totalSeconds % 60;
    const totalMinutes = Math.floor(totalSeconds / 60);
    const minutes = totalMinutes % 60;
    const hours = Math.floor(totalMinutes / 60);

    return `${formatTime(hours)}:${formatTime(minutes)}:${formatTime(seconds)}.${formatTime(hundredths)}`;
}

function renderClock() {
    const totalHundredths = Math.floor(getElapsedTime() / 10);
    const totalSeconds = Math.floor(totalHundredths / 100);

    hoursDisplay.textContent = formatTime(Math.floor(totalSeconds / 3600));
    minutesDisplay.textContent = formatTime(Math.floor(totalSeconds / 60) % 60);
    secondsDisplay.textContent = formatTime(totalSeconds % 60);
    hundredthsDisplay.textContent = formatTime(totalHundredths % 100);
}

function renderLaps() {
    lapList.replaceChildren();
    lapCount.textContent = String(laps.length);
    clearLapsButton.disabled = laps.length === 0;

    if (laps.length === 0) {
        const emptyState = document.createElement('li');
        emptyState.className = 'empty-state';
        emptyState.textContent = 'Your laps will show up here.';
        lapList.append(emptyState);
        return;
    }

    const fastestTime = Math.min(...laps.map((lap) => lap.split));
    const slowestTime = Math.max(...laps.map((lap) => lap.split));

    laps.forEach((lap, index) => {
        const row = document.createElement('li');
        const lapNumber = document.createElement('span');
        const split = document.createElement('span');
        const total = document.createElement('span');
        const isFastest = lap.split === fastestTime;
        const isSlowest = lap.split === slowestTime;

        row.className = 'lap-row';
        if (isFastest) row.classList.add('is-fastest');
        if (isSlowest) row.classList.add('is-slowest');
        lapNumber.className = 'lap-number';
        split.className = 'lap-split';
        total.className = 'lap-total';
        lapNumber.textContent = formatTime(index + 1);
        split.textContent = formatDuration(lap.split);
        total.textContent = formatDuration(lap.total);

        if (isFastest || isSlowest) {
            const tag = document.createElement('small');
            tag.className = 'lap-tag';
            tag.textContent = isFastest && isSlowest ? 'FAST / SLOW' : isFastest ? 'FASTEST' : 'SLOWEST';
            split.append(tag);
        }

        row.append(lapNumber, split, total);
        lapList.append(row);
    });
}

function updateControls() {
    const isRunning = timerInterval !== null;
    const hasElapsed = getElapsedTime() > 0;

    startButton.disabled = isRunning;
    pauseButton.disabled = !isRunning;
    lapButton.disabled = !hasElapsed;
    resetButton.disabled = !hasElapsed && laps.length === 0;
    runState.classList.toggle('is-running', isRunning);
    stateLabel.textContent = isRunning ? 'Running' : hasElapsed ? 'Paused' : 'Ready';
}

function startTimer() {
    if (timerInterval !== null) return;

    startedAt = performance.now();
    timerInterval = window.setInterval(() => {
        renderClock();
        updateControls();
    }, 25);
    updateControls();
}

function pauseTimer() {
    if (timerInterval === null) return;

    elapsedBeforeStart += performance.now() - startedAt;
    window.clearInterval(timerInterval);
    timerInterval = null;
    renderClock();
    updateControls();
}

function resetTimer() {
    if (timerInterval !== null) {
        window.clearInterval(timerInterval);
    }

    timerInterval = null;
    elapsedBeforeStart = 0;
    startedAt = 0;
    previousLapTime = 0;
    laps = [];
    renderClock();
    renderLaps();
    updateControls();
}

function addLap() {
    const total = getElapsedTime();
    if (total <= 0) return;

    laps.push({ split: total - previousLapTime, total });
    previousLapTime = total;
    renderLaps();
    updateControls();
}

function clearLaps() {
    laps = [];
    previousLapTime = 0;
    renderLaps();
    updateControls();
}

startButton.addEventListener('click', startTimer);
pauseButton.addEventListener('click', pauseTimer);
resetButton.addEventListener('click', resetTimer);
lapButton.addEventListener('click', addLap);
clearLapsButton.addEventListener('click', clearLaps);

document.addEventListener('keydown', (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey || event.repeat) return;
    if (event.target instanceof HTMLElement && event.target.isContentEditable) return;

    const key = event.key.toLowerCase();
    if (key === ' ' && !event.target.matches('button, input, textarea, select')) {
        event.preventDefault();
        if (timerInterval === null) startTimer();
        else pauseTimer();
    } else if (key === 'l') {
        addLap();
    } else if (key === 'r') {
        resetTimer();
    }
});

renderClock();
renderLaps();
updateControls();
