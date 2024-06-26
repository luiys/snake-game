const box = document.getElementById('box')
if (!box) throw new Error("Box não encontrada");

const deadScreen = document.getElementById('dead')
const buttonRestart = document.getElementById('restart')

if (!buttonRestart) throw new Error("Botão não encontrado");
buttonRestart.onclick = restart

//225
const numeroInicialDeCelulas = 225

const border = { top: [0], left: [0] as number[], right: [] as number[], bottom: [] as number[] }
function criarTamanhoDoMapa(numeroDeCelulas: number) {

    const raiz = Math.sqrt(numeroDeCelulas);
    const cellsPerRowAndColumns = Math.floor(raiz);
    const totalNumberOfCells = cellsPerRowAndColumns * cellsPerRowAndColumns

    border.right.push(cellsPerRowAndColumns - 1)
    for (let i = 1; i < cellsPerRowAndColumns; i++) {
        border.top.push(i)
        const leftBorder = i * cellsPerRowAndColumns
        border.left.push(leftBorder)
        border.right.push(leftBorder + (cellsPerRowAndColumns - 1))
        border.bottom.push(i + (cellsPerRowAndColumns * (cellsPerRowAndColumns - 1)))
    }

    return { cellsPerRowAndColumns, totalNumberOfCells }

}

const { cellsPerRowAndColumns, totalNumberOfCells } = criarTamanhoDoMapa(numeroInicialDeCelulas)
box.style.gridTemplateColumns = box.style.gridTemplateRows = `repeat(${cellsPerRowAndColumns}, 1fr)`

for (let index = 0; index < totalNumberOfCells; index++) {

    const cell = <HTMLDivElement>(document.createElement('div'));
    cell.className = 'cell'
    // cell.innerHTML = String(index)
    cell.id = index.toString()
    box.appendChild(cell)

}

let currentHeadCellIndex = 1
let bodyPositions = [1, 0]

function paintSnakeFirstTime() {

    bodyPositions.forEach((x, idx) => {

        const cell = document.getElementById(x.toString())
        if (!cell) throw new Error("Celula de inicio não encontrada");
        if (idx === 0) cell.style.backgroundColor = '#000000'
        if (idx !== 0) cell.style.backgroundColor = 'rgb(4, 153, 255)'

    })

}

let lastMove: string[] = []

function move(event: any) {

    let nextIndex

    if (event.key === 'a' || event.key === 'A') {

        if ((border.left).includes(currentHeadCellIndex)) return showDeadScreen()
        nextIndex = currentHeadCellIndex - 1

    }

    if (event.key === 'd' || event.key === 'D') {

        if ((border.right).includes(currentHeadCellIndex)) return showDeadScreen()
        nextIndex = currentHeadCellIndex + 1

    }

    if (event.key === 'w' || event.key === 'W') nextIndex = currentHeadCellIndex - cellsPerRowAndColumns
    if (event.key === 's' || event.key === 'S') nextIndex = currentHeadCellIndex + cellsPerRowAndColumns

    if (!nextIndex && nextIndex !== 0) throw new Error("Próxima celula inválida");

    const nextCell = document.getElementById(nextIndex.toString())
    if (!nextCell) return showDeadScreen()

    if (bodyPositions.includes(nextIndex)) return showDeadScreen()

    if (nextIndex === foodCellIndex) eat()

    const currentCell = document.getElementById((currentHeadCellIndex).toString())
    if (!currentCell) throw new Error("Celula atual não encontrada");

    nextCell.style.backgroundColor = '#000000'
    currentCell.style.backgroundColor = 'red'

    currentHeadCellIndex = nextIndex

    const bodySnapshot = [...bodyPositions]
    for (const index of bodyPositions.keys()) {

        if (index !== 0) {

            const currentBodyCell = document.getElementById((bodyPositions[index]).toString())
            if (!currentBodyCell) throw new Error("Celula atual do corpo não encontrada");

            const nextBodyCell = document.getElementById((bodySnapshot[index - 1]).toString())
            if (!nextBodyCell) throw new Error("Proxima celula do corpo não encontrada");

            nextBodyCell.style.backgroundColor = `rgb(${index * 4}, ${149 + (index * 4)}, 255)`
            currentBodyCell.style.backgroundColor = 'red'

            bodyPositions[index] = bodySnapshot[index - 1]

        }

    }

    bodyPositions[0] = nextIndex

    if (nextIndex === foodCellIndex) eat()

}

document.addEventListener('keydown', (e) => {
    const keyPressed = String(e.key).toLowerCase()
    if (lastMove[0] === 'a' && keyPressed === 'd') throw new Error("Movimento inválido");
    if (lastMove[0] === 'd' && keyPressed === 'a') throw new Error("Movimento inválido");
    if (lastMove[0] === 's' && keyPressed === 'w') throw new Error("Movimento inválido");
    if (lastMove[0] === 'w' && keyPressed === 's') throw new Error("Movimento inválido");
    lastMove.push(keyPressed)
});

let loop: NodeJS.Timeout

function start(tick: number) {

    loop = setInterval(() => {

        if (lastMove.length > 1) move({ key: lastMove.shift() })
        else if (lastMove.length === 1) move({ key: lastMove[0] })

    }, tick)

}

let foodCellIndex: number = 5

function paintFoodFirstTime() {

    const startFoodCell = document.getElementById((foodCellIndex).toString())
    if (!startFoodCell) throw new Error("Celula de comida não encontrada");
    startFoodCell.style.backgroundColor = '#00FF00'

}

function generateFood() {

    const randomCell = Math.floor(Math.random() * ((totalNumberOfCells - 1) - 0 + 1)) + 0;

    if (bodyPositions.includes(randomCell)) {
        generateFood()
        return
    }

    const foodCell = document.getElementById((randomCell).toString())
    if (!foodCell) throw new Error("Celula de comida não encontrada");
    foodCell.style.backgroundColor = '#00FF00'

    foodCellIndex = randomCell

}

const scoreSpan = document.getElementById('score')

let score = 0

function eat() {

    const lastBodyCellPosition = bodyPositions[bodyPositions.length - 1]

    let newLastBodyCellPosition = 0
    if (lastMove[0] === 'a') newLastBodyCellPosition = lastBodyCellPosition + 1
    if (lastMove[0] === 'w') newLastBodyCellPosition = lastBodyCellPosition + cellsPerRowAndColumns
    if (lastMove[0] === 's') newLastBodyCellPosition = lastBodyCellPosition - cellsPerRowAndColumns
    if (lastMove[0] === 'd') newLastBodyCellPosition = lastBodyCellPosition - 1

    const offsets = [1, cellsPerRowAndColumns, -cellsPerRowAndColumns, -1];
    do {

        for (const offset of offsets) {

            newLastBodyCellPosition = lastBodyCellPosition + offset;
            if (newLastBodyCellPosition >= 0 && newLastBodyCellPosition < totalNumberOfCells) break

        }

    } while (newLastBodyCellPosition < 0 || newLastBodyCellPosition > totalNumberOfCells - 1)

    bodyPositions.push(newLastBodyCellPosition)

    generateFood()

    score += 1
    if (!scoreSpan) throw new Error("Score não encontrado");
    scoreSpan.innerHTML = score.toString()

}

function showDeadScreen() {

    if (!deadScreen || !box) throw new Error("Erro de UI");

    box.style.display = 'none'
    deadScreen.style.display = 'flex'
    lastMove = []
    clearInterval(loop)

}

function restart() {

    if (!deadScreen || !box || !scoreSpan) throw new Error("Erro de UI");

    for (let index = 0; index < totalNumberOfCells; index++) {

        const cell = <HTMLDivElement>(document.getElementById(index.toString()));
        cell.style.backgroundColor = 'red'

    }

    score = 0
    scoreSpan.innerHTML = String(score)

    foodCellIndex = 5
    paintFoodFirstTime()

    currentHeadCellIndex = 1
    bodyPositions = [1, 0]
    paintSnakeFirstTime()

    start(200)

    box.style.display = 'grid'
    deadScreen.style.display = 'none'
}

paintFoodFirstTime()
paintSnakeFirstTime()
start(200)