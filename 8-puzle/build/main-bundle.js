/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/puzzle-constructor.ts":
/*!***********************************!*\
  !*** ./src/puzzle-constructor.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PuzzleConstructor = void 0;
const puzzle_1 = __webpack_require__(/*! ./puzzle */ "./src/puzzle.ts");
class PuzzleConstructor {
    constructor() { }
    constructRandomPuzzle() {
        const puzzleNumbers = [...new Array(9)];
        const selected = [...new Array(10)];
        let setElements = 0;
        while (setElements < 8) {
            let currentNumber = this.getRandomInt(1, 8);
            let currentPosition = this.getRandomInt(0, 8);
            if (!selected[currentNumber]) {
                if (!puzzleNumbers[currentPosition]) {
                    puzzleNumbers[currentPosition] = currentNumber;
                    setElements++;
                    selected[currentNumber] = 1;
                }
            }
        }
        const matrix = this.constructSquareMatrixFromOneDimensionArray(puzzleNumbers, 3);
        return new puzzle_1.Puzzle(matrix);
    }
    constructPuzzle(numbers) {
        const matrix = this.constructSquareMatrixFromOneDimensionArray(numbers, 3);
        return new puzzle_1.Puzzle(matrix);
    }
    constructSquareMatrixFromOneDimensionArray(array, length) {
        const placeholder = [...new Array(length)].map(() => [...new Array(length)]);
        for (let i = 0; i < array.length; i++) {
            let row = Math.floor(i / length);
            let column = i % length;
            placeholder[row][column] = array[i];
        }
        return placeholder;
    }
    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}
exports.PuzzleConstructor = PuzzleConstructor;


/***/ }),

/***/ "./src/puzzle-painter.ts":
/*!*******************************!*\
  !*** ./src/puzzle-painter.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PuzzlePainter = void 0;
const puzzle_1 = __webpack_require__(/*! ./puzzle */ "./src/puzzle.ts");
class PuzzlePainter {
    getPuzzleRepresentation(puzzle) {
        const table = document.createElement('table');
        table.className = 'puzzle';
        for (let i = 0; i < puzzle_1.LENGTH; i++) {
            let tr = document.createElement('tr');
            for (let j = 0; j < puzzle_1.LENGTH; j++) {
                let td = document.createElement('td');
                td.innerText = (puzzle.numbers[i][j] || '').toString();
                tr.appendChild(td);
            }
            table.appendChild(tr);
        }
        return table;
    }
}
exports.PuzzlePainter = PuzzlePainter;


/***/ }),

/***/ "./src/puzzle-solver.ts":
/*!******************************!*\
  !*** ./src/puzzle-solver.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.solve = exports.Strategy = void 0;
const puzzle_1 = __webpack_require__(/*! ./puzzle */ "./src/puzzle.ts");
var Strategy;
(function (Strategy) {
    Strategy["BFS"] = "BFS";
    Strategy["DFS"] = "DFS";
    Strategy["IT"] = "IT";
})(Strategy = exports.Strategy || (exports.Strategy = {}));
function createNode(state, action, parent, deepth, f) {
    return {
        action: action,
        deepth: deepth,
        parent: parent,
        state: state,
        f: f,
    };
}
function solution(node) {
    let actions = [];
    let current = node;
    while (current) {
        actions.push({
            action: current.action,
            state: current.state,
            node: current,
        });
        current = current.parent;
    }
    actions.reverse();
    return actions;
}
function successors(node) {
    let puzzle = node.state;
    const nextStates = puzzle.allowedDirections.map((direction) => {
        return [direction, puzzle.moveEmpty(direction)];
    });
    return nextStates;
}
function expand(node) {
    let nextStates = successors(node);
    const result = nextStates.map(([action, p]) => {
        let res = createNode(p, action, node, Number.MAX_VALUE);
        res.f = Number.MAX_VALUE;
        return res;
    });
    return result;
}
function g(node, objective) {
    return node.deepth;
}
function h(node, objective) {
    let differentCount = 0;
    for (let i = 0; i < puzzle_1.LENGTH; i++) {
        for (let j = 0; j < puzzle_1.LENGTH; j++) {
            if (objective.numbers[i][j] != node.state.numbers[i][j]) {
                differentCount++;
            }
        }
    }
    return differentCount;
}
function f(node, objective) {
    return g(node, objective) + h(node, objective);
}
function AStar(initial, objective) {
    const visited = {};
    const unvisited = {};
    const keys = [];
    unvisited[initial.getSerial()] = createNode(initial, null, null, 0);
    unvisited[initial.getSerial()].f = f(unvisited[initial.getSerial()], objective);
    insertSorted(keys, initial.getSerial());
    let minKey = initial.getSerial();
    while (keys.length !== 0) {
        let current_node = getMinimun(unvisited, keys);
        if (current_node.deepth > 25) {
            throw new Error("Fail");
        }
        if (current_node.state.getSerial() == objective.getSerial()) {
            return solution(current_node);
        }
        else {
            let successors = expand(current_node);
            successors.forEach((element) => {
                if (!unvisited[element.state.getSerial()]) {
                    unvisited[element.state.getSerial()] = element;
                    insertSorted(keys, element.state.getSerial());
                }
            });
            for (let i = 0; i < successors.length; i++) {
                let successor = successors[i];
                if (!visited[successor.state.getSerial()]) {
                    let new_g_score = current_node.deepth + 1;
                    if (new_g_score < unvisited[successor.state.getSerial()].deepth) {
                        unvisited[successor.state.getSerial()].deepth = new_g_score;
                        unvisited[successor.state.getSerial()].f = f(successor, objective);
                    }
                }
            }
            visited[current_node.state.getSerial()] = current_node;
            deleteFromList(keys, current_node.state.getSerial());
            delete unvisited[current_node.state.getSerial()];
        }
    }
    throw new Error("Fail");
}
function insertSorted(list, value) {
    let start = 0; // first index in array
    let end = list.length - 1; // the last index in the array
    while (start <= end) {
        let mid = Math.floor((start + end) / 2); //calculate the midpoint
        if (value === list[mid]) {
        }
        else if (value < list[mid]) {
            end = mid - 1; //search only first half of the array
        }
        else if (value > list[mid]) {
            start = mid + 1; //search only 2nd half of the array
        }
    }
    list.splice(start, 0, value);
}
function deleteFromList(list, value) {
    let start = 0; // first index in array
    let end = list.length - 1; // the last index in the array
    while (start <= end) {
        let mid = Math.floor((start + end) / 2); //calculate the midpoint
        if (value === list[mid]) {
            list.splice(mid, 1);
            return;
        }
        else if (value < list[mid]) {
            end = mid - 1; //search only first half of the array
        }
        else if (value > list[mid]) {
            start = mid + 1; //search only 2nd half of the array
        }
    }
}
function getMinimun(object, keys) {
    let min = object[keys[0]];
    for (let i = 1; i < keys.length; i++) {
        let element = object[keys[i]];
        if (element.f < min.f) {
            min = element;
        }
    }
    return min;
}
function solve(puzzle, objective) {
    let result = null;
    result = AStar(puzzle, objective);
    return result;
}
exports.solve = solve;


/***/ }),

/***/ "./src/puzzle.ts":
/*!***********************!*\
  !*** ./src/puzzle.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Puzzle = exports.LENGTH = exports.Direction = void 0;
var Direction;
(function (Direction) {
    Direction["Left"] = "Left";
    Direction["Right"] = "Rigth";
    Direction["Up"] = "Up";
    Direction["Down"] = "Down";
})(Direction = exports.Direction || (exports.Direction = {}));
const allowedMovesColumnMap = {
    0: [Direction.Right],
    1: [Direction.Left, Direction.Right],
    2: [Direction.Left],
};
const allowedMovesRowMap = {
    0: [Direction.Down],
    1: [Direction.Up, Direction.Down],
    2: [Direction.Up],
};
const directionMap = {
    [Direction.Up]: -1,
    [Direction.Down]: 1,
    [Direction.Left]: -1,
    [Direction.Right]: 1,
};
exports.LENGTH = 3;
class Puzzle {
    constructor(_numbers) {
        this._numbers = _numbers;
    }
    get allowedDirections() {
        if (!this._allowedDirections) {
            this.calculateAllowedDirections();
        }
        return this._allowedDirections;
    }
    get numbers() {
        return this._numbers;
    }
    validateNumbers() {
        let emptySpaceFound = false;
        for (let i = 0; i < exports.LENGTH; i++) {
            for (let j = 0; j < exports.LENGTH; j++) {
                let currentNumber = this._numbers[i][j];
                if (!currentNumber) {
                    emptySpaceFound = true;
                }
                if (currentNumber < 1 || currentNumber > 8) {
                    throw new Error('invalid numbers');
                }
            }
        }
    }
    moveEmpty(direction) {
        if (this.allowedDirections.includes(direction)) {
            const currentEmptyLocation = this.getEmptySpaceLocation();
            const targetLocation = { ...currentEmptyLocation };
            let propertyToModify = 'x';
            if ([Direction.Up, Direction.Down].includes(direction)) {
                propertyToModify = 'y';
            }
            targetLocation[propertyToModify] += directionMap[direction];
            const newNumbers = this.swap(currentEmptyLocation, targetLocation);
            return new Puzzle(newNumbers);
        }
        else {
            throw new Error("movement not allowed");
        }
    }
    swap(a, b) {
        const newNumbers = this._numbers.map(rows => [...rows]);
        let aux = newNumbers[b.y][b.x];
        newNumbers[b.y][b.x] = newNumbers[a.y][a.x];
        newNumbers[a.y][a.x] = aux;
        return newNumbers;
    }
    getEmptySpaceLocation() {
        let col;
        let row;
        for (let i = 0; i < exports.LENGTH; i++) {
            for (let j = 0; j < exports.LENGTH; j++) {
                if (!this._numbers[i][j]) {
                    row = i;
                    col = j;
                    break;
                }
            }
        }
        return { x: col, y: row };
    }
    calculateAllowedDirections() {
        const emptySpaceLocation = this.getEmptySpaceLocation();
        this._allowedDirections = allowedMovesColumnMap[emptySpaceLocation.x].concat(allowedMovesRowMap[emptySpaceLocation.y]);
    }
    getSerial() {
        if (!this.serial) {
            this.serial = JSON.stringify(this._numbers);
        }
        return this.serial;
    }
}
exports.Puzzle = Puzzle;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
const puzzle_constructor_1 = __webpack_require__(/*! ./puzzle-constructor */ "./src/puzzle-constructor.ts");
const puzzle_painter_1 = __webpack_require__(/*! ./puzzle-painter */ "./src/puzzle-painter.ts");
const puzzle_solver_1 = __webpack_require__(/*! ./puzzle-solver */ "./src/puzzle-solver.ts");
const newStateBtn = document.getElementById("newStateBtn");
const findSolutionBtn = document.getElementById("findSolution");
const initialContainer = document.getElementById("initialStateContainer");
const objectiveContainer = document.getElementById("objectiveContainer");
const solutionContainer = document.getElementById("solutionContainer");
const disclaimerContainer = document.getElementById("disclaimer");
const costoContainer = document.getElementById("costoContainer");
class Main {
    constructor(puzzleConstructor, puzzlePainter) {
        this.puzzlePainter = puzzlePainter;
        this.objetive = puzzleConstructor.constructPuzzle([
            1,
            2,
            3,
            4,
            undefined,
            5,
            6,
            7,
            8,
        ]);
        objectiveContainer.appendChild(puzzlePainter.getPuzzleRepresentation(this.objetive));
    }
    setInitialState(initialState) {
        let initial = initialState;
        // initial = new Puzzle([
        //   [1 ,2, 5],
        //   [8, 6, 3],
        //   [4, null, 7 ]
        // ]);
        solutionContainer.innerHTML = "";
        initialContainer.innerHTML = "";
        this.initialState = initial;
        initialContainer.appendChild(this.puzzlePainter.getPuzzleRepresentation(this.initialState));
    }
    solve() {
        if (!this.initialState) {
            alert("Da clic al botón 'Generar estado inicial'");
            return;
        }
        solutionContainer.innerHTML = '';
        disclaimerContainer.innerHTML =
            "<p>SOLUCIONANDO...</p><p>NOTA! Puede ser que el algoritmo tarde bastante y que el navegador no sea responsivo mientras este se ejecuta y que se muestre un mensaje de que la página ha sido bloqueda, por favor no cerrar la página y dar clic a esperar</p>";
        setTimeout(() => {
            try {
                // const puzzle = new Puzzle([[1, 2, 3],[4, undefined, 5],[6, 7, 8]])
                let solution = puzzle_solver_1.solve(this.initialState, this.objetive);
                solution
                    .map((s, i) => {
                    let div = document.createElement("div");
                    div.innerHTML = `<strong>Paso ${i + 1}</strong>`;
                    let puzzle = this.puzzlePainter.getPuzzleRepresentation(s.state);
                    div.appendChild(puzzle);
                    return div;
                })
                    .forEach((d) => {
                    solutionContainer.appendChild(d);
                });
                disclaimerContainer.innerHTML = "";
                costoContainer.innerText = solution[solution.length - 1].node.deepth.toString();
            }
            catch (exception) {
                alert("El puzzle no pudo ser resuelto");
            }
        });
    }
}
const puzzleConstructor = new puzzle_constructor_1.PuzzleConstructor();
const main = new Main(puzzleConstructor, new puzzle_painter_1.PuzzlePainter());
newStateBtn.addEventListener("click", generateNewInitialState);
findSolutionBtn.addEventListener("click", () => {
    main.solve();
});
function generateNewInitialState() {
    main.setInitialState(puzzleConstructor.constructRandomPuzzle());
}
generateNewInitialState();

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9wcmFjdGljYTIvLi9zcmMvcHV6emxlLWNvbnN0cnVjdG9yLnRzIiwid2VicGFjazovL3ByYWN0aWNhMi8uL3NyYy9wdXp6bGUtcGFpbnRlci50cyIsIndlYnBhY2s6Ly9wcmFjdGljYTIvLi9zcmMvcHV6emxlLXNvbHZlci50cyIsIndlYnBhY2s6Ly9wcmFjdGljYTIvLi9zcmMvcHV6emxlLnRzIiwid2VicGFjazovL3ByYWN0aWNhMi93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9wcmFjdGljYTIvLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQUFBLHdFQUFrQztBQUNsQyxNQUFhLGlCQUFpQjtJQUM1QixnQkFBZSxDQUFDO0lBQ2hCLHFCQUFxQjtRQUNuQixNQUFNLGFBQWEsR0FBRyxDQUFDLEdBQUcsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN4QyxNQUFNLFFBQVEsR0FBRyxDQUFDLEdBQUcsSUFBSSxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNwQyxJQUFJLFdBQVcsR0FBRyxDQUFDLENBQUM7UUFDcEIsT0FBTyxXQUFXLEdBQUcsQ0FBQyxFQUFFO1lBQ3RCLElBQUksYUFBYSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzVDLElBQUksZUFBZSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzlDLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLEVBQUU7Z0JBQzVCLElBQUksQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLEVBQUU7b0JBQ25DLGFBQWEsQ0FBQyxlQUFlLENBQUMsR0FBRyxhQUFhLENBQUM7b0JBQy9DLFdBQVcsRUFBRyxDQUFDO29CQUNmLFFBQVEsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7aUJBQzdCO2FB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RyxJQUFJLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxJQUFJLDhCQUFhLEVBQUUsQ0FBQyxDQUFDO0FBQzlELFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsdUJBQXVCLENBQUMsQ0FBQztBQUMvRCxlQUFlLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRTtJQUM3QyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDZixDQUFDLENBQUMsQ0FBQztBQUVILFNBQVMsdUJBQXVCO0lBQzlCLElBQUksQ0FBQyxlQUFlLENBQUMsaUJBQWlCLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxDQUFDO0FBQ2xFLENBQUM7QUFFRCx1QkFBdUIsRUFBRSxDQUFDIiwiZmlsZSI6Im1haW4tYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUHV6emxlIH0gZnJvbSBcIi4vcHV6emxlXCI7XHJcbmV4cG9ydCBjbGFzcyBQdXp6bGVDb25zdHJ1Y3RvciB7XHJcbiAgY29uc3RydWN0b3IoKSB7fVxyXG4gIGNvbnN0cnVjdFJhbmRvbVB1enpsZSgpOiBQdXp6bGUge1xyXG4gICAgY29uc3QgcHV6emxlTnVtYmVycyA9IFsuLi5uZXcgQXJyYXkoOSldO1xyXG4gICAgY29uc3Qgc2VsZWN0ZWQgPSBbLi4ubmV3IEFycmF5KDEwKV07XHJcbiAgICBsZXQgc2V0RWxlbWVudHMgPSAwO1xyXG4gICAgd2hpbGUgKHNldEVsZW1lbnRzIDwgOCkge1xyXG4gICAgICBsZXQgY3VycmVudE51bWJlciA9IHRoaXMuZ2V0UmFuZG9tSW50KDEsIDgpO1xyXG4gICAgICBsZXQgY3VycmVudFBvc2l0aW9uID0gdGhpcy5nZXRSYW5kb21JbnQoMCwgOCk7XHJcbiAgICAgIGlmICghc2VsZWN0ZWRbY3VycmVudE51bWJlcl0pIHtcclxuICAgICAgICBpZiAoIXB1enpsZU51bWJlcnNbY3VycmVudFBvc2l0aW9uXSkge1xyXG4gICAgICAgICAgcHV6emxlTnVtYmVyc1tjdXJyZW50UG9zaXRpb25dID0gY3VycmVudE51bWJlcjtcclxuICAgICAgICAgIHNldEVsZW1lbnRzICsrO1xyXG4gICAgICAgICAgc2VsZWN0ZWRbY3VycmVudE51bWJlcl0gPSAxO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgY29uc3QgbWF0cml4ID0gdGhpcy5jb25zdHJ1Y3RTcXVhcmVNYXRyaXhGcm9tT25lRGltZW5zaW9uQXJyYXkocHV6emxlTnVtYmVycywgMyk7XHJcbiAgICByZXR1cm4gbmV3IFB1enpsZShtYXRyaXgpO1xyXG4gIH1cclxuXHJcbiAgY29uc3RydWN0UHV6emxlKG51bWJlcnM6IG51bWJlcltdKSB7XHJcbiAgICBjb25zdCBtYXRyaXggPSB0aGlzLmNvbnN0cnVjdFNxdWFyZU1hdHJpeEZyb21PbmVEaW1lbnNpb25BcnJheShudW1iZXJzLCAzKTtcclxuICAgIHJldHVybiBuZXcgUHV6emxlKG1hdHJpeCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGNvbnN0cnVjdFNxdWFyZU1hdHJpeEZyb21PbmVEaW1lbnNpb25BcnJheShhcnJheTogbnVtYmVyW10sIGxlbmd0aDogbnVtYmVyKSB7XHJcbiAgICBjb25zdCBwbGFjZWhvbGRlciA9IFsuLi5uZXcgQXJyYXkobGVuZ3RoKV0ubWFwKCgpID0+IFsuLi5uZXcgQXJyYXkobGVuZ3RoKV0pO1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKykge1xyXG4gICAgICBsZXQgcm93ID0gTWF0aC5mbG9vcihpIC8gbGVuZ3RoKTtcclxuICAgICAgbGV0IGNvbHVtbiA9IGklbGVuZ3RoO1xyXG4gICAgICBwbGFjZWhvbGRlcltyb3ddW2NvbHVtbl0gPSBhcnJheVtpXTtcclxuICAgIH1cclxuICAgIHJldHVybiBwbGFjZWhvbGRlcjtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0UmFuZG9tSW50KG1pbjogbnVtYmVyLCBtYXg6IG51bWJlcikge1xyXG4gICAgbWluID0gTWF0aC5jZWlsKG1pbik7XHJcbiAgICBtYXggPSBNYXRoLmZsb29yKG1heCk7XHJcbiAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbiArIDEpKSArIG1pbjtcclxuICB9XHJcbn1cclxuIiwiaW1wb3J0IHsgTEVOR1RILCBQdXp6bGUgfSBmcm9tIFwiLi9wdXp6bGVcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBQdXp6bGVQYWludGVyIHtcclxuICBnZXRQdXp6bGVSZXByZXNlbnRhdGlvbihwdXp6bGU6IFB1enpsZSkge1xyXG4gICAgY29uc3QgdGFibGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0YWJsZScpO1xyXG4gICAgdGFibGUuY2xhc3NOYW1lID0gJ3B1enpsZSc7XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IExFTkdUSDsgaSsrKSB7XHJcbiAgICAgIGxldCB0ciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RyJyk7XHJcbiAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgTEVOR1RIOyBqKyspIHtcclxuICAgICAgICBsZXQgdGQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZCcpO1xyXG4gICAgICAgIHRkLmlubmVyVGV4dCA9IChwdXp6bGUubnVtYmVyc1tpXVtqXSB8fCAnJykudG9TdHJpbmcoKTtcclxuICAgICAgICB0ci5hcHBlbmRDaGlsZCh0ZCk7XHJcbiAgICAgIH1cclxuICAgICAgdGFibGUuYXBwZW5kQ2hpbGQodHIpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRhYmxlO1xyXG4gIH1cclxuICBcclxufSIsImltcG9ydCAqIGFzIFByaW9yaXR5UXVldWUgZnJvbSBcInByaW9yaXR5cXVldWVqc1wiO1xuXG5pbXBvcnQgeyBQdXp6bGUsIERpcmVjdGlvbiwgTEVOR1RIIH0gZnJvbSBcIi4vcHV6emxlXCI7XG5pbXBvcnQgeyBOb2RlIH0gZnJvbSBcIi4vbm9kZVwiO1xuaW1wb3J0IHsgQWJzdHJhY3REUyB9IGZyb20gXCIuL2RhdGEtc3RydWN0dXJlcy9hYnN0cmFjdC1kc1wiO1xuaW1wb3J0IHsgUXVldWUgfSBmcm9tIFwiLi9kYXRhLXN0cnVjdHVyZXMvcXVldWVcIjtcbmltcG9ydCB7IFN0YWNrIH0gZnJvbSBcIi4vZGF0YS1zdHJ1Y3R1cmVzL3N0YWNrXCI7XG5cbmV4cG9ydCBlbnVtIFN0cmF0ZWd5IHtcbiAgQkZTID0gXCJCRlNcIixcbiAgREZTID0gXCJERlNcIixcbiAgSVQgPSBcIklUXCIsXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU29sdXRpb25FbGVtZW50IHtcbiAgYWN0aW9uOiBEaXJlY3Rpb247XG4gIHN0YXRlOiBQdXp6bGU7XG4gIG5vZGU6IE5vZGU7XG59XG50eXBlIEZsYWdzID0geyBba2V5OiBzdHJpbmddOiBib29sZWFuIH07XG5mdW5jdGlvbiBjcmVhdGVOb2RlKFxuICBzdGF0ZTogUHV6emxlLFxuICBhY3Rpb246IERpcmVjdGlvbixcbiAgcGFyZW50OiBOb2RlLFxuICBkZWVwdGg6IG51bWJlcixcbiAgZj86IG51bWJlclxuKTogTm9kZSB7XG4gIHJldHVybiB7XG4gICAgYWN0aW9uOiBhY3Rpb24sXG4gICAgZGVlcHRoOiBkZWVwdGgsXG4gICAgcGFyZW50OiBwYXJlbnQsXG4gICAgc3RhdGU6IHN0YXRlLFxuICAgIGY6IGYsXG4gIH07XG59XG5cbmZ1bmN0aW9uIHNvbHV0aW9uKG5vZGU6IE5vZGUpIHtcbiAgbGV0IGFjdGlvbnM6IFNvbHV0aW9uRWxlbWVudFtdID0gW107XG4gIGxldCBjdXJyZW50ID0gbm9kZTtcbiAgd2hpbGUgKGN1cnJlbnQpIHtcbiAgICBhY3Rpb25zLnB1c2goe1xuICAgICAgYWN0aW9uOiBjdXJyZW50LmFjdGlvbixcbiAgICAgIHN0YXRlOiBjdXJyZW50LnN0YXRlLFxuICAgICAgbm9kZTogY3VycmVudCxcbiAgICB9KTtcbiAgICBjdXJyZW50ID0gY3VycmVudC5wYXJlbnQ7XG4gIH1cbiAgYWN0aW9ucy5yZXZlcnNlKCk7XG4gIHJldHVybiBhY3Rpb25zO1xufVxuXG5mdW5jdGlvbiBzdWNjZXNzb3JzKG5vZGU6IE5vZGUpIHtcbiAgbGV0IHB1enpsZSA9IG5vZGUuc3RhdGU7XG4gIGNvbnN0IG5leHRTdGF0ZXMgPSBwdXp6bGUuYWxsb3dlZERpcmVjdGlvbnMubWFwKChkaXJlY3Rpb24pID0+IHtcbiAgICByZXR1cm4gPFtEaXJlY3Rpb24sIFB1enpsZV0+W2RpcmVjdGlvbiwgcHV6emxlLm1vdmVFbXB0eShkaXJlY3Rpb24pXTtcbiAgfSk7XG4gIHJldHVybiBuZXh0U3RhdGVzO1xufVxuXG5mdW5jdGlvbiBleHBhbmQobm9kZTogTm9kZSk6IE5vZGVbXSB7XG4gIGxldCBuZXh0U3RhdGVzID0gc3VjY2Vzc29ycyhub2RlKTtcbiAgY29uc3QgcmVzdWx0ID0gbmV4dFN0YXRlcy5tYXAoKFthY3Rpb24sIHBdKSA9PiB7XG4gICAgbGV0IHJlcyA9IGNyZWF0ZU5vZGUocCwgYWN0aW9uLCBub2RlLCBOdW1iZXIuTUFYX1ZBTFVFKTtcbiAgICByZXMuZiA9IE51bWJlci5NQVhfVkFMVUU7XG4gICAgcmV0dXJuIHJlcztcbiAgfSk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIGcobm9kZTogTm9kZSwgb2JqZWN0aXZlOiBQdXp6bGUpOiBudW1iZXIge1xuICByZXR1cm4gbm9kZS5kZWVwdGg7XG59XG5cbmZ1bmN0aW9uIGgobm9kZTogTm9kZSwgb2JqZWN0aXZlOiBQdXp6bGUpOiBudW1iZXIge1xuICBsZXQgZGlmZmVyZW50Q291bnQgPSAwO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IExFTkdUSDsgaSsrKSB7XG4gICAgZm9yIChsZXQgaiA9IDA7IGogPCBMRU5HVEg7IGorKykge1xuICAgICAgaWYgKG9iamVjdGl2ZS5udW1iZXJzW2ldW2pdICE9IG5vZGUuc3RhdGUubnVtYmVyc1tpXVtqXSkge1xuICAgICAgICBkaWZmZXJlbnRDb3VudCsrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gZGlmZmVyZW50Q291bnQ7XG59XG5cbmZ1bmN0aW9uIGYobm9kZTogTm9kZSwgb2JqZWN0aXZlOiBQdXp6bGUpIHtcbiAgcmV0dXJuIGcobm9kZSwgb2JqZWN0aXZlKSArIGgobm9kZSwgb2JqZWN0aXZlKTtcbn1cblxuZnVuY3Rpb24gQVN0YXIoaW5pdGlhbDogUHV6emxlLCBvYmplY3RpdmU6IFB1enpsZSkge1xuICBjb25zdCB2aXNpdGVkID0ge307XG4gIGNvbnN0IHVudmlzaXRlZDogeyBba2V5OiBzdHJpbmddOiBOb2RlIH0gPSB7fTtcbiAgY29uc3Qga2V5cyA9IFtdO1xuICB1bnZpc2l0ZWRbaW5pdGlhbC5nZXRTZXJpYWwoKV0gPSBjcmVhdGVOb2RlKGluaXRpYWwsIG51bGwsIG51bGwsIDApO1xuICB1bnZpc2l0ZWRbaW5pdGlhbC5nZXRTZXJpYWwoKV0uZiA9IGYoXG4gICAgdW52aXNpdGVkW2luaXRpYWwuZ2V0U2VyaWFsKCldLFxuICAgIG9iamVjdGl2ZVxuICApO1xuICBpbnNlcnRTb3J0ZWQoa2V5cywgaW5pdGlhbC5nZXRTZXJpYWwoKSk7XG4gIGxldCBtaW5LZXkgPSBpbml0aWFsLmdldFNlcmlhbCgpO1xuICB3aGlsZSAoa2V5cy5sZW5ndGggIT09IDApIHtcbiAgICBsZXQgY3VycmVudF9ub2RlID0gZ2V0TWluaW11bih1bnZpc2l0ZWQsIGtleXMpO1xuICAgIGlmIChjdXJyZW50X25vZGUuZGVlcHRoID4gMjUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkZhaWxcIik7XG4gICAgfVxuICAgIGlmIChjdXJyZW50X25vZGUuc3RhdGUuZ2V0U2VyaWFsKCkgPT0gb2JqZWN0aXZlLmdldFNlcmlhbCgpKSB7XG4gICAgICByZXR1cm4gc29sdXRpb24oY3VycmVudF9ub2RlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IHN1Y2Nlc3NvcnMgPSBleHBhbmQoY3VycmVudF9ub2RlKTtcbiAgICAgIHN1Y2Nlc3NvcnMuZm9yRWFjaCgoZWxlbWVudCkgPT4ge1xuICAgICAgICBpZiAoIXVudmlzaXRlZFtlbGVtZW50LnN0YXRlLmdldFNlcmlhbCgpXSkge1xuICAgICAgICAgIHVudmlzaXRlZFtlbGVtZW50LnN0YXRlLmdldFNlcmlhbCgpXSA9IGVsZW1lbnQ7XG4gICAgICAgICAgaW5zZXJ0U29ydGVkKGtleXMsIGVsZW1lbnQuc3RhdGUuZ2V0U2VyaWFsKCkpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3VjY2Vzc29ycy5sZW5ndGg7IGkrKykge1xuICAgICAgICBsZXQgc3VjY2Vzc29yID0gc3VjY2Vzc29yc1tpXTtcbiAgICAgICAgaWYgKCF2aXNpdGVkW3N1Y2Nlc3Nvci5zdGF0ZS5nZXRTZXJpYWwoKV0pIHtcbiAgICAgICAgICBsZXQgbmV3X2dfc2NvcmUgPSBjdXJyZW50X25vZGUuZGVlcHRoICsgMTtcbiAgICAgICAgICBpZiAobmV3X2dfc2NvcmUgPCB1bnZpc2l0ZWRbc3VjY2Vzc29yLnN0YXRlLmdldFNlcmlhbCgpXS5kZWVwdGgpIHtcbiAgICAgICAgICAgIHVudmlzaXRlZFtzdWNjZXNzb3Iuc3RhdGUuZ2V0U2VyaWFsKCldLmRlZXB0aCA9IG5ld19nX3Njb3JlO1xuICAgICAgICAgICAgdW52aXNpdGVkW3N1Y2Nlc3Nvci5zdGF0ZS5nZXRTZXJpYWwoKV0uZiA9IGYoc3VjY2Vzc29yLCBvYmplY3RpdmUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdmlzaXRlZFtjdXJyZW50X25vZGUuc3RhdGUuZ2V0U2VyaWFsKCldID0gY3VycmVudF9ub2RlO1xuICAgICAgZGVsZXRlRnJvbUxpc3Qoa2V5cywgY3VycmVudF9ub2RlLnN0YXRlLmdldFNlcmlhbCgpKTtcbiAgICAgIGRlbGV0ZSB1bnZpc2l0ZWRbY3VycmVudF9ub2RlLnN0YXRlLmdldFNlcmlhbCgpXTtcbiAgICB9XG4gIH1cbiAgdGhyb3cgbmV3IEVycm9yKFwiRmFpbFwiKTtcbn1cblxuZnVuY3Rpb24gaW5zZXJ0U29ydGVkKGxpc3Q6IHN0cmluZ1tdLCB2YWx1ZTogc3RyaW5nKSB7XG4gIGxldCBzdGFydCA9IDA7IC8vIGZpcnN0IGluZGV4IGluIGFycmF5XG4gIGxldCBlbmQgPSBsaXN0Lmxlbmd0aCAtIDE7IC8vIHRoZSBsYXN0IGluZGV4IGluIHRoZSBhcnJheVxuICB3aGlsZSAoc3RhcnQgPD0gZW5kKSB7XG4gICAgbGV0IG1pZCA9IE1hdGguZmxvb3IoKHN0YXJ0ICsgZW5kKSAvIDIpOyAvL2NhbGN1bGF0ZSB0aGUgbWlkcG9pbnRcbiAgICBpZiAodmFsdWUgPT09IGxpc3RbbWlkXSkge1xuICAgIH0gZWxzZSBpZiAodmFsdWUgPCBsaXN0W21pZF0pIHtcbiAgICAgIGVuZCA9IG1pZCAtIDE7IC8vc2VhcmNoIG9ubHkgZmlyc3QgaGFsZiBvZiB0aGUgYXJyYXlcbiAgICB9IGVsc2UgaWYgKHZhbHVlID4gbGlzdFttaWRdKSB7XG4gICAgICBzdGFydCA9IG1pZCArIDE7IC8vc2VhcmNoIG9ubHkgMm5kIGhhbGYgb2YgdGhlIGFycmF5XG4gICAgfVxuICB9XG5cbiAgbGlzdC5zcGxpY2Uoc3RhcnQsIDAsIHZhbHVlKTtcbn1cblxuZnVuY3Rpb24gZGVsZXRlRnJvbUxpc3QobGlzdDogc3RyaW5nW10sIHZhbHVlOiBzdHJpbmcpIHtcbiAgbGV0IHN0YXJ0ID0gMDsgLy8gZmlyc3QgaW5kZXggaW4gYXJyYXlcbiAgbGV0IGVuZCA9IGxpc3QubGVuZ3RoIC0gMTsgLy8gdGhlIGxhc3QgaW5kZXggaW4gdGhlIGFycmF5XG4gIHdoaWxlIChzdGFydCA8PSBlbmQpIHtcbiAgICBsZXQgbWlkID0gTWF0aC5mbG9vcigoc3RhcnQgKyBlbmQpIC8gMik7IC8vY2FsY3VsYXRlIHRoZSBtaWRwb2ludFxuICAgIGlmICh2YWx1ZSA9PT0gbGlzdFttaWRdKSB7XG4gICAgICBsaXN0LnNwbGljZShtaWQsIDEpO1xuICAgICAgcmV0dXJuO1xuICAgIH0gZWxzZSBpZiAodmFsdWUgPCBsaXN0W21pZF0pIHtcbiAgICAgIGVuZCA9IG1pZCAtIDE7IC8vc2VhcmNoIG9ubHkgZmlyc3QgaGFsZiBvZiB0aGUgYXJyYXlcbiAgICB9IGVsc2UgaWYgKHZhbHVlID4gbGlzdFttaWRdKSB7XG4gICAgICBzdGFydCA9IG1pZCArIDE7IC8vc2VhcmNoIG9ubHkgMm5kIGhhbGYgb2YgdGhlIGFycmF5XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGdldE1pbmltdW4ob2JqZWN0OiB7IFtrZXk6IHN0cmluZ106IE5vZGUgfSwga2V5czogc3RyaW5nW10pIHtcbiAgbGV0IG1pbiA9IG9iamVjdFtrZXlzWzBdXTtcbiAgZm9yIChsZXQgaSA9IDE7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgbGV0IGVsZW1lbnQgPSBvYmplY3Rba2V5c1tpXV07XG4gICAgaWYgKGVsZW1lbnQuZiA8IG1pbi5mKSB7XG4gICAgICBtaW4gPSBlbGVtZW50O1xuICAgIH1cbiAgfVxuICByZXR1cm4gbWluO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc29sdmUocHV6emxlOiBQdXp6bGUsIG9iamVjdGl2ZTogUHV6emxlKSB7XG4gIGxldCByZXN1bHQgPSBudWxsO1xuICByZXN1bHQgPSBBU3RhcihwdXp6bGUsIG9iamVjdGl2ZSk7XG4gIHJldHVybiByZXN1bHQ7XG59XG4iLCJpbXBvcnQgeyBQb2ludCB9IGZyb20gXCIuL3BvaW50XCI7XHJcblxyXG5leHBvcnQgZW51bSBEaXJlY3Rpb24ge1xyXG4gIExlZnQgPSBcIkxlZnRcIixcclxuICBSaWdodCA9IFwiUmlndGhcIixcclxuICBVcCA9IFwiVXBcIixcclxuICBEb3duID0gXCJEb3duXCIsXHJcbn1cclxuXHJcblxyXG5cclxuY29uc3QgYWxsb3dlZE1vdmVzQ29sdW1uTWFwOiB7IFtpbmRleDogbnVtYmVyXTogRGlyZWN0aW9uW10gfSA9IHtcclxuICAwOiBbRGlyZWN0aW9uLlJpZ2h0XSxcclxuICAxOiBbRGlyZWN0aW9uLkxlZnQsIERpcmVjdGlvbi5SaWdodF0sXHJcbiAgMjogW0RpcmVjdGlvbi5MZWZ0XSxcclxufTtcclxuXHJcbmNvbnN0IGFsbG93ZWRNb3Zlc1Jvd01hcDogeyBbaW5kZXg6IG51bWJlcl06IERpcmVjdGlvbltdIH0gPSB7XHJcbiAgMDogW0RpcmVjdGlvbi5Eb3duXSxcclxuICAxOiBbRGlyZWN0aW9uLlVwLCBEaXJlY3Rpb24uRG93bl0sXHJcbiAgMjogW0RpcmVjdGlvbi5VcF0sXHJcbn07XHJcblxyXG50eXBlIERpcmVjdGlvbk1hcFR5cGUgPSB7W3g6IHN0cmluZ106IG51bWJlcn07XHJcblxyXG5jb25zdCBkaXJlY3Rpb25NYXA6IERpcmVjdGlvbk1hcFR5cGUgPSB7XHJcbiAgW0RpcmVjdGlvbi5VcF06IC0xLFxyXG4gIFtEaXJlY3Rpb24uRG93bl06IDEsXHJcbiAgW0RpcmVjdGlvbi5MZWZ0XTogLTEsXHJcbiAgW0RpcmVjdGlvbi5SaWdodF06IDEsXHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgTEVOR1RIID0gMztcclxuXHJcbmV4cG9ydCBjbGFzcyBQdXp6bGUge1xyXG4gIHByaXZhdGUgX2FsbG93ZWREaXJlY3Rpb25zOiBEaXJlY3Rpb25bXTtcclxuXHJcbiAgZ2V0IGFsbG93ZWREaXJlY3Rpb25zKCk6IERpcmVjdGlvbltdIHtcclxuICAgIGlmICghdGhpcy5fYWxsb3dlZERpcmVjdGlvbnMpIHtcclxuICAgICAgdGhpcy5jYWxjdWxhdGVBbGxvd2VkRGlyZWN0aW9ucygpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXMuX2FsbG93ZWREaXJlY3Rpb25zO1xyXG4gIH1cclxuXHJcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfbnVtYmVyczogbnVtYmVyW11bXSkge1xyXG4gIH1cclxuXHJcbiAgZ2V0IG51bWJlcnMgKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX251bWJlcnM7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHZhbGlkYXRlTnVtYmVycygpIHtcclxuICAgIGxldCBlbXB0eVNwYWNlRm91bmQgPSBmYWxzZTtcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgTEVOR1RIOyBpKyspIHtcclxuICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBMRU5HVEg7IGorKykge1xyXG4gICAgICAgIGxldCBjdXJyZW50TnVtYmVyID0gdGhpcy5fbnVtYmVyc1tpXVtqXTtcclxuICAgICAgICBpZiAoIWN1cnJlbnROdW1iZXIpIHtcclxuICAgICAgICAgIGVtcHR5U3BhY2VGb3VuZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjdXJyZW50TnVtYmVyIDwgMSB8fCBjdXJyZW50TnVtYmVyID4gOCkge1xyXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIG51bWJlcnMnKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIG1vdmVFbXB0eShkaXJlY3Rpb246IERpcmVjdGlvbik6IFB1enpsZSB7XHJcbiAgICBpZiAodGhpcy5hbGxvd2VkRGlyZWN0aW9ucy5pbmNsdWRlcyhkaXJlY3Rpb24pKSB7XHJcbiAgICAgIGNvbnN0IGN1cnJlbnRFbXB0eUxvY2F0aW9uID0gdGhpcy5nZXRFbXB0eVNwYWNlTG9jYXRpb24oKTtcclxuICAgICAgY29uc3QgdGFyZ2V0TG9jYXRpb246IFBvaW50ID0gey4uLmN1cnJlbnRFbXB0eUxvY2F0aW9ufTtcclxuICAgICAgbGV0IHByb3BlcnR5VG9Nb2RpZnkgPSAneCc7XHJcbiAgICAgIGlmIChbRGlyZWN0aW9uLlVwLCBEaXJlY3Rpb24uRG93bl0uaW5jbHVkZXMoZGlyZWN0aW9uKSkge1xyXG4gICAgICAgIHByb3BlcnR5VG9Nb2RpZnkgPSAneSc7XHJcbiAgICAgIH1cclxuICAgICAgdGFyZ2V0TG9jYXRpb25bcHJvcGVydHlUb01vZGlmeV0gKz0gZGlyZWN0aW9uTWFwW2RpcmVjdGlvbl07XHJcbiAgICAgIGNvbnN0IG5ld051bWJlcnMgPSB0aGlzLnN3YXAoY3VycmVudEVtcHR5TG9jYXRpb24sIHRhcmdldExvY2F0aW9uKTtcclxuICAgICAgcmV0dXJuIG5ldyBQdXp6bGUobmV3TnVtYmVycyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJtb3ZlbWVudCBub3QgYWxsb3dlZFwiKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgc3dhcChhOiBQb2ludCwgYjogUG9pbnQpIHtcclxuICAgIGNvbnN0IG5ld051bWJlcnMgPSB0aGlzLl9udW1iZXJzLm1hcChyb3dzID0+IFsuLi5yb3dzXSk7XHJcbiAgICBsZXQgYXV4OiBudW1iZXIgPSBuZXdOdW1iZXJzW2IueV1bYi54XTtcclxuICAgIG5ld051bWJlcnNbYi55XVtiLnhdID0gbmV3TnVtYmVyc1thLnldW2EueF07XHJcbiAgICBuZXdOdW1iZXJzW2EueV1bYS54XSA9IGF1eDtcclxuICAgIHJldHVybiBuZXdOdW1iZXJzO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXRFbXB0eVNwYWNlTG9jYXRpb24oKTogUG9pbnQge1xyXG4gICAgbGV0IGNvbDogbnVtYmVyO1xyXG4gICAgbGV0IHJvdzogbnVtYmVyO1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBMRU5HVEg7IGkrKykge1xyXG4gICAgICBmb3IgKGxldCBqID0gMDsgaiA8IExFTkdUSDsgaisrKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9udW1iZXJzW2ldW2pdKSB7XHJcbiAgICAgICAgICByb3cgPSBpO1xyXG4gICAgICAgICAgY29sID0gajtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIDxQb2ludD57IHg6IGNvbCwgeTogcm93IH07XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGNhbGN1bGF0ZUFsbG93ZWREaXJlY3Rpb25zKCkge1xyXG4gICAgY29uc3QgZW1wdHlTcGFjZUxvY2F0aW9uID0gdGhpcy5nZXRFbXB0eVNwYWNlTG9jYXRpb24oKTtcclxuICAgIHRoaXMuX2FsbG93ZWREaXJlY3Rpb25zID0gYWxsb3dlZE1vdmVzQ29sdW1uTWFwW1xyXG4gICAgICBlbXB0eVNwYWNlTG9jYXRpb24ueFxyXG4gICAgXS5jb25jYXQoYWxsb3dlZE1vdmVzUm93TWFwW2VtcHR5U3BhY2VMb2NhdGlvbi55XSk7XHJcbiAgfVxyXG4gIHNlcmlhbDogc3RyaW5nO1xyXG4gIGdldFNlcmlhbCgpIHtcclxuICAgIGlmICghdGhpcy5zZXJpYWwpIHtcclxuICAgICAgdGhpcy5zZXJpYWwgPSBKU09OLnN0cmluZ2lmeSh0aGlzLl9udW1iZXJzKTtcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzLnNlcmlhbDtcclxuICB9XHJcbn1cclxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsImltcG9ydCB7IFB1enpsZSB9IGZyb20gXCIuL3B1enpsZVwiO1xuaW1wb3J0IHsgUHV6emxlQ29uc3RydWN0b3IgfSBmcm9tIFwiLi9wdXp6bGUtY29uc3RydWN0b3JcIjtcbmltcG9ydCB7IFB1enpsZVBhaW50ZXIgfSBmcm9tIFwiLi9wdXp6bGUtcGFpbnRlclwiO1xuaW1wb3J0IHsgc29sdmUsIFN0cmF0ZWd5IH0gZnJvbSBcIi4vcHV6emxlLXNvbHZlclwiO1xuY29uc3QgbmV3U3RhdGVCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5ld1N0YXRlQnRuXCIpO1xuY29uc3QgZmluZFNvbHV0aW9uQnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJmaW5kU29sdXRpb25cIik7XG5jb25zdCBpbml0aWFsQ29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJpbml0aWFsU3RhdGVDb250YWluZXJcIik7XG5jb25zdCBvYmplY3RpdmVDb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm9iamVjdGl2ZUNvbnRhaW5lclwiKTtcbmNvbnN0IHNvbHV0aW9uQ29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzb2x1dGlvbkNvbnRhaW5lclwiKTtcbmNvbnN0IGRpc2NsYWltZXJDb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRpc2NsYWltZXJcIik7XG5jb25zdCBjb3N0b0NvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29zdG9Db250YWluZXJcIik7XG5jbGFzcyBNYWluIHtcbiAgaW5pdGlhbFN0YXRlOiBQdXp6bGU7XG4gIG9iamV0aXZlOiBQdXp6bGU7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1enpsZUNvbnN0cnVjdG9yOiBQdXp6bGVDb25zdHJ1Y3RvcixcbiAgICBwcml2YXRlIHB1enpsZVBhaW50ZXI6IFB1enpsZVBhaW50ZXJcbiAgKSB7XG4gICAgdGhpcy5vYmpldGl2ZSA9IHB1enpsZUNvbnN0cnVjdG9yLmNvbnN0cnVjdFB1enpsZShbXG4gICAgICAxLFxuICAgICAgMixcbiAgICAgIDMsXG4gICAgICA0LFxuICAgICAgdW5kZWZpbmVkLFxuICAgICAgNSxcbiAgICAgIDYsXG4gICAgICA3LFxuICAgICAgOCxcbiAgICBdKTtcbiAgICBvYmplY3RpdmVDb250YWluZXIuYXBwZW5kQ2hpbGQoXG4gICAgICBwdXp6bGVQYWludGVyLmdldFB1enpsZVJlcHJlc2VudGF0aW9uKHRoaXMub2JqZXRpdmUpXG4gICAgKTtcbiAgfVxuXG4gIHNldEluaXRpYWxTdGF0ZShpbml0aWFsU3RhdGU6IFB1enpsZSkge1xuICAgIGxldCBpbml0aWFsID0gaW5pdGlhbFN0YXRlO1xuICAgIC8vIGluaXRpYWwgPSBuZXcgUHV6emxlKFtcbiAgICAvLyAgIFsxICwyLCA1XSxcbiAgICAvLyAgIFs4LCA2LCAzXSxcbiAgICAvLyAgIFs0LCBudWxsLCA3IF1cbiAgICAvLyBdKTtcbiAgICBzb2x1dGlvbkNvbnRhaW5lci5pbm5lckhUTUwgPSBcIlwiO1xuICAgIGluaXRpYWxDb250YWluZXIuaW5uZXJIVE1MID0gXCJcIjtcbiAgICB0aGlzLmluaXRpYWxTdGF0ZSA9IGluaXRpYWw7XG4gICAgaW5pdGlhbENvbnRhaW5lci5hcHBlbmRDaGlsZChcbiAgICAgIHRoaXMucHV6emxlUGFpbnRlci5nZXRQdXp6bGVSZXByZXNlbnRhdGlvbih0aGlzLmluaXRpYWxTdGF0ZSlcbiAgICApO1xuICB9XG5cbiAgc29sdmUoKSB7XG4gICAgaWYgKCF0aGlzLmluaXRpYWxTdGF0ZSkge1xuICAgICAgYWxlcnQoXCJEYSBjbGljIGFsIGJvdMOzbiAnR2VuZXJhciBlc3RhZG8gaW5pY2lhbCdcIik7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHNvbHV0aW9uQ29udGFpbmVyLmlubmVySFRNTCA9ICcnXG5cbiAgICBkaXNjbGFpbWVyQ29udGFpbmVyLmlubmVySFRNTCA9XG4gICAgICBcIjxwPlNPTFVDSU9OQU5ETy4uLjwvcD48cD5OT1RBISBQdWVkZSBzZXIgcXVlIGVsIGFsZ29yaXRtbyB0YXJkZSBiYXN0YW50ZSB5IHF1ZSBlbCBuYXZlZ2Fkb3Igbm8gc2VhIHJlc3BvbnNpdm8gbWllbnRyYXMgZXN0ZSBzZSBlamVjdXRhIHkgcXVlIHNlIG11ZXN0cmUgdW4gbWVuc2FqZSBkZSBxdWUgbGEgcMOhZ2luYSBoYSBzaWRvIGJsb3F1ZWRhLCBwb3IgZmF2b3Igbm8gY2VycmFyIGxhIHDDoWdpbmEgeSBkYXIgY2xpYyBhIGVzcGVyYXI8L3A+XCI7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICAvLyBjb25zdCBwdXp6bGUgPSBuZXcgUHV6emxlKFtbMSwgMiwgM10sWzQsIHVuZGVmaW5lZCwgNV0sWzYsIDcsIDhdXSlcbiAgICAgICAgbGV0IHNvbHV0aW9uID0gc29sdmUodGhpcy5pbml0aWFsU3RhdGUsIHRoaXMub2JqZXRpdmUpO1xuICAgICAgICBzb2x1dGlvblxuICAgICAgICAgIC5tYXAoKHMsIGkpID0+IHtcbiAgICAgICAgICAgIGxldCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICAgICAgZGl2LmlubmVySFRNTCA9IGA8c3Ryb25nPlBhc28gJHtpICsgMX08L3N0cm9uZz5gO1xuICAgICAgICAgICAgbGV0IHB1enpsZSA9IHRoaXMucHV6emxlUGFpbnRlci5nZXRQdXp6bGVSZXByZXNlbnRhdGlvbihzLnN0YXRlKTtcbiAgICAgICAgICAgIGRpdi5hcHBlbmRDaGlsZChwdXp6bGUpO1xuICAgICAgICAgICAgcmV0dXJuIGRpdjtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5mb3JFYWNoKChkKSA9PiB7XG4gICAgICAgICAgICBzb2x1dGlvbkNvbnRhaW5lci5hcHBlbmRDaGlsZChkKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgZGlzY2xhaW1lckNvbnRhaW5lci5pbm5lckhUTUwgPSBcIlwiO1xuICAgICAgICBjb3N0b0NvbnRhaW5lci5pbm5lclRleHQgPSBzb2x1dGlvbltzb2x1dGlvbi5sZW5ndGggLSAxXS5ub2RlLmRlZXB0aC50b1N0cmluZygpO1xuICAgICAgfSBjYXRjaCAoZXhjZXB0aW9uKSB7XG4gICAgICAgIGFsZXJ0KFwiRWwgcHV6emxlIG5vIHB1ZG8gc2VyIHJlc3VlbHRvXCIpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59XG5cbmNvbnN0IHB1enpsZUNvbnN0cnVjdG9yID0gbmV3IFB1enpsZUNvbnN0cnVjdG9yKCk7XG5jb25zdCBtYWluID0gbmV3IE1haW4ocHV6emxlQ29uc3RydWN0b3IsIG5ldyBQdXp6bGVQYWludGVyKCkpO1xubmV3U3RhdGVCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGdlbmVyYXRlTmV3SW5pdGlhbFN0YXRlKTtcbmZpbmRTb2x1dGlvbkJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICBtYWluLnNvbHZlKCk7XG59KTtcblxuZnVuY3Rpb24gZ2VuZXJhdGVOZXdJbml0aWFsU3RhdGUoKSB7XG4gIG1haW4uc2V0SW5pdGlhbFN0YXRlKHB1enpsZUNvbnN0cnVjdG9yLmNvbnN0cnVjdFJhbmRvbVB1enpsZSgpKTtcbn1cblxuZ2VuZXJhdGVOZXdJbml0aWFsU3RhdGUoKTtcblxuIl0sInNvdXJjZVJvb3QiOiIifQ==