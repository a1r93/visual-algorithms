const grid = []
const width = 1000
const height = 1000
const nbCols = 40
const nbRows = 40

let start
let end
let currentLast
let bfsQueue
let dfsStack
let astarSet

let launchBfs = false
let launchDfs = false
let launchBestfs = false
let launchAstar = false
let done = false
let mouseDown = false
let currentHoveredCell = ""

const cellWidth = width / nbCols
const cellHeight = height / nbRows

let pathLength

function resetToEmpty() {
  // create all the cells
  for (let i = 0; i < nbCols; i++) {
    grid[i] = []
    for (let j = 0; j < nbRows; j++) {
      grid[i][j] = new Cell(i, j, null)
    }
  }

  // set the starting and arrival point
  const middle = Math.round(nbRows / 2)
  grid[7][middle].setAsStart()
  start = grid[7][middle]
  grid[nbCols - 5][middle].setAsEnd()
  end = grid[nbCols - 5][middle]
  currentLast = end

  // set the walls
  for(i = 2; i < nbRows - 2; i++) {
    grid[25][i].setAsWall()
  }
  for(i = 15; i < 25; i++) {
    grid[i][2].setAsWall()
    grid[i][nbRows - 3].setAsWall()
  }

  launchBfs = false
  launchDfs = false
  launchAstar = false
  launchBestfs = false
  pathSize = 0
  done = false

  pathLength.html("Path length : " + pathSize)
}

function setup() {
  createCanvas(width, height)
  background(255)

  pathLength = createSpan("", width, height)

  resetToEmpty()
  noLoop()

  select("#bfs").mouseClicked(() => {
    bfsQueue = []
    bfsQueue.push(start)
    launchBfs = true
    loop()
  })

  select("#dfs").mouseClicked(() => {
    dfsStack = []
    dfsStack.push(start)
    launchDfs = true
    loop()
  })

  select("#bestfs").mouseClicked(() => {
    bestfsSet = new Set()
    bestfsSet.add(start)
    launchBestfs = true
    loop()
  })

  select("#astar").mouseClicked(() => {
    astarSet = new Set()
    astarSet.add(start)
    launchAstar = true
    loop()
  })

  select("#reset").mouseClicked(() => {
    resetToEmpty()
    loop()
  })
}

function printCells() {
  for (let i = 0; i < nbCols; i++) {
    for (let j = 0; j < nbRows; j++) {
      grid[i][j].show()
    }
  }
}

function draw() {
  printCells()

  if (launchBfs) {
    bfsAlgorithm()
  }

  if (launchDfs) {
    dfsAlgorithm()
  }

  if (launchBestfs) {
    bestfsAlgorithm()
  }

  if (launchAstar) {
    astarAlgorithm()
  }

  if (mouseDown) {
    buildWall()
  }

  if (done) {
    showPath()
  }

  pathLength.html("Path length : " + pathSize)
}

const buildWall = () => {
  for (let i = 0; i < nbCols; i++) {
    for (let j = 0; j < nbRows; j++) {
      if (grid[i][j].i * cellWidth < mouseX && grid[i][j].i * cellWidth + cellWidth > mouseX
      && grid[i][j].j * cellHeight < mouseY && grid[i][j].j * cellHeight + cellHeight > mouseY) {
        const idx = `${i}-${j}`
        if (currentHoveredCell !== idx)
          grid[i][j].isWall = !grid[i][j].isWall
        currentHoveredCell = idx
      }
    }
  }
}

function mousePressed(event) {
  mouseDown = true
  loop()
}

function mouseReleased() {
  mouseDown = false
  currentHoveredCell = ""
  noLoop()
}

const showPath = () => {
  if (!currentLast) {
    currentLast = end
    noLoop()
    return
  }
  pathSize++
  currentLast.partOfPath = true
  currentLast = currentLast.parent
}

const getNeighbours = (cell) => {
  const neighbours = []

  if (cell.j !== 0 && !grid[cell.i][cell.j - 1].isWall && !grid[cell.i][cell.j - 1].visited) {
    neighbours.push(grid[cell.i][cell.j - 1])
  }
  if (cell.j !== nbRows - 1 && !grid[cell.i][cell.j + 1].isWall && !grid[cell.i][cell.j + 1].visited) {
    neighbours.push(grid[cell.i][cell.j + 1])
  }
  if (cell.i !== 0 && !grid[cell.i - 1][cell.j].isWall && !grid[cell.i - 1][cell.j].visited) {
    neighbours.push(grid[cell.i - 1][cell.j])
  }
  if (cell.i !== nbCols - 1 && !grid[cell.i + 1][cell.j].isWall && !grid[cell.i + 1][cell.j].visited) {
    neighbours.push(grid[cell.i + 1][cell.j])
  }

  return neighbours
}

const bfsAlgorithm = () => {
  if (bfsQueue.length === 0) {
    noLoop()
  }
  const current = bfsQueue.shift()
  if (current === end) {
    launchBfs = false
    done = true
  }
  current.visited = true
  getNeighbours(current).forEach(neighbour => {
    if (!neighbour.visited) {
      neighbour.visited = true
      neighbour.parent = current
      bfsQueue.push(neighbour)
    }
  })
}

const dfsAlgorithm = () => {
  if (dfsStack.length === 0) {
    noLoop()
  }
  const current = dfsStack.pop()
  if (current === end) {
    launchDfs = false
    done = true
  }
  if (!current.visited) {
    current.visited = true
    getNeighbours(current).forEach(neighbour => {
      neighbour.parent = current
      dfsStack.push(neighbour)
    })
  }
}

const getLowestScoreCell = (set) => {
  let min = 10000000
  let minCell = null
  set.forEach(cell => {
    if (cell.score < min) {
      min = cell.score
      minCell = cell
    }
  })
  return minCell
}

const testSetContains = (testSet, cell) => {
  let contains = false
  const size = testSet.length
  for (let i = 0; i < size; i++) {
    if (testSet[i] === cell) return true
  }
  return false
}

const heuristic = cell => {
  const mahattanDist = Math.abs(end.i - cell.i) + Math.abs(end.j - cell.j)
  const trueDist = dist(cell.i * cellWidth, cell.j * cellHeight, end.i * cellWidth, end.j * cellHeight)
  return mahattanDist * trueDist
}

const bestfsAlgorithm = () => {
  if (bestfsSet.size === 0) {
    noLoop()
  }
  const current = getLowestScoreCell(bestfsSet)
  if (current === end) {
    launchBestfs = false
    done = true
  }
  bestfsSet.delete(current)
  current.visited = true

  getNeighbours(current).forEach(neighbour => {
    if (!testSetContains(bestfsSet, neighbour)) 
      neighbour.parent = current
      neighbour.score = heuristic(neighbour)
      bestfsSet.add(neighbour)
  })
}

const astarAlgorithm = () => {
  if (astarSet.size === 0) {
    noLoop()
  }
  const current = getLowestScoreCell(astarSet)
  if (current === end) {
    launchAstar = false
    done = true
  }
  astarSet.delete(current)
  current.visited = true

  getNeighbours(current).forEach(neighbour => {
    if (!testSetContains(astarSet, neighbour)) 
      neighbour.parent = current
      neighbour.score = heuristic(neighbour) + current.score
      astarSet.add(neighbour)
  })
}

function Cell(i, j, parent) {
  this.i = i
  this.j = j
  this.isStart = false
  this.isEnd = false
  this.isWall = false
  this.visited = false
  this.partOfPath = false
  this.parentCell = parent
  this.score = 0

  this.show = function() {
    if (this.partOfPath)
      fill(0, 255, 255)
    else if (this.isStart)
      fill(255, 0, 0)
    else if (this.isEnd)
      fill(0, 255, 0)
    else if (this.isWall)
      fill(0)
    else if (this.visited)
      fill(0, 0, 255)
    else
      fill(255)
    stroke(0)
    rect(this.i * cellWidth, this.j * cellHeight, cellWidth - 1, cellHeight - 1)
  }

  this.setAsStart = function() {
    this.isStart = true
  }

  this.setAsEnd = function() {
    this.isEnd = true
  }

  this.setAsWall = function() {
    this.isWall = true
  }
}
