
// a 6x6 board
class Board {
    constructor(htmlBoard) {
        this.size = 6
        this.status = [['_', '_', '_', '_', '_', '_'],
                        ['_', '_', '_', '_', '_', '_'],
                        ['_', '_', '_', '_', '_', '_'],
                        ['_', '_', '_', '_', '_', '_'],
                        ['_', '_', '_', '_', '_', '_'],
                        ['_', '_', '_', '_', '_', '_']]
        this.htmlBoard = htmlBoard
        this.pieces = {}
        this.colors = ['#ff5454', '#ff9c54', '#ffdc54', '#b4ff54', '#54ffdc', '#54b4ff', '#5454ff', '#9c54ff', '#dc54ff', '#ff54b4']
        this.goal = 0
    }

    setup(config) {
        let cars = JSON.parse(config.cars)
        let trucks = JSON.parse(config.trucks)
        for (let car of cars) {
            let orientation = 'horizontal'
            if (car[1] != car[3]) {orientation = 'vertical'}
            if (car[0] == 1) {
                new Piece(car[0], 'red', orientation, 2, car[1]-1, car[2]-1, this)
                this.goal = car[1]-1
                this.setGoal()
            }
            else {
                new Piece(car[0], this.colors.shift(), orientation, 2, car[1]-1, car[2]-1, this)
            }
        }
        for (let truck of trucks) {
            let orientation = 'horizontal'
            if (truck[1] != truck[3]) {orientation = 'vertical'}
            new Piece(truck[0], this.colors.shift(), orientation, 3, truck[1]-1, truck[2]-1, this)
        }
    }

    setGoal() {
        document.querySelector(`#cell-${this.goal}5`).style.borderRight = '10px solid #08ff00'
    }

    hasWon() {
        if (this.status[this.goal][this.size-1] == '1') {
            console.log('You won!')
            return true
        }
    }

    exportStatus() {
        let cars = []
        let trucks = []

        for (let piece of Object.values(this.pieces)) {
            let vehicle = [piece.id, piece.row+1, piece.col+1]
            if (piece.orientation == 'horizontal') {
                vehicle.push(piece.row+1)
                vehicle.push(piece.col)
            }
            else if (piece.orientation == 'vertical') {
                vehicle.push(piece.row+2)
                vehicle.push(piece.col+1)
            }

            if (piece.size == 2) {
                cars.push(vehicle)
            }
            else if (piece.size == 3) {
                if (piece.orientation == 'horizontal') {
                    vehicle.push(piece.row+1)
                    vehicle.push(piece.col-1)
                }
                else if (piece.orientation == 'vertical') {
                    vehicle.push(piece.row+3)
                    vehicle.push(piece.col+1)
                }
                trucks.push(vehicle)
            }
        }
        return {'id': 'boardStatus', 'cars': cars, 'trucks': trucks}
    }
    
    printStatus() {
        console.log(`${this.size}x${this.size} board`)
        for (let row of this.status) {
            console.log(row.join(' '))
        } 
    }
}

class Piece {
    constructor(id, color, orientation, size, row, col, board) {
        this.id = id
        this.color = color
        this.orientation = orientation
        this.size = size
        this.row = row
        this.col = col

        this.board = board
        //this.board.setPiece(this)
        this.board.pieces[this.id] = this
        this.setBoard()
    }

    move(direction) {
        this.checkMove(direction)
        this.reset()
        this.dehighlight()
        if (direction == 'left') {this.col -= 1}
        else if (direction == 'right') {this.col += 1}
        else if (direction == 'up') {this.row -= 1}
        else if (direction == 'down') {this.row += 1}
        this.setBoard()
        if (this == selectedPiece) {
            this.highlight()
        }
        this.board.hasWon()
        this.board.printStatus()
    }

    getCells() {
        let list = []
        for (let i=0; i<this.size; i++) {
            if (this.orientation == 'horizontal') {
                list.push(document.querySelector(`#cell-${this.row}${this.col-i}`))
            }
            else if (this.orientation == 'vertical') {
                list.push(document.querySelector(`#cell-${this.row+i}${this.col}`))
            }
        }
        return list
    }

    checkMove(direction) {
        if (direction == 'left') {
            if (this.orientation == 'vertical' || this.col-this.size+1 == 0 || this.board.status[this.row][this.col-this.size] != '_') {
                throw new Error('Can\'t move left')
            }
        }
        else if (direction == 'right') {
            if (this.orientation == 'vertical' || this.col+1 == this.board.size || this.board.status[this.row][this.col+1] != '_') {
                throw new Error('Can\'t move right')
            }
        }
        else if (direction == 'up') {
            if (this.orientation == 'horizontal' || this.row == 0 || this.board.status[this.row-1][this.col] != '_') {
                throw new Error('Can\'t move up')
            }
        }
        else if (direction == 'down') {
            if (this.orientation == 'horizontal' || this.row+this.size == this.board.size || this.board.status[this.row+this.size][this.col] != '_') {
                throw new Error('Can\'t move down')
            }
        }
        else {
            throw new Error(`${direction} is not an admissible direction`)
        }
    }

    reset() {
        if (this.orientation == 'horizontal') {
            for (let i=0; i<this.size; i++) {
                this.board.status[this.row][this.col-i] = '_'
                let cell = document.querySelector(`#cell-${this.row}${this.col-i}`)
                cell.style.backgroundColor = 'white'
                cell.style.borderRight = '1px solid black'
                cell.style.borderBottom = '1px solid black'
                cell.classList.remove(this.id)
                if (this.row == 0) {cell.style.borderTop = '1px solid black'}
                if (this.col-i == 0) {cell.style.borderLeft = '1px solid black'}
            }
        }
        else if (this.orientation == 'vertical') {
            for (let i=0; i<this.size; i++) {
                this.board.status[this.row+i][this.col] = '_'
                let cell = document.querySelector(`#cell-${this.row+i}${this.col}`)
                cell.style.backgroundColor = 'white'
                cell.style.borderRight = '1px solid black'
                cell.style.borderBottom = '1px solid black'
                cell.classList.remove(this.id)
                if (this.row+i == 0) {cell.style.borderTop = '1px solid black'}
                if (this.col == 0) {cell.style.borderLeft = '1px solid black'}
            }
        }
    }

    setBoard() {
        if (this.orientation == 'horizontal') {
            for (let i=0; i<this.size; i++) {
                console.log(this.board.status)
                console.log(this.row)
                this.board.status[this.row][this.col-i] = this.id
                let cell = document.querySelector(`#cell-${this.row}${this.col-i}`)
                cell.style.backgroundColor = this.color
                cell.classList.add(this.id)
                /*
                if (i == 0) {
                    cell.style.borderTopLeftRadius = '20px'
                    cell.style.borderBottomLeftRadius = '20px'
                }
                if (i == this.size-1) {
                    cell.style.borderTopRightRadius = '20px'
                    cell.style.borderBottomRightRadius = '20px'
                }
                */
                if (i == this.size-1) {
                    cell.style.borderRight = `1px solid ${this.color}`
                }
            }
        }
        else if (this.orientation == 'vertical') {
            for (let i=0; i<this.size; i++) {
                this.board.status[this.row+i][this.col] = this.id
                let cell = document.querySelector(`#cell-${this.row+i}${this.col}`)
                cell.style.backgroundColor = this.color
                cell.classList.add(this.id)
                if (i != this.size-1) {
                    cell.style.borderBottom = `1px solid ${this.color}`
                }
            }
        }
    }

    highlight() {
        let cells = []
        for (let i=0; i<this.size; i++) {
            if (this.orientation == 'horizontal') {
                cells.push(document.querySelector(`#cell-${this.row}${this.col-i}`))
            }
            else if (this.orientation == 'vertical') {
                cells.push(document.querySelector(`#cell-${this.row+i}${this.col}`))
            }
        }
        for (let i=0; i<this.size; i++) {
            //cells[i].style.opacity = 0.5
            cells[i].style.boxShadow = '5px 5px 0 #000'
            cells[i].style.zIndex = '10'
            if (this.orientation == 'horizontal') {
                if (i == 0) {cells[i].style.zIndex = 100}
            }
        }
    }

    dehighlight() {
        let cells = this.getCells()
        for (let i=0; i<this.size; i++) {
            cells[i].style.opacity = 1
            cells[i].style.boxShadow = 'none'
            cells[i].style.zIndex = '1'
        }
        this.board.setGoal()
    }
}

/*
module.exports = {
    Board: Board,
    Piece: Piece
}
*/

let selectedPiece = null

function main() {
    let logs = document.querySelector('.logs')
    let htmlBoard = document.querySelector('.board')
    let board = new Board(htmlBoard)

    let ws = new WebSocket('ws://localhost:9000/websocketserver')
    ws.onopen = function() {
        ws.send('Opened web client socket')
    }
    ws.onmessage = function(e) {
        console.log(e.data)
        let config = JSON.parse(e.data)
        if (config.id.includes('level')) {
            board.setup(config)
        }
        else if (config.id == 'nextMove') {
            console.log('NUOVA MOSSA ARRIVATAAAAA')
            console.log(config)
            let movingPiece = board.pieces[config.vehicle]
            console.log(movingPiece)
            for (let i=0; i<config.nCells; i++) {
                console.log('entrato nel for')
                console.log(movingPiece.orientation)
                console.log(config.move_type)
                if (movingPiece.orientation == 'horizontal' && config.move_type == 'forward') {
                    movingPiece.move('right')
                    console.log(`Planner said: move piece ${config.vehicle} right`)
                }
                else if (movingPiece.orientation == 'horizontal' && config.move_type == 'backward') {
                    movingPiece.move('left')
                    console.log(`Planner said: move piece ${config.vehicle} left`)
                }
                else if (movingPiece.orientation == 'vertical' && config.move_type == 'forward') {
                    movingPiece.move('up')
                    console.log(`Planner said: move piece ${config.vehicle} up`)
                }
                else if (movingPiece.orientation == 'vertical' && config.move_type == 'backward') {
                    movingPiece.move('down')
                    console.log(`Planner said: move piece ${config.vehicle} down`)
                }
            }
            //board.setup(config)
        }
    }


    for (let i = 0; i < board.size; i++) {
        let row = document.createElement('div')
        row.classList.add('row')
        htmlBoard.appendChild(row)

        for (let j = 0; j < board.size; j++) {
            let cell = document.createElement('div')
            cell.classList.add('cell')
            cell.id = `cell-${i}${j}`
            if (i == 0) {cell.style.borderTop = '1px solid black'}
            if (j == 0) {cell.style.borderLeft = '1px solid black'}
            cell.addEventListener('click', () => {
                console.log(board.pieces)
                for (let piece in board.pieces) {
                    console.log(board.pieces[piece].color)
                    if (cell.classList.contains(piece)) {
                        if (selectedPiece != null) {
                            selectedPiece.dehighlight()
                        }
                        selectedPiece = board.pieces[piece]
                        selectedPiece.highlight()
                        console.log(selectedPiece)
                        return
                    }   
                }
                console.log('oggetto non trovato')
            })   
            row.appendChild(cell)
        }
    }

    let startButton1 = document.querySelector('.level1')
    startButton1.addEventListener('click', () => {
        ws.send(JSON.stringify({id: 'level1'}))
    })
    let startButton2 = document.querySelector('.level2')
    startButton2.addEventListener('click', () => {
        ws.send(JSON.stringify({id: 'level2'}))
    })
    let startButton3 = document.querySelector('.level3')
    startButton3.addEventListener('click', () => {
        ws.send(JSON.stringify({id: 'level3'}))
    })
    let exportButton = document.querySelector('.export')
    exportButton.addEventListener('click', () => {
        console.log(board.exportStatus())
    })

    let buttons = document.getElementsByClassName('arrow-keys')
    console.log(buttons)
    for (let button of buttons) {
        button.addEventListener('click', () => {
            try {
                selectedPiece.move(button.id)
                logs.innerText = ''
                //ws.send(`Moved ${selectedPiece.id} ${button.id}`)
                ws.send(JSON.stringify(board.exportStatus()))
            }
            catch(err) {
                logs.innerText = err
            }
        })
    }

    /*
    new Piece('red', 'horizontal', 2, 2, 1, board)
    new Piece('lightgreen', 'horizontal', 2, 0, 0, board)
    new Piece('violet', 'vertical', 3, 1, 0, board)
    new Piece('orange', 'vertical', 2, 4, 0, board)
    new Piece('darkgreen', 'horizontal', 3, 5, 2, board)
    new Piece('dodgerblue', 'vertical', 3, 1, 3, board)
    new Piece('lightblue', 'horizontal', 2, 4, 4, board)
    new Piece('yellow', 'vertical', 3, 0, 5, board)
    */


    board.printStatus()

}

main()