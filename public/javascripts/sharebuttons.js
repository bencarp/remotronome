/* Skype share button */
(function(r, d, s) {
    r.loadSkypeWebSdkAsync = r.loadSkypeWebSdkAsync || function(p) {
        var js, sjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(p.id)) { return; }
        js = d.createElement(s);
        js.id = p.id;
        js.src = p.scriptToLoad;
        js.onload = p.callback
        sjs.parentNode.insertBefore(js, sjs);
    };
    var p = {
        scriptToLoad: 'https://swx.cdn.skype.com/shared/v/latest/skypewebsdk.js',
        id: 'skype_web_sdk'
    };
    r.loadSkypeWebSdkAsync(p);
})(window, document, 'script');

/* Copy to clipboard */
function copyToClipboard() {
    var dummy = document.createElement('input'),
        text = window.location.href;

    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();
    document.execCommand('copy');
    document.body.removeChild(dummy);
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