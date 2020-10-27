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
        'question': 'String values must be enclosed within ______ when being assigned to variables.',
        'answers': ['commas','curly brackets','quotes','parentheses'],
        'correct_index': 2
    }, {
        'question': 'A very useful tool used during development and debugging for printing content to the debugger is:',
        'answers': ['for loops','console.log','terminal / bash','JavaScript'],
        'correct_index': 1
    }, {
        'question': 'Commonly used data types DO NOT include:',
        'answers': ['alerts','numbers','strings','booleans'],
        'correct_index': 0
    }, {
        'question': 'The condition in an if/else statement is enclosed within ______.',
        'answers': ['quotes','curly brackets','square brackets','parentheses'],
        'correct_index': 3
    }, {
        'question': 'Which program is used by web clients to view the web pages?',
        'answers': ['Web browser','Protocol','Web server','Search Engine'],
        'correct_index': 0
    }, {
        'question': 'The ______ attribute is used to identify the values of variables.',
        'answers': ['text','http-equiv','content','name'],
        'correct_index': 2
    }, {
        'question': 'Which tag is used to identify the keywords describing the site?',
        'answers': ['Comment tag','Title tag','Meta tag','Anchor tag'],
        'correct_index': 2
    }, {
        'question': 'Which are used with a tag to modify its function?',
        'answers': ['Files','Functions','Attributes','Documents'],
        'correct_index': 2
    }, {
        'question': 'This is a declaration that IS NOT an html tag.  it is an instruction to the web browser about what version of HTML a web page is written in.',
        'answers': ['html','doctype','head','body'],
        'correct_index': 1
    }, {
        'question': 'Content information that appears between the oppening and closing ______ tags will show up in a browser view.',
        'answers': ['body','html','head','table'],
        'correct_index': 0
    }, {
        'question': 'What tag element will display a line across the screen?',
        'answers': ['br','a','hr','line'],
        'correct_index': 2
    }, {
        'question': 'In a/an ______ list numbers and roman numerals can appear.',
        'answers': ['Unordered','Ordered','Definition','Straight line'],
        'correct_index': 1
    }, {
        'question': 'This is a language used for describing the look and formatting of a document written in markup language.',
        'answers': ['HTML','CSS','JSON','XML'],
        'correct_index': 1
    }, {
        'question': 'There are ______ characters in the hexidecimal color code combining color shades of red, green, and blue.',
        'answers': ['4','5','6','7'],
        'correct_index': 2
    }, {
        'question': 'Which HTML tag is used to communicate with search engines and describe the Web page\'s content?',
        'answers': ['meta','html','body','head'],
        'correct_index': 0
    }, {
        'question': 'Which term describes the skeletal layout of a Web page, without colors or graphics? ',
        'answers': ['A wireframe','Mind map','Template','Goals'],
        'correct_index': 0
    }
]

// score tracking variables
const startingTime = questions.length * 8 // the amount of time that will be given the the user to answer all of the questions in seconds
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
            if (remainingTime > 0) displayNextQuestion()
            else displayGetNamePage()
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
        localStorage.setItem('highscores', "[]")
        displayHighscorePage()
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
    
    clearInterval(timer)
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
    if (remainingTime < 0) remainingTime = 0
    timeDisplay.textContent = formatSeconds(remainingTime)
    scoreDisplay.textContent = score
}

/** Display the highscore page. */
function displayHighscorePage() {
    displayPage('highscore_page')
    questionNumbersBox.innerHTML = ""

    highscoreList.innerHTML = ""

    clearInterval(timer)

    let highscores = JSON.parse(localStorage.getItem('highscores'))
    
    let i = 0
    for (const key in highscores) {
        i++
        let highscore = highscores[key]
        var el = document.createElement('div')
        let initials = highscore.initials.padEnd(3, ' ')
        let playerScore = highscore.score.toString().padStart(3, ' ')
        let timeRemaining = formatSeconds(highscore.timeRemaining)
        el.textContent = `${i}. ${initials} - Score: ${playerScore} - Time: ${timeRemaining}`
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
            displayGetNamePage()
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
    let m = Math.floor(seconds / 60).toString().padStart(2, ' ')
    let s = ("0" + (seconds % 60)).slice(-2)
    return `${m}:${s}`
}

init()