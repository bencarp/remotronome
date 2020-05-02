function exit() {
    window.open("/", "_self");
}

let tempo = 60;
let beatsPerSecond = tempo / 60;
let fullOscillation = 2 / beatsPerSecond;

/* This fixes mobile safari not vertically centering the text correctly at page load */
window.onload = function initTempo() {
    document.getElementById("bpmValue").textContent = tempo.toString();
};

/* BPM slider (weight) functionality */

let initialViewportY;
/**
 *
 */
function weightUnwrap(event) {
    /* Changing the tempo should only work when paused */
    const arm = document.getElementById("arm");
    if (arm.classList.contains("oscillate")) return;
    if (arm.classList.contains("moveLeft")) return;

    // For later (moveWeight)
    initialViewportY = event.touches[0].clientY;
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
function moveWeight(event) {
    const arm = document.getElementById("arm");
    if (arm.classList.contains("oscillate")) return;
    if (arm.classList.contains("moveLeft")) return;

    const weightTouchArea = document.getElementById("weightTouch");
    const upperStick = document.getElementById("upperStick");
    const lowerStick = document.getElementById("lowerStick");
    /* Absolute Y coordinate of the touch point relative to viewHeight */
    const viewportY = event.touches[0].clientY;
    const armTop = arm.getBoundingClientRect().top;
    const armBottom = arm.getBoundingClientRect().bottom;
    /* Absolute Y coordinate of the touch point, but relative to the arm's top */
    const absTouchY = viewportY - armTop;
    /* Relative Y coordinate of the touch point, 0% (Top of arm) to 100% (Bottom of arm) */
    const relTouchY = absTouchY / 241.22;
    /* Transform translateY percentage of the weightTouchArea, from -13% to 49.1% */
    const armYtransform = 0.621 * relTouchY - 0.13;
    /* Shorten or highten the sticks above and below the weight */
    const upperStickDelta = 155.8 * relTouchY + 3;
    const lowerStickDelta = 155.5 * relTouchY + 22.5;

    if ((0 < relTouchY) && (relTouchY < 1)) {
        weightTouchArea.style.transform = "translateY(" + armYtransform * 100 + "%)"
        upperStick.setAttribute('d','m 75.112564,2.4574502 h 8.466667 V '
            + upperStickDelta
            +' h -8.466667 z');
        lowerStick.setAttribute('d','m 75.112625,'
            + lowerStickDelta
            + ' h 8.466667 V 184.55954 h -8.466667 z');
        /*  Since the scale on the metronome isn't linear,
            we need to make some adjustments. These aren't perfect
            yet and still leave out a number of tempi
         */
        let linearTempo = Math.round(168 * relTouchY + 40);
        if ((linearTempo > 39) && (linearTempo < 51)) {
            tempo = linearTempo;
        }
        else if ((linearTempo > 50) && (linearTempo < 72)) {
            tempo = Math.round(linearTempo - linearTempo * relTouchY) + 2;
        }
        else if ((linearTempo > 75) && (linearTempo < 82)) {
            tempo = linearTempo - 16;
        }
        else if ((linearTempo > 81) && (linearTempo < 98)) {
            tempo = linearTempo - 14;
        }
        else if ((linearTempo > 97) && (linearTempo < 200)) {
            tempo = linearTempo - 12;
        }
        else if (linearTempo > 199) {
            tempo = Math.ceil(linearTempo * relTouchY);
        }
        document.getElementById("bpmValue").textContent = tempo.toString();
        beatsPerSecond = tempo / 60;
        fullOscillation = 2 / beatsPerSecond;
    }
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

/**
 *
 */
let clickTimeout;
async function start() {
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

    clearTimeout(clickTimeout);

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

