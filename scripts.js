const playButton = document.getElementById('btn-play');
const quizHeader = document.getElementById('quiz-header');
const answersList = document.getElementById('answers-list');
const timerText = document.getElementById('timer');
const recordText = document.getElementById('record');
const helpTextPlay = document.getElementById('help-text');
const streakIndicator = document.getElementById('streak-indicator')
var recordVar = 0;
var questionTimer, nextQuestionTimer;
const timerMessage = document.getElementById('timer-message');
const DEFAULT_QUESTION = "https://opentdb.com/api.php?amount=1&type=multiple&difficulty=easy";

playButton.addEventListener('click', function () {
    this.classList.add('invisible');
    generateQuestion().then(() => {
        helpTextPlay.classList.add('invisible');
        streakIndicator.classList.remove('invisible');
        recordVar = 0;
        recordText.innerText = recordVar;
    }).catch(e => console.log(e))
})

async function generateQuestion() {
    timerMessage.classList.add('invisible');
    timerText.style.color = 'black';
    //Empty the answers list everytime a question is generated
    answersList.innerHTML = "";
    let answers = [];
    try {
        //Ask the api for a new question
        const res = await axios.get(DEFAULT_QUESTION)
        console.log(res.data.results[0].question);

        //Set the question as header
        quizHeader.innerHTML = res.data.results[0].question

        //Insert every answer in the answers array
        answers.push({ answer: res.data.results[0].correct_answer, correct: true });
        res.data.results[0].incorrect_answers.forEach(answer => {
            answers.push({ answer: answer, correct: false });
        })
        //Shuffle the answers array so the correct answer won't be always the first one
        shuffle(answers);
        console.log(answers);

        //Create a button for each answer, and set its text and status (correct/false)
        for (let i = 0; i < 4; i++) {
            const newButton = document.createElement('Button');
            newButton.innerHTML = answers[i].answer;
            newButton.classList.add('answer', 'btn', 'btn-light', 'border', 'question-answers', 'fw-light');
            answers[i].correct === true ? newButton.id = "correct" : newButton.id = "false";
            answersList.appendChild(newButton);
            newButton.addEventListener('click', function () {
                checkAnswer(true, this)
            });
        }
        startTimer();

    } catch (e) {
        console.log(e);
    }
}

const checkAnswer = (selected = true, obj) => {
    console.log(obj);
    if (selected != true) {
        answersList.childNodes.forEach(child => {
            child.disabled = true;
            if (child.id === "correct") {
                child.style.backgroundColor = 'green';
                child.style.color = 'white';
            }
        })
        fail();
        return;
    }
    clearInterval(questionTimer);
    disableAnswers();
    if (obj.id === "correct") {
        console.log('Congratulations!')
        recordVar++;
        recordText.innerText = recordVar;
        let timeSeconds = 5;
        nextQuestionTimer = setInterval(function () {
            timerText.innerText = `Next question in: ${timeSeconds} seconds`;
            timeSeconds--;
            if (timeSeconds === 0) {
                clearInterval(nextQuestionTimer);

            }
        }, 1000);
        setTimeout(generateQuestion, 6000);
        timerMessage.classList.remove('invisible');
        timerMessage.style.color = 'green';
        timerMessage.innerText = `Correct answer!`;
    } else {
        fail(obj);
    }
    answersList.childNodes.forEach(child => {
        child.disabled = true;
        if (child.id === "correct") {
            child.style.backgroundColor = 'green';
            child.style.color = 'white';
        }
    })
}


function fail(obj) {
    if (obj != undefined) {
        timerText.style.color = 'red';
        timerText.innerText = `Wrong answer!`;
        obj.style.backgroundColor = 'red';
        obj.style.color = 'white';
    }

    playButton.innerText = "PLAY AGAIN"
    playButton.classList.remove('invisible');
    playButton.classList.add('play-again')
}

function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}

function startTimer() {
    let timeSeconds = 15;
    questionTimer = setInterval(function () {
        timerText.innerText = `Time left: ${timeSeconds} seconds`;
        timeSeconds--;
        if (timeSeconds === -1) {
            timerText.style.color = 'red';
            timerText.innerText = `Time's Up!`;

            clearInterval(questionTimer);
            disableAnswers();
            checkAnswer(false);
        }
    }, 1000);
}

function disableAnswers() {
    answersList.childNodes.forEach(child => {
        child.disabled = true;
    })
}