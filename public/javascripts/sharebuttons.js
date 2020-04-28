/* Skype share button */
(function(r, d, s) {
    r.loadSkypeWebSdkAsync = r.loadSkypeWebSdkAsync || function(p) {
        let js, sjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(p.id)) { return; }
        js = d.createElement(s);
        js.id = p.id;
        js.src = p.scriptToLoad;
        js.onload = p.callback
        sjs.parentNode.insertBefore(js, sjs);
    };
    const p = {
        scriptToLoad: 'https://swx.cdn.skype.com/shared/v/latest/skypewebsdk.js',
        id: 'skype_web_sdk'
    };
    r.loadSkypeWebSdkAsync(p);
})(window, document, 'script');

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