// background service worker - currently used for relaying messages if needed
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    // No special handling required right now; just keep service worker available.
    // This file exists for future improvements (scheduling, alarms, etc.)
});
