function exit() {
    window.open("/", "_self");
}

/* BPM slider (weight) functionality */
/**
 *
 */
function weightUnwrap() {
    var weight = document.getElementById("weight");
    weight.classList.toggle("show");
}

/**
 *
 */
function weightWrap() {

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