/* Skype share button */
function skype() {
    /* Blink to show user that a second click is necessary (Prevent tracking cookies at page load) */
    const button = document.getElementById('skype-share');
    setTimeout(function() {
        button.style.display = (button.style.display === 'none' ? '' : 'none');
    }, 500);
    setTimeout(function() {
        button.style.display = (button.style.display === 'none' ? '' : 'none');
    }, 1000);

    const s = "script";
    window.loadSkypeWebSdkAsync = window.loadSkypeWebSdkAsync || function (p) {
        let js, sjs = document.getElementsByTagName(s)[0];
        if (document.getElementById(p.id)) {
            return;
        }
        js = document.createElement(s);
        js.id = p.id;
        js.src = p.scriptToLoad;
        js.onload = p.callback;
        sjs.parentNode.insertBefore(js, sjs);
    };
    const p = {
        scriptToLoad: 'https://swx.cdn.skype.com/shared/v/latest/skypewebsdk.js',
        id: 'skype_web_sdk'
    };
    window.loadSkypeWebSdkAsync(p);
}

/* Copy to clipboard */
function copyToClipboard() {
    const dummy = document.createElement('input'),
        text = window.location.href;

    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();
    document.execCommand('copy');
    document.body.removeChild(dummy);

    const popup = document.getElementById("clipboardPopUp");
    popup.classList.toggle("show");
    setTimeout(() => {
        popup.classList.toggle("show");
        popup.classList.toggle("hidden");
        }, 5000);
}

/* System share (Web share API) */
function systemShare() {
    if (navigator.share) {
        navigator.share({
            title: 'Remotronome',
            text: 'Please join me for a remote jam session at',
            url: window.location.href,
        })
            .then(() => console.log('Successful share'))
            .catch((error) => console.log('Error sharing', error));
    }
}