// content.js
(async function () {
    const IFRAME_ID = "ai-exercise-iframe";

    // Listen for changes in stored "enforce" flag and "lastInjected"
    chrome.storage.sync.get(["enforceExercise"], data => {
        if (data.enforceExercise) injectIfNeeded();
    });

    // React to runtime messages from exercise.html
    chrome.runtime.onMessage.addListener((msg, sender) => {
        if (msg && msg.exerciseDone) {
            removeIframe();
        }
        if (msg && msg.requestInject) {
            injectIfNeeded();
        }
    });

    // Make sure to remove iframe when navigating away / beforeunload (cleanup)
    window.addEventListener("beforeunload", () => removeIframe());

    function injectIfNeeded() {
        // Avoid injecting into extension pages and PDFs etc.
        if (location.protocol.startsWith("chrome-extension:")) return;

        // If already injected, do nothing
        if (document.getElementById(IFRAME_ID)) return;

        // Create and append iframe
        const iframe = document.createElement("iframe");
        iframe.id = IFRAME_ID;
        iframe.src = chrome.runtime.getURL("exercise.html");
        iframe.style.position = "fixed";
        iframe.style.top = "0";
        iframe.style.left = "0";
        iframe.style.width = "100vw";
        iframe.style.height = "100vh";
        iframe.style.border = "none";
        iframe.style.zIndex = "2147483647"; // high z-index
        iframe.style.background = "white";
        iframe.allow = "camera; microphone; clipboard-read; clipboard-write";
        document.documentElement.appendChild(iframe);
    }

    function removeIframe() {
        const iframe = document.getElementById(IFRAME_ID);
        if (iframe) {
            // Ask iframe to stop webcam safely (in case)
            try {
                iframe.contentWindow.postMessage({ cmd: "stop" }, "*");
            } catch (e) {}
            iframe.remove();
        }
    }
})();
