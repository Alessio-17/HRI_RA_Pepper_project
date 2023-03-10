
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
    }

    setGoal(row) {
        document.querySelector(`#cell-${row}5`).style.borderRight = '10px solid #08ff00'
    }
    
    printStatus() {
        console.log(`${this.size}x${this.size} board`)
        for (let row of this.status) {
            console.log(row.join(' '))
        } 
    }
}

class Piece {
    constructor(id, orientation, size, row, col, board) {
        this.id = id
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
        this.board.printStatus()
    }

    getCells() {
        let list = []
        for (let i=0; i<this.size; i++) {
            if (this.orientation == 'horizontal') {
                list.push(document.querySelector(`#cell-${this.row}${this.col+i}`))
            }
            else if (this.orientation == 'vertical') {
                list.push(document.querySelector(`#cell-${this.row+i}${this.col}`))
            }
        }
        return list
    }

    checkMove(direction) {
        if (direction == 'left') {
            if (this.orientation == 'vertical' || this.col == 0 || this.board.status[this.row][this.col-1] != '_') {
                throw new Error('Can\'t move left')
            }
        }
        else if (direction == 'right') {
            if (this.orientation == 'vertical' || this.col+this.size == this.board.size || this.board.status[this.row][this.col+this.size] != '_') {
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
                this.board.status[this.row][this.col+i] = '_'
                let cell = document.querySelector(`#cell-${this.row}${this.col+i}`)
                cell.style.backgroundColor = 'white'
                cell.style.borderRight = '1px solid black'
                cell.style.borderBottom = '1px solid black'
                if (this.row == 0) {cell.style.borderTop = '1px solid black'}
                if (this.col+i == 0) {cell.style.borderLeft = '1px solid black'}
            }
        }
        else if (this.orientation == 'vertical') {
            for (let i=0; i<this.size; i++) {
                this.board.status[this.row+i][this.col] = '_'
                let cell = document.querySelector(`#cell-${this.row+i}${this.col}`)
                cell.style.backgroundColor = 'white'
                cell.style.borderRight = '1px solid black'
                cell.style.borderBottom = '1px solid black'
                if (this.row+i == 0) {cell.style.borderTop = '1px solid black'}
                if (this.col == 0) {cell.style.borderLeft = '1px solid black'}
            }
        }
    }

    setBoard() {
        if (this.orientation == 'horizontal') {
            for (let i=0; i<this.size; i++) {
                this.board.status[this.row][this.col+i] = this.id
                let cell = document.querySelector(`#cell-${this.row}${this.col+i}`)
                cell.style.backgroundColor = this.id
                if (i == 0) {
                    cell.style.borderTopLeftRadius = '20px'
                    cell.style.borderBottomLeftRadius = '20px'
                }
                if (i == this.size-1) {
                    cell.style.borderTopRightRadius = '20px'
                    cell.style.borderBottomRightRadius = '20px'
                }
                if (i != this.size-1) {
                    cell.style.borderRight = `1px solid ${this.id}`
                }
            }
        }
        else if (this.orientation == 'vertical') {
            for (let i=0; i<this.size; i++) {
                this.board.status[this.row+i][this.col] = this.id
                let cell = document.querySelector(`#cell-${this.row+i}${this.col}`)
                cell.style.backgroundColor = this.id
                if (i != this.size-1) {
                    cell.style.borderBottom = `1px solid ${this.id}`
                }
            }
        }
        this.board.setGoal(2)
    }

    highlight() {
        let cells = this.getCells()
        for (let i=0; i<this.size; i++) {
            //cells[i].style.opacity = 0.5
            cells[i].style.boxShadow = '5px 5px 0 #000'
            cells[i].style.zIndex = '10'
            if (i == this.size-1) {cells[i].style.zIndex = 100}
        }
    }

    dehighlight() {
        let cells = this.getCells()
        for (let i=0; i<this.size; i++) {
            cells[i].style.opacity = 1
            cells[i].style.boxShadow = 'none'
            cells[i].style.zIndex = '1'
        }
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
    let colors = ['#ff5454', '#ff9c54', '#ffdc54', '#b4ff54', '#54ffdc', '#54b4ff', '#5454ff', '#9c54ff', '#dc54ff', '#ff54b4']
    let htmlBoard = document.querySelector('.board')
    let board = new Board(htmlBoard)

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
                for (let piece in board.pieces) {
                    if (piece == cell.style.backgroundColor) {
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

    let buttons = document.getElementsByClassName('arrow-keys')
    console.log(buttons)
    for (let button of buttons) {
        button.addEventListener('click', () => {
            try {
                selectedPiece.move(button.id)
                logs.innerText = ''
            }
            catch(err) {
                logs.innerText = err
            }
        })
    }

    new Piece('red', 'horizontal', 2, 2, 1, board)
    new Piece('lightgreen', 'horizontal', 2, 0, 0, board)
    new Piece('violet', 'vertical', 3, 1, 0, board)
    new Piece('orange', 'vertical', 2, 4, 0, board)
    new Piece('darkgreen', 'horizontal', 3, 5, 2, board)
    new Piece('dodgerblue', 'vertical', 3, 1, 3, board)
    new Piece('lightblue', 'horizontal', 2, 4, 4, board)
    new Piece('yellow', 'vertical', 3, 0, 5, board)

    board.setGoal(2)
    board.printStatus()

}

main()