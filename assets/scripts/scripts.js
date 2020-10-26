// initialize all of the important elements
var main = document.getElementsByTagName('main')[0]
var viewHighscoreLink = document.getElementById('view_highscore_link')
var timeDisplay = document.getElementById('time_display')
var startQuizButton = document.getElementById('start_quiz_button')
var questionNumbersBox = document.getElementById('question_numbers_box')
var questionDisplay = document.getElementById('question_display')
var answersList = document.getElementById('answer_list')
var answerFeedback = document.getElementById('feedback')
var scoreDisplay = document.getElementById('score_display')
var initialsInput = document.getElementById('initials_input')
var submitInitialsButton = document.getElementById('submit_initials_button')
var highscoreList = document.getElementById('highscore_list')
var goToStartingPageButton = document.getElementById('go_to_starting_page_button')
var clearHighscoresButton = document.getElementById('clear_highscores_button')

// a list of questions to be asked
const questions = [ // an array that holds the list of questions and their answers
    {
        "question": "String values must be enclosed within ______ when being assigned to variables.",
        "answers": ["commas", "curly brackets", "quotes", "parentheses"],
        "correct_index": 2
    }, {
        "question": "A very useful tool used during development and debugging for printing content to the debugger is:",
        "answers": ["for loops", "console.log", "terminal / bash", "JavaScript"],
        "correct_index": 1
    }, {
        "question": "Commonly used data types DO NOT include:",
        "answers": ["alerts", "numbers", "strings", "booleans"],
        "correct_index": 0
    }, {
        "question": "The condition in an if/else statement is enclosed within ______.",
        "answers": ["quotes", "curly brackets", "square brackets", "parentheses"],
        "correct_index": 3
    }
]

// score tracking variables
const startingTime = 120 // the amount of time that will be given the the user to answer all of the questions in seconds
const timePenalty = 10 // the amount of time that will be given the the user to answer all of the questions in seconds
var remainingTime // the amount of time left on the clock
var timer // the interval timer
var score // the number of correct questions

/** Set up the pages and get the quiz ready. */
function init() {
    // Add all of the event listeners
    startQuizButton.addEventListener('click', event => {
        event.preventDefault()
        displayQuestionPage()
    })
    answersList.addEventListener('click', event => {
        event.preventDefault()
        if (event.target.matches('button')) {
            var button = event.target
            if (button.classList.contains('correct')) {
                answerFeedback.textContent = "Correct!"
                questionNumbersBox.children[nextQuestionIndex - 1].classList.add('correct')
                score++
            } else {
                answerFeedback.textContent = "Wrong!"
                questionNumbersBox.children[nextQuestionIndex - 1].classList.add('wrong')
                remainingTime -= timePenalty
            }
            displayNextQuestion()
        }
    })
    submitInitialsButton.addEventListener('click', event => {
        event.preventDefault()
        let initials = initialsInput.value.toUpperCase()
        if (initials) {
            let highscores = JSON.parse(localStorage.getItem('highscores')) || []
            
            timestamp = Date.now()
            highscores.push({
                'timestamp': timestamp,
                'score': score,
                'initials': initials,
                'timeRemaining': remainingTime
            })
            
            highscores = highscores.sort((a, b) => {
                if (a.score != b.score) return b.score - a.score
                if (a.timeRemaining != b.timeRemaining) return b.timeRemaining - a.timeRemaining
                if (a.timestamp != b.timestamp) return a.timestamp - b.timestamp
                return 0
            })

            localStorage.setItem('highscores', JSON.stringify(highscores))
            
            displayHighscorePage()
            initialsInput.value = ""
        }
    })
    goToStartingPageButton.addEventListener('click', event => {
        event.preventDefault()
        displayStartingPage()
    })
    clearHighscoresButton.addEventListener('click', event => {
        event.preventDefault()
        localStorage.setItem('highscores', "{}")
    })
    viewHighscoreLink.addEventListener('click', event => {
        event.preventDefault()
        displayHighscorePage()
    })
    
    // display the starting page
    displayStartingPage()
}

/** Hide all of the pages except for the one with given id.
 * 
 * @param {number} id the id of the page that should be displayed
 */
function displayPage(id) {
    main.querySelectorAll('.page').forEach(page => {
        if (page.id == id) {
            page.classList.remove('hidden')
        } else {
            page.classList.add('hidden')
        }
    })
    return 4
}

/** Display the starting page. */
function displayStartingPage() {
    displayPage('starting_page')
    
    remainingTime = 0
    timeDisplay.textContent = formatSeconds(remainingTime)
}

var nextQuestionIndex // The index of question currently being displayed to the user 
var randomizedQuestions // A randomly sorted clone of the questions array

/** Display the questions page. */
function displayQuestionPage() {
    displayPage('question_page')

    // setup the question numbers
    questionNumbersBox.innerHTML = ""
    questionNumbers = []

    for (let i = 0; i < questions.length; i++) {
        const element = questions[i];
        var el = document.createElement('span')
        el.textContent = i + 1
        questionNumbersBox.appendChild(el)
    }

    // create a randomly sorted clone of the questions array to use for this quiz
    randomizedQuestions = randomizeArray(questions)

    // reset the values to back to their defaults
    nextQuestionIndex = 0
    score = 0

    // start the timer
    startTimer()

    // setup the first question
    displayNextQuestion()
}

/** Display the next question. */
function displayNextQuestion() {
    if (nextQuestionIndex < questions.length) {
        // get the question and answers from the 
        const question = randomizedQuestions[nextQuestionIndex].question
        const answers = randomizedQuestions[nextQuestionIndex].answers
        const randomizedAnswers = randomizeArray(answers)
        const correctAnswer = answers[randomizedQuestions[nextQuestionIndex].correct_index]
        
        questionDisplay.textContent = question
        answersList.innerHTML = ""
        answerFeedback.textContent = ""

        for (let i = 0; i < randomizedAnswers.length; i++) {
            let answer = randomizedAnswers[i]
            let button = document.createElement("button")
            button.classList.add('answer')
            if (answer == correctAnswer)
                button.classList.add('correct')
            button.textContent = `${i + 1}. ${answer}`
            answersList.appendChild(button)
        }

        nextQuestionIndex++
    } else {
        clearInterval(timer)
        displayGetNamePage()
    }
}

/** Display the get name page. */
function displayGetNamePage() {
    displayPage('get_name_page')
    scoreDisplay.textContent = score
}

/** Display the highscore page. */
function displayHighscorePage() {
    displayPage('highscore_page')

    highscoreList.innerHTML = ""

    let highscores = JSON.parse(localStorage.getItem('highscores'))
    
    let i = 0
    for (const key in highscores) {
        i++
        let highscore = highscores[key]
        var el = document.createElement('div')
        let initials = highscore.initials.padEnd(3, ' ')
        let playerScore = highscore.score.toString().padStart(3, ' ')
        let timeRemaining = formatSeconds(highscore.timeRemaining)
        el.textContent = `${i}. ${initials} - Score: ${playerScore} - Time Remaining: ${timeRemaining}`
        highscoreList.appendChild(el)
    }
}

/** Take any array and return a randomly sorted clone.
 * 
 * @param {array} array the array that will be cloned
 */
function randomizeArray(array) {
    clone = [...array]
    output = []
    
    while (clone.length > 0) {
        let r = Math.floor(Math.random() * clone.length);
        let i = clone.splice(r, 1)[0]
        output.push(i)
    }

    return output
}

/** Start the count down timer */
function startTimer() {
    remainingTime = startingTime
    timeDisplay.textContent = formatSeconds(remainingTime)
    
    timer = setInterval(function() {
        remainingTime--
    
        if (remainingTime < 0) {
            clearInterval(timer)
        } else {
            timeDisplay.textContent = formatSeconds(remainingTime)
        }
    
    }, 1000)
}

/** Convert a given number of seconds to a 'M:SS' format
 * 
 * @param {number} seconds 
 */
function formatSeconds(seconds) {
    let m = Math.floor(seconds / 60)
    let s = ("0" + (seconds % 60)).slice(-2)
    return `${m}:${s}`
}

init()