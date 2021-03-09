let tempo = 60; /* Beats per minute */
let beatsPerSecond = tempo / 60;
let fullOscillation = 2 / beatsPerSecond;

function exit() {
    window.open("/", "_self");
}

function reload() {
    window.open(window.location.href, "_self");
}

window.onload = function() {
    initTempo();
    socketInit();
}


let socket;
/**
 *  Types of websocket messages:
 *      - New client has connected
 *      - A client has left (= no ping pong response)
 *      - Play press
 *      - Pause press
 *      - Weight was touched, stop and lock other clients' weights to avoid conflict
 *      - Weight was let go, broadcast the new tempo
 *      - Count-in broadcast, and active
 *
 *
 */
function socketInit() {
    // Environment is declared in session.ejs, sent by nodejs
    if (environment === 'production') {
        socket = new WebSocket('wss://' + window.location.hostname + '/ws/');
    } else {
        socket = new WebSocket('ws://' + window.location.hostname + ':8020');
    }

    socket.addEventListener('open', function (event) {
        console.log('Websocket successfully opened!');
    });

    socket.addEventListener('error', function (event) {
        console.log('Something went wrong: ', event.data);
    })

    socket.addEventListener('message', function (event) {
        console.log('Message from server ', event.data);
    });
}

/* This fixes mobile safari not vertically centering the text correctly at page load */
function initTempo() {
    document.getElementById("bpmValue").textContent = tempo.toString();
}

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
    //initialViewportY = event.touches[0].clientY;
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
    /* Absolute Y coordinate of the touch point, but relative to the arm's top */
    const absTouchY = viewportY - armTop;
    /* Relative Y coordinate of the touch point, 0% (Top of arm) to 100% (Bottom of arm) */
    const relTouchY = absTouchY / 241.22;
    /* Transform translateY percentage of the weightTouchArea, from -13% to 49.1% */
    const armYtransform = 0.621 * relTouchY - 0.13;
    /* Shorten or heighten the sticks above and below the weight */
    const upperStickDelta = 155.8 * relTouchY + 3;
    const lowerStickDelta = 155.5 * relTouchY + 22.5;

    let linearTempo = Math.round(168 * relTouchY + 40);

    if ((40 <= linearTempo) && (linearTempo <= 208)) {
        weightTouchArea.style.transform = "translateY(" + armYtransform * 100 + "%)"
        upperStick.setAttribute('d','m 75.112564,2.4574502 h 8.466667 V '
            + upperStickDelta
            +' h -8.466667 z');
        lowerStick.setAttribute('d','m 75.112625,'
            + lowerStickDelta
            + ' h 8.466667 V 184.55954 h -8.466667 z');

        /*  Since the scale on the metronome isn't linear,
            we need to make some adjustments. These aren't perfect
            yet and still leave out a number of tempi:
            66 - 67, even from 188 - 198 and uneven from 201 - 205
         */
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
        /* Attempt at linear approximation, was not really better
        if ((linearTempo > 39) && (linearTempo < 51)) {
            tempo = linearTempo;
        }
        else if ((linearTempo >= 51) && (linearTempo < 69)) {
            tempo = Math.round((1 / 3) * linearTempo + 34);
        }
        else if ((linearTempo >= 69) && (linearTempo < 81)) {
            tempo = Math.round((2 / 3) * linearTempo + 11);
        }
        else if ((linearTempo >= 81) && (linearTempo < 96)) {
            tempo = linearTempo - 16;
        }
        else if ((linearTempo >= 96) && (linearTempo < 116)) {
            tempo = Math.round((5 / 4) * linearTempo - 40);
        }
        else if ((linearTempo >= 116) && (linearTempo < 200)) {
            tempo = linearTempo - 11;
        }
        else if ((linearTempo >= 200) && (linearTempo < 206.9)) {
            tempo = Math.round((3 / 2) * (linearTempo - 74));
        }
        else {
            tempo = 8 * linearTempo - 1456;
        }
         */
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
function start() {
    const arm = document.getElementById("arm");
    const metronomeArea = document.getElementById("metronome-area");
    const heartDiv = document.getElementById("heartDiv");

    arm.classList.toggle("moveLeft");
    setTimeout(() => {
        arm.style.animationDuration = fullOscillation.toString() + "s";
        arm.classList.toggle("oscillate");
        clickInit();
        arm.classList.toggle("moveLeft");
    }, 500);

    function clickInit() {
        if (arm.classList.contains("oscillate")) {
            setTimeout(() => {
                if (flash === true) {
                    metronomeArea.classList.toggle("flash");
                    heartDiv.classList.toggle("flash");
                    setTimeout(() => {
                        metronomeArea.classList.toggle("flash");
                        heartDiv.classList.toggle("flash");
                    }, 50)
                }
                click();
            }, 250 * fullOscillation);
        }
    }

    function click() {
        if (arm.classList.contains("oscillate")) {
            clickTimeout = setTimeout(() => {
                if (flash === true) {
                    metronomeArea.classList.toggle("flash");
                    heartDiv.classList.toggle("flash");
                    setTimeout(() => {
                        metronomeArea.classList.toggle("flash");
                        heartDiv.classList.toggle("flash");
                    }, 50)
                }
                click();
            }, 500 * fullOscillation);
        }
    }
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

let flash = false;
/**
 *
 */
function toggleFlash() {
    const flashIcon = document.getElementById("flashIcon");
    if (flash === false) {
        flashIcon.style.fill = "#ffdd55";
        flash = true;
    }
    else {
        flashIcon.style.fill = "#f0f0f0";
        flash = false;
    }
}

