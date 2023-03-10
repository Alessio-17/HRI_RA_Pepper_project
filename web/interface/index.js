// https://codepen.io/Tbgse/pen/dYaJyJ

//textAnimation('Hello Human! Do you want to play a game?')

let userName = ''
let chosenLevel = 1 //  1 = easy; 2 = medium; 3 = hard
let playerColor = ''
let doneWriting = false

function textAnimation(sentence) {
    let target = document.querySelector('.welcome-text')
    let letterCount = 1
    //let cursor = document.querySelector('.cursor')
    //let cursorVisible = true

    let interval = window.setInterval(function() {
        if (letterCount === sentence.length+1) {
            window.clearInterval(interval)
            doneWriting = true
            return
        }
        target.innerHTML = sentence.substring(0, letterCount)
        letterCount += 1
    }, 100)

/*
    let cursorInterval = window.setInterval(function() {
        if (cursorVisible == true) {
            cursor.className = 'cursor hidden'
            cursorVisible = false
        }
        else {
            cursor.className = 'cursor'
            cursorVisible = true
        }
    }, 600)
*/
}

function changeScene(props, flag='') {
    //let buttons = document.getElementsByTagName('button')

    let buttonContainer = document.querySelector('.button-container')
    if (buttonContainer.children.length != 0) {
        buttonContainer.classList.remove('buttons-in')
        buttonContainer.classList.add('buttons-out')
    }

    buttonContainer.innerHTML = ''
    textAnimation(props.text())

    // Keeps cheking wether the whole sentence has been written to let the buttons appear
    let buttonInterval = window.setInterval(function() {
        if (doneWriting) {
            if (props.buttons.length == 0) {
                window.setTimeout(function() {
        
                    input = document.createElement('input')
                    input.classList.add('input-name')
                    input.addEventListener('keypress', function(e) {
                        if (e.key == 'Enter') {
                            userName = input.value
                            props.listeners[0]()
                        }
                    })
                    buttonContainer.appendChild(input)
        
                }, 1000)
            }
            else {
                window.setTimeout(function() {
            
                    if (flag == 'levelWon') {
                        for (let i=0; i<props.buttons.length; i++) {
                            let button = document.createElement('button')
                            button.classList.add('button')
                            button.innerHTML = props.buttons[i]
                            button.style.backgroundColor = props.colors[i]
                            button.addEventListener('click', props.listeners[i])
                            if (i == chosenLevel) {
                                let buttonDiv = document.createElement('div')
                                buttonDiv.classList.add('button-div')
                                let belowButton = document.createElement('div')
                                belowButton.innerHTML = 'Since you won the previous game, why not try a bigger challenge?'
                                belowButton.classList.add('below-button')

                                buttonDiv.appendChild(button)
                                buttonContainer.appendChild(buttonDiv)
                                button.style.maxWidth = `${button.offsetWidth}px`
                                belowButton.style.top = `${button.offsetHeight}px`
                                belowButton.style.left = `${-button.offsetWidth/2}px`
                                belowButton.style.width = `${button.offsetWidth*2}px`
                                buttonDiv.appendChild(belowButton)
                            }
                            else {
                                buttonContainer.appendChild(button)
                            }
                        }
                    }
                    else {
                        for (let i=0; i<props.buttons.length; i++) {
                            let button = document.createElement('button')
                            button.classList.add('button')
                            button.innerHTML = props.buttons[i]
                            button.style.backgroundColor = props.colors[i]
                            button.addEventListener('click', props.listeners[i])
                            buttonContainer.appendChild(button)
                        }
                    }
        
                    buttonContainer.classList.remove('buttons-out')
                    buttonContainer.classList.add('buttons-in')
            
                }, 200)
            }
            doneWriting = false
            window.clearInterval(buttonInterval)
        }
    })
    

}

function main() {
    let green = '#6ef86e'
    let red = '#ff4a4a'
    let yellow = '#ffd54a'
    let lightblue = '#8cf1e9'

    // *** Welcome screen ***
    let welcome = {
        text: () => 'Hello Human! Do you want to play a game?',
        buttons: ['Yes', 'No'],
        colors: [green, red],
        listeners: [() => changeScene(presentation), () => changeScene(presentation)]
    }

    // *** Presentation screen ***
    let presentation = {
        text: () => `Great, I'm Pepper! What's your name?`,
        buttons: [],
        colors: [],
        listeners: [() => changeScene(isNovice)]
    }

    // *** Ask if has ever played the game ***
    let isNovice = {
        text: () => `${userName}, such a nice name! Have you ever played Connect Four?`,
        buttons: ['Yes', 'No'],
        colors: [green, red],
        listeners: [() => changeScene(playedBefore), 
                    () => {
                        // Has never played before, so we automatically put difficulty to easy
                        chosenLevel = 1
                        changeScene(rules)
                    }
                ]
    }

    // *** User has played the game before ***
    let playedBefore = {
        text: () => 'Great! Do you want to be reminded the rules of the game?',
        buttons: ['Yes', 'No'],
        colors: [green, red],
        listeners: [() => changeScene(rules), () => changeScene(level)]
    }

    // *** Explanation of rules of the game ***
    let rules = {
        text: () => 'Ok, here is how to play:',
        buttons: ['Got it'],
        colors: [lightblue],
        listeners: [() => {
            // if I haven't chosen a level yet, it means that the player has already played the game
            // and is eligible to choose difficulty
            if (chosenLevel === 0) {
                changeScene(level)
            }
            else {
                changeScene(token)
            }
        }]
    }

    // *** Level choice ***
    let level = {
        text: () => 'What difficulty level do you want to play?',
        buttons: ['Easy', 'Medium', 'Hard'],
        colors: [green, yellow, red],
        listeners: [() => {
                        chosenLevel = 1
                        changeScene(token)
                    },
                    () => {
                        chosenLevel = 2
                        changeScene(token)
                    },
                    () => {
                        chosenLevel = 3
                        changeScene(token)
                    }
                ]
    }

    // *** Token color choice ***
    let token = {
        text: () => `Ok, let's start the game, ${userName}! One last thing: which color do you want to play as?`,
        buttons: ['Red', 'Yellow'],
        colors: [red, yellow],
        listeners: [() => {
                        playerColor = 'Red'
                        // vai al gioco
                    },
                    () => {
                        playerColor = 'Yellow'
                        // vai al gioco
                    }
                ]
    }

    // *** Player defeat screen ***
    let playerLost = {
        text: () => `Nice game, ${userName}! You will have better luck next time.`,
        buttons: ['Play again', 'Go to survey'],
        colors: [green, yellow],
        listeners: [() => changeScene(level), () => changeScene('!!survey!!')]
    }

    // *** Player victory screen ***
    let playerWon = {
        text: () => `Congratulations, ${userName}! You defeated me.`,
        buttons: ['Play again', 'Go to survey'],
        colors: [green, yellow],
        listeners: [() => changeScene(level, 'levelWon'), () => changeScene('!!survey!!')]
    }

    // *** Draw screen, when the board is full and no player won ***
    let draw = {
        text: () => `Good job, ${userName}! Both of us were very good.`,
        buttons: ['Play again', 'Go to survey'],
        colors: [green, yellow],
        listeners: [() => changeScene(level, 'levelWon'), () => changeScene('!!survey!!')]
    }

    changeScene(welcome)
}

main()