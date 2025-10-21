// popup.js
document.addEventListener("DOMContentLoaded", async () => {
    const exerciseSelect = document.getElementById("exerciseSelect");
    const goalInput = document.getElementById("goalInput");
    const enforceCheckbox = document.getElementById("enforceCheckbox");
    const goalUnit = document.getElementById("goalUnit");
    const saveBtn = document.getElementById("saveBtn");

    // Load saved settings
    chrome.storage.sync.get(["exercise", "goal", "enforceExercise"], data => {
        if (data.exercise) exerciseSelect.value = data.exercise;
        if (data.goal) goalInput.value = data.goal;
        if (data.enforceExercise) enforceCheckbox.checked = data.enforceExercise;
        goalUnit.innerText = (exerciseSelect.value === "KneeHug") ? "seconds" : "reps";
    });

    exerciseSelect.addEventListener("change", () => {
        goalUnit.innerText = (exerciseSelect.value === "KneeHug") ? "seconds" : "reps";
    });

    saveBtn.addEventListener("click", () => {
        const payload = {
            exercise: exerciseSelect.value,
            goal: parseInt(goalInput.value, 10) || 10,
            enforceExercise: enforceCheckbox.checked
        };
        chrome.storage.sync.set(payload, () => {
            // Ask content scripts to inject or remove iframe as needed
            chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
                if (tabs[0]) {
                    chrome.tabs.sendMessage(tabs[0].id, { requestInject: true });
                }
            });
            window.close();
        });
    });
});
