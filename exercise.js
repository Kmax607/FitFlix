const URL = chrome.runtime.getURL("my_model/");
let model, webcam, labelContainer, maxPredictions;
let counter = 0;
let lastPosition = "";
let goal = 10; // default
let currentExercise = "JumpingJacks";

async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    const flip = true;
    webcam = new tmImage.Webcam(200, 200, flip);
    await webcam.setup();
    await webcam.play();
    window.requestAnimationFrame(loop);

    document.getElementById("webcam-container").appendChild(webcam.canvas);
    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) {
        labelContainer.appendChild(document.createElement("div"));
    }
}

async function loop() {
    webcam.update();
    await predict();
    window.requestAnimationFrame(loop);
}

async function predict() {
    const prediction = await model.predict(webcam.canvas);

    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction =
            prediction[i].className + ": " + prediction[i].probability.toFixed(2);
        labelContainer.childNodes[i].innerHTML = classPrediction;
    }

    let bestMatch = prediction.reduce((prev, current) =>
        prev.probability > current.probability ? prev : current
    );

    // Simple Jumping Jack example:
    if (bestMatch.className === "JackUp" && bestMatch.probability > 0.8) {
        if (lastPosition === "JackOut") {
            counter++;
            document.getElementById("counter").innerText = counter;

            if (counter >= goal) {
                // Let the content script know the exercise is done
                chrome.runtime.sendMessage({ exerciseDone: true });
            }
        }
        lastPosition = "JackUp";
    } else if (bestMatch.className === "JackOut" && bestMatch.probability > 0.8) {
        lastPosition = "JackOut";
    }
}

init();
