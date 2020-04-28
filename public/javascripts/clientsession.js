function exit() {
    window.open("/", "_self");
}

/* BPM slider (weight) functionality */
/**
 *
 */
function weightUnwrap() {
    /* Changing the tempo should only work when paused */
    const arm = document.getElementById("arm");
    if (arm.classList.contains("oscillate")) return;
    if (arm.classList.contains("moveLeft")) return;

    const weight = document.getElementById("weight");

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
    /* Changing the tempo should only work when paused */
    const arm = document.getElementById("arm");
    if (arm.classList.contains("oscillate")) return;
    if (arm.classList.contains("moveLeft")) return;

    const weight = document.getElementById("weight");

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
        else {
            weight.setAttribute('d','m 64.508936,35.321161 h 30.027182 l -2.13564,19.129851 H 66.644566 Z');
        }
    }
    window.requestAnimationFrame(animateStep);
}

/**
 *
 */
function moveWeight() {

}


/**
 *
 */
function play() {
    const playIcon = document.getElementById("playIcon");
    const pauseIcon = document.getElementById("pauseIcon");

    playIcon.style.display = "none";
    pauseIcon.style.display = "inline";
    start();
}

/**
 *
 */
function pause() {
    const playIcon = document.getElementById("playIcon");
    const pauseIcon = document.getElementById("pauseIcon");

    pauseIcon.style.display = "none";
    playIcon.style.display = "inline";
    stop();
}

/* temporarily (no pun intended) */
let tempo = 60;
const beatsPerSecond = tempo / 60;
const fullOscillation = 2 / beatsPerSecond;

/* This fixes mobile safari not vertically centering the text correctly at page load */
window.onload = function initTempo() {
    document.getElementById("bpmValue").textContent = tempo.toString();
};

/**
 *
 */
function start() {
    const arm = document.getElementById("arm");

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
    const arm = document.getElementById("arm");

    /* Calculate current rotation angle */

    // get the computed style object for the element
    const style = window.getComputedStyle(arm);
    // form: 'matrix(a, b, c, d, tx, ty)'
    const transformString = style['-webkit-transform']
        || style['-moz-transform']
        || style['transform'] ;
    const splits = transformString.split(',');
    // parse the string to get a and b
    const parenLoc = splits[0].indexOf('(');
    const a = parseFloat(splits[0].substr(parenLoc+1));
    const b = parseFloat(splits[1]);
    // atan2 on b, a gives the angle in radians
    const rad = Math.atan2(b, a);

    arm.classList.toggle("oscillate");

    let startTime = 0;
    const totalTime = 200;
    const animateStep = (timestamp) => {
        if (!startTime) startTime = timestamp;
        // progress goes from 0.2 to 0 over 0.2s
        const progress = 1 - ((timestamp - startTime) / totalTime);
        const currentAngle = rad * progress;
        arm.style.transform = 'rotate(' + currentAngle + 'rad)';
        if (progress > 0) {
            window.requestAnimationFrame(animateStep);
        }
        else {
            arm.style.transform = 'rotate(0rad)';
        }
    }

    window.requestAnimationFrame(animateStep);
    arm.style.animationDuration = "";
}

