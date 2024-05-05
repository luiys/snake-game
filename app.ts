const box = document.getElementById('box')
if (!box) throw new Error("Box não encontrada");

//225
const numeroInicialDeCelulas = 225

function criarTamanhoDoMapa(numeroDeCelulas: number) {

    const raiz = Math.sqrt(numeroDeCelulas);
    const numeroDeColunasAndLinhas = Math.floor(raiz);
    return { numeroDeColunasAndLinhas, realNumeroPossivelDeCelulas: numeroDeColunasAndLinhas * numeroDeColunasAndLinhas }

}


const { numeroDeColunasAndLinhas, realNumeroPossivelDeCelulas: realNumberOfPossibleCells } = criarTamanhoDoMapa(numeroInicialDeCelulas)
box.style.gridTemplateColumns = box.style.gridTemplateRows = `repeat(${numeroDeColunasAndLinhas}, 1fr)`

for (let index = 0; index < realNumberOfPossibleCells; index++) {

    const cell = <HTMLDivElement>(document.createElement('div'));
    cell.className = 'cell'
    // cell.innerHTML = String(index)
    cell.id = index.toString()
    box.appendChild(cell)

}

let currentHeadCellIndex = 1
const bodyPositions = [1, 0]

bodyPositions.forEach(x => {

    const cell = document.getElementById((x).toString())
    if (!cell) throw new Error("Celula de inicio não encontrada");
    cell.style.backgroundColor = '#000000'

})

let lastMove: string[] = []

function move(event: any) {

    let nextIndex

    if (event.key === 'a' || event.key === 'A') nextIndex = currentHeadCellIndex - 1
    if (event.key === 'w' || event.key === 'W') nextIndex = currentHeadCellIndex - numeroDeColunasAndLinhas
    if (event.key === 's' || event.key === 'S') nextIndex = currentHeadCellIndex + numeroDeColunasAndLinhas
    if (event.key === 'd' || event.key === 'D') nextIndex = currentHeadCellIndex + 1

    if (!nextIndex && nextIndex !== 0) throw new Error("Próxima celula inválida");

    const nextCell = document.getElementById((nextIndex).toString())
    if (!nextCell) {
        // clearInterval(loop)
        throw new Error("Próxima celula não encontrada");
    }

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


let loop = setInterval(() => {

    if (lastMove.length > 1) move({ key: lastMove.shift() })
    else if (lastMove.length === 1) move({ key: lastMove[0] })

}, 200)

let foodCellIndex: number = 5
const startFoodCell = document.getElementById((foodCellIndex).toString())
if (!startFoodCell) throw new Error("Celula de comida não encontrada");
startFoodCell.style.backgroundColor = '#00FF00'

function generateFood() {

    const randomCell = Math.floor(Math.random() * ((realNumberOfPossibleCells - 1) - 0 + 1)) + 0;

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
    if (lastMove[0] === 'w') newLastBodyCellPosition = lastBodyCellPosition + numeroDeColunasAndLinhas
    if (lastMove[0] === 's') newLastBodyCellPosition = lastBodyCellPosition - numeroDeColunasAndLinhas
    if (lastMove[0] === 'd') newLastBodyCellPosition = lastBodyCellPosition - 1

    do {

        newLastBodyCellPosition = lastBodyCellPosition + 1
        if (newLastBodyCellPosition >= 0 || newLastBodyCellPosition <= realNumberOfPossibleCells - 1) break;

        newLastBodyCellPosition = lastBodyCellPosition + numeroDeColunasAndLinhas
        if (newLastBodyCellPosition >= 0 || newLastBodyCellPosition <= realNumberOfPossibleCells - 1) break;

        newLastBodyCellPosition = lastBodyCellPosition - numeroDeColunasAndLinhas
        if (newLastBodyCellPosition >= 0 || newLastBodyCellPosition <= realNumberOfPossibleCells - 1) break;

        newLastBodyCellPosition = lastBodyCellPosition - 1
        if (newLastBodyCellPosition >= 0 || newLastBodyCellPosition <= realNumberOfPossibleCells - 1) break;

    } while (newLastBodyCellPosition < 0 || newLastBodyCellPosition > realNumberOfPossibleCells - 1)

    bodyPositions.push(newLastBodyCellPosition)

    generateFood()

    score += 1
    if (!scoreSpan) throw new Error("Score não encontrado");
    scoreSpan.innerHTML = score.toString()

}
