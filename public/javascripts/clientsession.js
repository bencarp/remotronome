function exit() {
    window.open("/", "_self");
}

/* BPM slider (weight) functionality */
/**
 *
 */
function weightUnwrap() {
    var weight = document.getElementById("weight");

    weight.classList.toggle("unwrap");
    setTimeout(() => {
        weight.classList.toggle("unwrap");
        weight.style.fillOpacity = "0";
    }, 300);

    let startTime = 0;
    const totalTime = 300;
    const animateStep = (timestamp) => {
        if (!startTime) startTime = timestamp;
        // progress goes from 0 to 0.5 over 0.5s
        const progress = (timestamp - startTime) / totalTime;
        const mx = 64.508936 - 27 * progress;
        const h = 30.027182 + 57 * progress;
        const H = 66.644566 - 27 * progress

        weight.setAttribute('d', 'm '
            + mx
            + ',35.321161 h '
            + h
            + ' l -2.13564,19.129851 H '
            + H
            + ' Z');
        if (progress < 1) {
            window.requestAnimationFrame(animateStep);
        }
    }
    window.requestAnimationFrame(animateStep);
}

/**
 *
 */
function weightWrap() {
    var weight = document.getElementById("weight");

    weight.classList.toggle("wrap");
    setTimeout(() => {
        weight.classList.toggle("wrap");
        weight.style.fillOpacity = "1";
    }, 300);

    let startTime = 0;
    const totalTime = 300;
    const animateStep = (timestamp) => {
        if (!startTime) startTime = timestamp;
        // progress goes from 0.5 to 0 over 0.5s
        const progress = 1 - ((timestamp - startTime) / totalTime);
        const mx = 64.508936 - 27 * progress;
        const h = 30.027182 + 57 * progress;
        const H = 66.644566 - 27 * progress

        weight.setAttribute('d', 'm '
            + mx
            + ',35.321161 h '
            + h
            + ' l -2.13564,19.129851 H '
            + H
            + ' Z');
        if (progress > 0) {
            window.requestAnimationFrame(animateStep);
        }
    }
    window.requestAnimationFrame(animateStep);
}

/**
 *
 */
function play() {
    var playIcon = document.getElementById("playIcon");
    var pauseIcon = document.getElementById("pauseIcon");

    playIcon.style.display = "none";
    pauseIcon.style.display = "inline";
    start();
}

/**
 *
 */
function pause() {
    var playIcon = document.getElementById("playIcon");
    var pauseIcon = document.getElementById("pauseIcon");

    pauseIcon.style.display = "none";
    playIcon.style.display = "inline";
    stop();
}

/* temporarily (no pun intended) */
var tempo = 60;
var beatsPerSecond = tempo / 60;
var fullOscillation = 2 / beatsPerSecond;

/**
 *
 */
function start() {
    var arm = document.getElementById("arm");

    arm.classList.toggle("moveLeft");
    setTimeout(() => {
        arm.style.animationDuration = fullOscillation.toString() + "s";
        arm.classList.toggle("oscillate");
        arm.classList.toggle("moveLeft");
    }, 500);
}

/**
 *
 */
function stop() {
    var arm = document.getElementById("arm");
    arm.classList.toggle("oscillate");
    arm.style.animationDuration = "";

    arm.classList.toggle("backToMiddle");
}