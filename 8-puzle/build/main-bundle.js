/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/puzzle-constructor.ts":
/*!***********************************!*\
  !*** ./src/puzzle-constructor.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

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

"use strict";

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

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.solve = exports.Strategy = void 0;
const puzzle_1 = __webpack_require__(/*! ./puzzle */ "./src/puzzle.ts");
const PriorityQueueJs = __webpack_require__(/*! priorityqueuejs */ "./node_modules/priorityqueuejs/index.js");
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
function Dijstra(initial, objective) {
    let seen = {};
    let currentPriority = {};
    const queue = new PriorityQueueJs((a, b) => {
        return (b.deepth - a.deepth);
    });
    let queueSize = 1;
    enq(queue, currentPriority, createNode(initial, null, null, 0));
    while (queueSize) {
        let u = deq(queue, currentPriority);
        queueSize--;
        if (u.state.getSerial() == objective.getSerial()) {
            return solution(u);
        }
        let successors = expand(u);
        successors = successors.filter((e) => !(e.state.getSerial() in seen));
        queueSize += successors.length;
        successors.forEach((element) => {
            enq(queue, currentPriority, element);
        });
        for (let i = 0; i < successors.length; i++) {
            let successor = successors[i];
            seen[successor.state.getSerial()] = true;
            let alt = u.deepth + 1;
            if (alt < successor.deepth) {
                enq(queue, currentPriority, { ...successor, deepth: alt });
            }
        }
    }
    throw new Error("Fail");
}
function deq(queue, tracker) {
    while (true) {
        let result = queue.deq();
        if (result.deepth == tracker[result.state.getSerial()]) {
            return result;
        }
    }
}
function enq(queue, tracker, element) {
    queue.enq(element);
    tracker[element.state.getSerial()] = element.deepth;
}
function getMinAndRemoveFound(list, distances) {
    let minValue = Number.MAX_VALUE;
    let minNode = null;
    let minIndex = -1;
    for (let i = 0; i < list.length; i++) {
        let distance = distances[list[i].state.getSerial()];
        if (distance < minValue) {
            minValue = distance;
            minNode = list[i];
            minIndex = i;
        }
    }
    list.splice(minIndex, 1);
    return minNode;
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
    result = Dijstra(puzzle, objective);
    return result;
}
exports.solve = solve;


/***/ }),

/***/ "./src/puzzle.ts":
/*!***********************!*\
  !*** ./src/puzzle.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

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


/***/ }),

/***/ "./node_modules/priorityqueuejs/index.js":
/*!***********************************************!*\
  !*** ./node_modules/priorityqueuejs/index.js ***!
  \***********************************************/
/***/ ((module) => {

/**
 * Expose `PriorityQueue`.
 */
module.exports = PriorityQueue;

/**
 * Initializes a new empty `PriorityQueue` with the given `comparator(a, b)`
 * function, uses `.DEFAULT_COMPARATOR()` when no function is provided.
 *
 * The comparator function must return a positive number when `a > b`, 0 when
 * `a == b` and a negative number when `a < b`.
 *
 * @param {Function}
 * @return {PriorityQueue}
 * @api public
 */
function PriorityQueue(comparator) {
  this._comparator = comparator || PriorityQueue.DEFAULT_COMPARATOR;
  this._elements = [];
}

/**
 * Compares `a` and `b`, when `a > b` it returns a positive number, when
 * it returns 0 and when `a < b` it returns a negative number.
 *
 * @param {String|Number} a
 * @param {String|Number} b
 * @return {Number}
 * @api public
 */
PriorityQueue.DEFAULT_COMPARATOR = function(a, b) {
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  } else {
    a = a.toString();
    b = b.toString();

    if (a == b) return 0;

    return (a > b) ? 1 : -1;
  }
};

/**
 * Returns whether the priority queue is empty or not.
 *
 * @return {Boolean}
 * @api public
 */
PriorityQueue.prototype.isEmpty = function() {
  return this.size() === 0;
};

/**
 * Peeks at the top element of the priority queue.
 *
 * @return {Object}
 * @throws {Error} when the queue is empty.
 * @api public
 */
PriorityQueue.prototype.peek = function() {
  if (this.isEmpty()) throw new Error('PriorityQueue is empty');

  return this._elements[0];
};

/**
 * Dequeues the top element of the priority queue.
 *
 * @return {Object}
 * @throws {Error} when the queue is empty.
 * @api public
 */
PriorityQueue.prototype.deq = function() {
  var first = this.peek();
  var last = this._elements.pop();
  var size = this.size();

  if (size === 0) return first;

  this._elements[0] = last;
  var current = 0;

  while (current < size) {
    var largest = current;
    var left = (2 * current) + 1;
    var right = (2 * current) + 2;

    if (left < size && this._compare(left, largest) >= 0) {
      largest = left;
    }

    if (right < size && this._compare(right, largest) >= 0) {
      largest = right;
    }

    if (largest === current) break;

    this._swap(largest, current);
    current = largest;
  }

  return first;
};

/**
 * Enqueues the `element` at the priority queue and returns its new size.
 *
 * @param {Object} element
 * @return {Number}
 * @api public
 */
PriorityQueue.prototype.enq = function(element) {
  var size = this._elements.push(element);
  var current = size - 1;

  while (current > 0) {
    var parent = Math.floor((current - 1) / 2);

    if (this._compare(current, parent) <= 0) break;

    this._swap(parent, current);
    current = parent;
  }

  return size;
};

/**
 * Returns the size of the priority queue.
 *
 * @return {Number}
 * @api public
 */
PriorityQueue.prototype.size = function() {
  return this._elements.length;
};

/**
 *  Iterates over queue elements
 *
 *  @param {Function} fn
 */
PriorityQueue.prototype.forEach = function(fn) {
  return this._elements.forEach(fn);
};

/**
 * Compares the values at position `a` and `b` in the priority queue using its
 * comparator function.
 *
 * @param {Number} a
 * @param {Number} b
 * @return {Number}
 * @api private
 */
PriorityQueue.prototype._compare = function(a, b) {
  return this._comparator(this._elements[a], this._elements[b]);
};

/**
 * Swaps the values at position `a` and `b` in the priority queue.
 *
 * @param {Number} a
 * @param {Number} b
 * @api private
 */
PriorityQueue.prototype._swap = function(a, b) {
  var aux = this._elements[a];
  this._elements[a] = this._elements[b];
  this._elements[b] = aux;
};


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
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
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
        //   [6 ,7, 3],
        //   [1, 4, 2],
        //   [8, null, 5 ]
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9wcmFjdGljYTIvLi9zcmMvcHV6emxlLWNvbnN0cnVjdG9yLnRzIiwid2VicGFjazovL3ByYWN0aWNhMi8uL3NyYy9wdXp6bGUtcGFpbnRlci50cyIsIndlYnBhY2s6Ly9wcmFjdGljYTIvLi9zcmMvcHV6emxlLXNvbHZlci50cyIsIndlYnBhY2s6Ly9wcmFjdGljYTIvLi9zcmMvcHV6emxlLnRzIiwid2VicGFjazovL3ByYWN0aWNhMi8uL25vZGVfbW9kdWxlcy9wcmlvcml0eXF1ZXVlanMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vcHJhY3RpY2EyL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3ByYWN0aWNhMi8uL3NyYy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBQUEsd0VBQWtDO0FBQ2xDLE1BQWEsaUJBQWlCO0lBQzVCLGdCQUFlLENBQUM7SUFDaEIscUJBQXFCO1FBQ25CLE1BQU0sYUFBYSxHQUFHLENBQUMsR0FBRyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3hDLE1BQU0sUUFBUSxHQUFHLENBQUMsR0FBRyxJQUFJLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ3BDLElBQUksV0FBVyxHQUFHLENBQUMsQ0FBQztRQUNwQixPQUFPLFdBQVcsR0FBRyxDQUFDLEVBQUU7WUFDdEIsSUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDNUMsSUFBSSxlQUFlLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDOUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsRUFBRTtnQkFDNUIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsRUFBRTtvQkFDbkMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxHQUFHLGFBQWEsQ0FBQztvQkFDL0MsV0FB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bGUgfSBmcm9tIFwiLi9wdXp6bGVcIjtcclxuZXhwb3J0IGNsYXNzIFB1enpsZUNvbnN0cnVjdG9yIHtcclxuICBjb25zdHJ1Y3RvcigpIHt9XHJcbiAgY29uc3RydWN0UmFuZG9tUHV6emxlKCk6IFB1enpsZSB7XHJcbiAgICBjb25zdCBwdXp6bGVOdW1iZXJzID0gWy4uLm5ldyBBcnJheSg5KV07XHJcbiAgICBjb25zdCBzZWxlY3RlZCA9IFsuLi5uZXcgQXJyYXkoMTApXTtcclxuICAgIGxldCBzZXRFbGVtZW50cyA9IDA7XHJcbiAgICB3aGlsZSAoc2V0RWxlbWVudHMgPCA4KSB7XHJcbiAgICAgIGxldCBjdXJyZW50TnVtYmVyID0gdGhpcy5nZXRSYW5kb21JbnQoMSwgOCk7XHJcbiAgICAgIGxldCBjdXJyZW50UG9zaXRpb24gPSB0aGlzLmdldFJhbmRvbUludCgwLCA4KTtcclxuICAgICAgaWYgKCFzZWxlY3RlZFtjdXJyZW50TnVtYmVyXSkge1xyXG4gICAgICAgIGlmICghcHV6emxlTnVtYmVyc1tjdXJyZW50UG9zaXRpb25dKSB7XHJcbiAgICAgICAgICBwdXp6bGVOdW1iZXJzW2N1cnJlbnRQb3NpdGlvbl0gPSBjdXJyZW50TnVtYmVyO1xyXG4gICAgICAgICAgc2V0RWxlbWVudHMgKys7XHJcbiAgICAgICAgICBzZWxlY3RlZFtjdXJyZW50TnVtYmVyXSA9IDE7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBjb25zdCBtYXRyaXggPSB0aGlzLmNvbnN0cnVjdFNxdWFyZU1hdHJpeEZyb21PbmVEaW1lbnNpb25BcnJheShwdXp6bGVOdW1iZXJzLCAzKTtcclxuICAgIHJldHVybiBuZXcgUHV6emxlKG1hdHJpeCk7XHJcbiAgfVxyXG5cclxuICBjb25zdHJ1Y3RQdXp6bGUobnVtYmVyczogbnVtYmVyW10pIHtcclxuICAgIGNvbnN0IG1hdHJpeCA9IHRoaXMuY29uc3RydWN0U3F1YXJlTWF0cml4RnJvbU9uZURpbWVuc2lvbkFycmF5KG51bWJlcnMsIDMpO1xyXG4gICAgcmV0dXJuIG5ldyBQdXp6bGUobWF0cml4KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgY29uc3RydWN0U3F1YXJlTWF0cml4RnJvbU9uZURpbWVuc2lvbkFycmF5KGFycmF5OiBudW1iZXJbXSwgbGVuZ3RoOiBudW1iZXIpIHtcclxuICAgIGNvbnN0IHBsYWNlaG9sZGVyID0gWy4uLm5ldyBBcnJheShsZW5ndGgpXS5tYXAoKCkgPT4gWy4uLm5ldyBBcnJheShsZW5ndGgpXSk7XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGxldCByb3cgPSBNYXRoLmZsb29yKGkgLyBsZW5ndGgpO1xyXG4gICAgICBsZXQgY29sdW1uID0gaSVsZW5ndGg7XHJcbiAgICAgIHBsYWNlaG9sZGVyW3Jvd11bY29sdW1uXSA9IGFycmF5W2ldO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHBsYWNlaG9sZGVyO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXRSYW5kb21JbnQobWluOiBudW1iZXIsIG1heDogbnVtYmVyKSB7XHJcbiAgICBtaW4gPSBNYXRoLmNlaWwobWluKTtcclxuICAgIG1heCA9IE1hdGguZmxvb3IobWF4KTtcclxuICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkpICsgbWluO1xyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQgeyBMRU5HVEgsIFB1enpsZSB9IGZyb20gXCIuL3B1enpsZVwiO1xyXG5cclxuZXhwb3J0IGNsYXNzIFB1enpsZVBhaW50ZXIge1xyXG4gIGdldFB1enpsZVJlcHJlc2VudGF0aW9uKHB1enpsZTogUHV6emxlKSB7XHJcbiAgICBjb25zdCB0YWJsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RhYmxlJyk7XHJcbiAgICB0YWJsZS5jbGFzc05hbWUgPSAncHV6emxlJztcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgTEVOR1RIOyBpKyspIHtcclxuICAgICAgbGV0IHRyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndHInKTtcclxuICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBMRU5HVEg7IGorKykge1xyXG4gICAgICAgIGxldCB0ZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RkJyk7XHJcbiAgICAgICAgdGQuaW5uZXJUZXh0ID0gKHB1enpsZS5udW1iZXJzW2ldW2pdIHx8ICcnKS50b1N0cmluZygpO1xyXG4gICAgICAgIHRyLmFwcGVuZENoaWxkKHRkKTtcclxuICAgICAgfVxyXG4gICAgICB0YWJsZS5hcHBlbmRDaGlsZCh0cik7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGFibGU7XHJcbiAgfVxyXG4gIFxyXG59IiwiaW1wb3J0IHsgUHV6emxlLCBEaXJlY3Rpb24sIExFTkdUSCB9IGZyb20gXCIuL3B1enpsZVwiO1xuaW1wb3J0IHsgTm9kZSB9IGZyb20gXCIuL25vZGVcIjtcbmltcG9ydCB7IEFic3RyYWN0RFMgfSBmcm9tIFwiLi9kYXRhLXN0cnVjdHVyZXMvYWJzdHJhY3QtZHNcIjtcbmltcG9ydCB7IFF1ZXVlIH0gZnJvbSBcIi4vZGF0YS1zdHJ1Y3R1cmVzL3F1ZXVlXCI7XG5pbXBvcnQgeyBTdGFjayB9IGZyb20gXCIuL2RhdGEtc3RydWN0dXJlcy9zdGFja1wiO1xuaW1wb3J0ICogYXMgUHJpb3JpdHlRdWV1ZUpzIGZyb20gXCJwcmlvcml0eXF1ZXVlanNcIjtcblxuZXhwb3J0IGVudW0gU3RyYXRlZ3kge1xuICBCRlMgPSBcIkJGU1wiLFxuICBERlMgPSBcIkRGU1wiLFxuICBJVCA9IFwiSVRcIixcbn1cblxuZXhwb3J0IGludGVyZmFjZSBTb2x1dGlvbkVsZW1lbnQge1xuICBhY3Rpb246IERpcmVjdGlvbjtcbiAgc3RhdGU6IFB1enpsZTtcbiAgbm9kZTogTm9kZTtcbn1cbnR5cGUgRmxhZ3MgPSB7IFtrZXk6IHN0cmluZ106IGJvb2xlYW4gfTtcbmZ1bmN0aW9uIGNyZWF0ZU5vZGUoXG4gIHN0YXRlOiBQdXp6bGUsXG4gIGFjdGlvbjogRGlyZWN0aW9uLFxuICBwYXJlbnQ6IE5vZGUsXG4gIGRlZXB0aDogbnVtYmVyLFxuICBmPzogbnVtYmVyXG4pOiBOb2RlIHtcbiAgcmV0dXJuIHtcbiAgICBhY3Rpb246IGFjdGlvbixcbiAgICBkZWVwdGg6IGRlZXB0aCxcbiAgICBwYXJlbnQ6IHBhcmVudCxcbiAgICBzdGF0ZTogc3RhdGUsXG4gICAgZjogZixcbiAgfTtcbn1cblxuZnVuY3Rpb24gc29sdXRpb24obm9kZTogTm9kZSkge1xuICBsZXQgYWN0aW9uczogU29sdXRpb25FbGVtZW50W10gPSBbXTtcbiAgbGV0IGN1cnJlbnQgPSBub2RlO1xuICB3aGlsZSAoY3VycmVudCkge1xuICAgIGFjdGlvbnMucHVzaCh7XG4gICAgICBhY3Rpb246IGN1cnJlbnQuYWN0aW9uLFxuICAgICAgc3RhdGU6IGN1cnJlbnQuc3RhdGUsXG4gICAgICBub2RlOiBjdXJyZW50LFxuICAgIH0pO1xuICAgIGN1cnJlbnQgPSBjdXJyZW50LnBhcmVudDtcbiAgfVxuICBhY3Rpb25zLnJldmVyc2UoKTtcbiAgcmV0dXJuIGFjdGlvbnM7XG59XG5cbmZ1bmN0aW9uIHN1Y2Nlc3NvcnMobm9kZTogTm9kZSkge1xuICBsZXQgcHV6emxlID0gbm9kZS5zdGF0ZTtcbiAgY29uc3QgbmV4dFN0YXRlcyA9IHB1enpsZS5hbGxvd2VkRGlyZWN0aW9ucy5tYXAoKGRpcmVjdGlvbikgPT4ge1xuICAgIHJldHVybiA8W0RpcmVjdGlvbiwgUHV6emxlXT5bZGlyZWN0aW9uLCBwdXp6bGUubW92ZUVtcHR5KGRpcmVjdGlvbildO1xuICB9KTtcbiAgcmV0dXJuIG5leHRTdGF0ZXM7XG59XG5cbmZ1bmN0aW9uIGV4cGFuZChub2RlOiBOb2RlKTogTm9kZVtdIHtcbiAgbGV0IG5leHRTdGF0ZXMgPSBzdWNjZXNzb3JzKG5vZGUpO1xuICBjb25zdCByZXN1bHQgPSBuZXh0U3RhdGVzLm1hcCgoW2FjdGlvbiwgcF0pID0+IHtcbiAgICBsZXQgcmVzID0gY3JlYXRlTm9kZShwLCBhY3Rpb24sIG5vZGUsIE51bWJlci5NQVhfVkFMVUUpO1xuICAgIHJlcy5mID0gTnVtYmVyLk1BWF9WQUxVRTtcbiAgICByZXR1cm4gcmVzO1xuICB9KTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gZyhub2RlOiBOb2RlLCBvYmplY3RpdmU6IFB1enpsZSk6IG51bWJlciB7XG4gIHJldHVybiBub2RlLmRlZXB0aDtcbn1cblxuZnVuY3Rpb24gaChub2RlOiBOb2RlLCBvYmplY3RpdmU6IFB1enpsZSk6IG51bWJlciB7XG4gIGxldCBkaWZmZXJlbnRDb3VudCA9IDA7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgTEVOR1RIOyBpKyspIHtcbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IExFTkdUSDsgaisrKSB7XG4gICAgICBpZiAob2JqZWN0aXZlLm51bWJlcnNbaV1bal0gIT0gbm9kZS5zdGF0ZS5udW1iZXJzW2ldW2pdKSB7XG4gICAgICAgIGRpZmZlcmVudENvdW50Kys7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBkaWZmZXJlbnRDb3VudDtcbn1cblxuZnVuY3Rpb24gZihub2RlOiBOb2RlLCBvYmplY3RpdmU6IFB1enpsZSkge1xuICByZXR1cm4gZyhub2RlLCBvYmplY3RpdmUpICsgaChub2RlLCBvYmplY3RpdmUpO1xufVxuXG5mdW5jdGlvbiBEaWpzdHJhKGluaXRpYWw6IFB1enpsZSwgb2JqZWN0aXZlOiBQdXp6bGUpIHtcbiAgbGV0IHNlZW4gPSB7fTtcbiAgbGV0IGN1cnJlbnRQcmlvcml0eSA9IHt9O1xuICBjb25zdCBxdWV1ZSA9IG5ldyBQcmlvcml0eVF1ZXVlSnMoKGE6IE5vZGUsIGI6IE5vZGUpID0+IHtcbiAgICByZXR1cm4gKFxuICAgICAgYi5kZWVwdGggLSBhLmRlZXB0aFxuICAgICk7XG4gIH0pO1xuICBsZXQgcXVldWVTaXplID0gMTtcbiAgZW5xKFxuICAgIHF1ZXVlLFxuICAgIGN1cnJlbnRQcmlvcml0eSxcbiAgICBjcmVhdGVOb2RlKGluaXRpYWwsIG51bGwsIG51bGwsIDApLFxuICApO1xuICB3aGlsZSAocXVldWVTaXplKSB7XG4gICAgbGV0IHUgPSBkZXEocXVldWUsIGN1cnJlbnRQcmlvcml0eSk7XG4gICAgcXVldWVTaXplLS07XG4gICAgaWYgKHUuc3RhdGUuZ2V0U2VyaWFsKCkgPT0gb2JqZWN0aXZlLmdldFNlcmlhbCgpKSB7XG4gICAgICByZXR1cm4gc29sdXRpb24odSk7XG4gICAgfVxuICAgIGxldCBzdWNjZXNzb3JzID0gZXhwYW5kKHUpO1xuICAgIHN1Y2Nlc3NvcnMgPSBzdWNjZXNzb3JzLmZpbHRlcigoZSkgPT4gIShlLnN0YXRlLmdldFNlcmlhbCgpIGluIHNlZW4pKTtcbiAgICBxdWV1ZVNpemUgKz0gc3VjY2Vzc29ycy5sZW5ndGg7XG4gICAgc3VjY2Vzc29ycy5mb3JFYWNoKChlbGVtZW50KSA9PiB7XG4gICAgICBlbnEoXG4gICAgICAgIHF1ZXVlLFxuICAgICAgICBjdXJyZW50UHJpb3JpdHksXG4gICAgICAgIGVsZW1lbnQsXG4gICAgICApO1xuICAgIH0pO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdWNjZXNzb3JzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBsZXQgc3VjY2Vzc29yID0gc3VjY2Vzc29yc1tpXTtcbiAgICAgIHNlZW5bc3VjY2Vzc29yLnN0YXRlLmdldFNlcmlhbCgpXSA9IHRydWU7XG4gICAgICBsZXQgYWx0ID0gdS5kZWVwdGggKyAxO1xuICAgICAgaWYgKGFsdCA8IHN1Y2Nlc3Nvci5kZWVwdGgpIHtcbiAgICAgICAgZW5xKHF1ZXVlLCBjdXJyZW50UHJpb3JpdHksIHsuLi5zdWNjZXNzb3IsIGRlZXB0aDogYWx0fSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHRocm93IG5ldyBFcnJvcihcIkZhaWxcIik7XG59XG5cbmZ1bmN0aW9uIGRlcShxdWV1ZTogUHJpb3JpdHlRdWV1ZUpzPE5vZGU+LCB0cmFja2VyOiBhbnkpIHtcbiAgd2hpbGUgKHRydWUpIHtcbiAgICBsZXQgcmVzdWx0ID0gcXVldWUuZGVxKCk7XG4gICAgaWYgKFxuICAgICAgcmVzdWx0LmRlZXB0aCA9PSB0cmFja2VyW3Jlc3VsdC5zdGF0ZS5nZXRTZXJpYWwoKV1cbiAgICApIHtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGVucShcbiAgcXVldWU6IFByaW9yaXR5UXVldWVKczxOb2RlPixcbiAgdHJhY2tlcjogYW55LFxuICBlbGVtZW50OiBOb2RlLFxuKSB7XG4gIHF1ZXVlLmVucShlbGVtZW50KTtcbiAgdHJhY2tlcltlbGVtZW50LnN0YXRlLmdldFNlcmlhbCgpXSA9IGVsZW1lbnQuZGVlcHRoO1xufVxuXG5mdW5jdGlvbiBnZXRNaW5BbmRSZW1vdmVGb3VuZChsaXN0OiBOb2RlW10sIGRpc3RhbmNlczogYW55KSB7XG4gIGxldCBtaW5WYWx1ZSA9IE51bWJlci5NQVhfVkFMVUU7XG4gIGxldCBtaW5Ob2RlOiBOb2RlID0gbnVsbDtcbiAgbGV0IG1pbkluZGV4ID0gLTE7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgIGxldCBkaXN0YW5jZSA9IGRpc3RhbmNlc1tsaXN0W2ldLnN0YXRlLmdldFNlcmlhbCgpXTtcbiAgICBpZiAoZGlzdGFuY2UgPCBtaW5WYWx1ZSkge1xuICAgICAgbWluVmFsdWUgPSBkaXN0YW5jZTtcbiAgICAgIG1pbk5vZGUgPSBsaXN0W2ldO1xuICAgICAgbWluSW5kZXggPSBpO1xuICAgIH1cbiAgfVxuICBsaXN0LnNwbGljZShtaW5JbmRleCwgMSk7XG4gIHJldHVybiBtaW5Ob2RlO1xufVxuXG5mdW5jdGlvbiBpbnNlcnRTb3J0ZWQobGlzdDogbnVtYmVyW10sIHZhbHVlOiBudW1iZXIpIHtcbiAgbGV0IHN0YXJ0ID0gMDsgLy8gZmlyc3QgaW5kZXggaW4gYXJyYXlcbiAgbGV0IGVuZCA9IGxpc3QubGVuZ3RoIC0gMTsgLy8gdGhlIGxhc3QgaW5kZXggaW4gdGhlIGFycmF5XG4gIHdoaWxlIChzdGFydCA8PSBlbmQpIHtcbiAgICBsZXQgbWlkID0gTWF0aC5mbG9vcigoc3RhcnQgKyBlbmQpIC8gMik7IC8vY2FsY3VsYXRlIHRoZSBtaWRwb2ludFxuICAgIGlmICh2YWx1ZSA9PT0gbGlzdFttaWRdKSB7XG4gICAgfSBlbHNlIGlmICh2YWx1ZSA8IGxpc3RbbWlkXSkge1xuICAgICAgZW5kID0gbWlkIC0gMTsgLy9zZWFyY2ggb25seSBmaXJzdCBoYWxmIG9mIHRoZSBhcnJheVxuICAgIH0gZWxzZSBpZiAodmFsdWUgPiBsaXN0W21pZF0pIHtcbiAgICAgIHN0YXJ0ID0gbWlkICsgMTsgLy9zZWFyY2ggb25seSAybmQgaGFsZiBvZiB0aGUgYXJyYXlcbiAgICB9XG4gIH1cblxuICBsaXN0LnNwbGljZShzdGFydCwgMCwgdmFsdWUpO1xufVxuXG5mdW5jdGlvbiBkZWxldGVGcm9tTGlzdChsaXN0OiBudW1iZXJbXSwgdmFsdWU6IG51bWJlcikge1xuICBsZXQgc3RhcnQgPSAwOyAvLyBmaXJzdCBpbmRleCBpbiBhcnJheVxuICBsZXQgZW5kID0gbGlzdC5sZW5ndGggLSAxOyAvLyB0aGUgbGFzdCBpbmRleCBpbiB0aGUgYXJyYXlcbiAgd2hpbGUgKHN0YXJ0IDw9IGVuZCkge1xuICAgIGxldCBtaWQgPSBNYXRoLmZsb29yKChzdGFydCArIGVuZCkgLyAyKTsgLy9jYWxjdWxhdGUgdGhlIG1pZHBvaW50XG4gICAgaWYgKHZhbHVlID09PSBsaXN0W21pZF0pIHtcbiAgICAgIGxpc3Quc3BsaWNlKG1pZCwgMSk7XG4gICAgICByZXR1cm47XG4gICAgfSBlbHNlIGlmICh2YWx1ZSA8IGxpc3RbbWlkXSkge1xuICAgICAgZW5kID0gbWlkIC0gMTsgLy9zZWFyY2ggb25seSBmaXJzdCBoYWxmIG9mIHRoZSBhcnJheVxuICAgIH0gZWxzZSBpZiAodmFsdWUgPiBsaXN0W21pZF0pIHtcbiAgICAgIHN0YXJ0ID0gbWlkICsgMTsgLy9zZWFyY2ggb25seSAybmQgaGFsZiBvZiB0aGUgYXJyYXlcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0TWluaW11bihvYmplY3Q6IHsgW2tleTogc3RyaW5nXTogTm9kZSB9LCBrZXlzOiBzdHJpbmdbXSkge1xuICBsZXQgbWluID0gb2JqZWN0W2tleXNbMF1dO1xuICBmb3IgKGxldCBpID0gMTsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICBsZXQgZWxlbWVudCA9IG9iamVjdFtrZXlzW2ldXTtcbiAgICBpZiAoZWxlbWVudC5mIDwgbWluLmYpIHtcbiAgICAgIG1pbiA9IGVsZW1lbnQ7XG4gICAgfVxuICB9XG4gIHJldHVybiBtaW47XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzb2x2ZShwdXp6bGU6IFB1enpsZSwgb2JqZWN0aXZlOiBQdXp6bGUpIHtcbiAgbGV0IHJlc3VsdCA9IG51bGw7XG4gIHJlc3VsdCA9IERpanN0cmEocHV6emxlLCBvYmplY3RpdmUpO1xuICByZXR1cm4gcmVzdWx0O1xufVxuIiwiaW1wb3J0IHsgUG9pbnQgfSBmcm9tIFwiLi9wb2ludFwiO1xyXG5cclxuZXhwb3J0IGVudW0gRGlyZWN0aW9uIHtcclxuICBMZWZ0ID0gXCJMZWZ0XCIsXHJcbiAgUmlnaHQgPSBcIlJpZ3RoXCIsXHJcbiAgVXAgPSBcIlVwXCIsXHJcbiAgRG93biA9IFwiRG93blwiLFxyXG59XHJcblxyXG5cclxuXHJcbmNvbnN0IGFsbG93ZWRNb3Zlc0NvbHVtbk1hcDogeyBbaW5kZXg6IG51bWJlcl06IERpcmVjdGlvbltdIH0gPSB7XHJcbiAgMDogW0RpcmVjdGlvbi5SaWdodF0sXHJcbiAgMTogW0RpcmVjdGlvbi5MZWZ0LCBEaXJlY3Rpb24uUmlnaHRdLFxyXG4gIDI6IFtEaXJlY3Rpb24uTGVmdF0sXHJcbn07XHJcblxyXG5jb25zdCBhbGxvd2VkTW92ZXNSb3dNYXA6IHsgW2luZGV4OiBudW1iZXJdOiBEaXJlY3Rpb25bXSB9ID0ge1xyXG4gIDA6IFtEaXJlY3Rpb24uRG93bl0sXHJcbiAgMTogW0RpcmVjdGlvbi5VcCwgRGlyZWN0aW9uLkRvd25dLFxyXG4gIDI6IFtEaXJlY3Rpb24uVXBdLFxyXG59O1xyXG5cclxudHlwZSBEaXJlY3Rpb25NYXBUeXBlID0ge1t4OiBzdHJpbmddOiBudW1iZXJ9O1xyXG5cclxuY29uc3QgZGlyZWN0aW9uTWFwOiBEaXJlY3Rpb25NYXBUeXBlID0ge1xyXG4gIFtEaXJlY3Rpb24uVXBdOiAtMSxcclxuICBbRGlyZWN0aW9uLkRvd25dOiAxLFxyXG4gIFtEaXJlY3Rpb24uTGVmdF06IC0xLFxyXG4gIFtEaXJlY3Rpb24uUmlnaHRdOiAxLFxyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IExFTkdUSCA9IDM7XHJcblxyXG5leHBvcnQgY2xhc3MgUHV6emxlIHtcclxuICBwcml2YXRlIF9hbGxvd2VkRGlyZWN0aW9uczogRGlyZWN0aW9uW107XHJcblxyXG4gIGdldCBhbGxvd2VkRGlyZWN0aW9ucygpOiBEaXJlY3Rpb25bXSB7XHJcbiAgICBpZiAoIXRoaXMuX2FsbG93ZWREaXJlY3Rpb25zKSB7XHJcbiAgICAgIHRoaXMuY2FsY3VsYXRlQWxsb3dlZERpcmVjdGlvbnMoKTtcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzLl9hbGxvd2VkRGlyZWN0aW9ucztcclxuICB9XHJcblxyXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX251bWJlcnM6IG51bWJlcltdW10pIHtcclxuICB9XHJcblxyXG4gIGdldCBudW1iZXJzICgpIHtcclxuICAgIHJldHVybiB0aGlzLl9udW1iZXJzO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSB2YWxpZGF0ZU51bWJlcnMoKSB7XHJcbiAgICBsZXQgZW1wdHlTcGFjZUZvdW5kID0gZmFsc2U7XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IExFTkdUSDsgaSsrKSB7XHJcbiAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgTEVOR1RIOyBqKyspIHtcclxuICAgICAgICBsZXQgY3VycmVudE51bWJlciA9IHRoaXMuX251bWJlcnNbaV1bal07XHJcbiAgICAgICAgaWYgKCFjdXJyZW50TnVtYmVyKSB7XHJcbiAgICAgICAgICBlbXB0eVNwYWNlRm91bmQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY3VycmVudE51bWJlciA8IDEgfHwgY3VycmVudE51bWJlciA+IDgpIHtcclxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBudW1iZXJzJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBtb3ZlRW1wdHkoZGlyZWN0aW9uOiBEaXJlY3Rpb24pOiBQdXp6bGUge1xyXG4gICAgaWYgKHRoaXMuYWxsb3dlZERpcmVjdGlvbnMuaW5jbHVkZXMoZGlyZWN0aW9uKSkge1xyXG4gICAgICBjb25zdCBjdXJyZW50RW1wdHlMb2NhdGlvbiA9IHRoaXMuZ2V0RW1wdHlTcGFjZUxvY2F0aW9uKCk7XHJcbiAgICAgIGNvbnN0IHRhcmdldExvY2F0aW9uOiBQb2ludCA9IHsuLi5jdXJyZW50RW1wdHlMb2NhdGlvbn07XHJcbiAgICAgIGxldCBwcm9wZXJ0eVRvTW9kaWZ5ID0gJ3gnO1xyXG4gICAgICBpZiAoW0RpcmVjdGlvbi5VcCwgRGlyZWN0aW9uLkRvd25dLmluY2x1ZGVzKGRpcmVjdGlvbikpIHtcclxuICAgICAgICBwcm9wZXJ0eVRvTW9kaWZ5ID0gJ3knO1xyXG4gICAgICB9XHJcbiAgICAgIHRhcmdldExvY2F0aW9uW3Byb3BlcnR5VG9Nb2RpZnldICs9IGRpcmVjdGlvbk1hcFtkaXJlY3Rpb25dO1xyXG4gICAgICBjb25zdCBuZXdOdW1iZXJzID0gdGhpcy5zd2FwKGN1cnJlbnRFbXB0eUxvY2F0aW9uLCB0YXJnZXRMb2NhdGlvbik7XHJcbiAgICAgIHJldHVybiBuZXcgUHV6emxlKG5ld051bWJlcnMpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwibW92ZW1lbnQgbm90IGFsbG93ZWRcIik7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHN3YXAoYTogUG9pbnQsIGI6IFBvaW50KSB7XHJcbiAgICBjb25zdCBuZXdOdW1iZXJzID0gdGhpcy5fbnVtYmVycy5tYXAocm93cyA9PiBbLi4ucm93c10pO1xyXG4gICAgbGV0IGF1eDogbnVtYmVyID0gbmV3TnVtYmVyc1tiLnldW2IueF07XHJcbiAgICBuZXdOdW1iZXJzW2IueV1bYi54XSA9IG5ld051bWJlcnNbYS55XVthLnhdO1xyXG4gICAgbmV3TnVtYmVyc1thLnldW2EueF0gPSBhdXg7XHJcbiAgICByZXR1cm4gbmV3TnVtYmVycztcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0RW1wdHlTcGFjZUxvY2F0aW9uKCk6IFBvaW50IHtcclxuICAgIGxldCBjb2w6IG51bWJlcjtcclxuICAgIGxldCByb3c6IG51bWJlcjtcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgTEVOR1RIOyBpKyspIHtcclxuICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBMRU5HVEg7IGorKykge1xyXG4gICAgICAgIGlmICghdGhpcy5fbnVtYmVyc1tpXVtqXSkge1xyXG4gICAgICAgICAgcm93ID0gaTtcclxuICAgICAgICAgIGNvbCA9IGo7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiA8UG9pbnQ+eyB4OiBjb2wsIHk6IHJvdyB9O1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBjYWxjdWxhdGVBbGxvd2VkRGlyZWN0aW9ucygpIHtcclxuICAgIGNvbnN0IGVtcHR5U3BhY2VMb2NhdGlvbiA9IHRoaXMuZ2V0RW1wdHlTcGFjZUxvY2F0aW9uKCk7XHJcbiAgICB0aGlzLl9hbGxvd2VkRGlyZWN0aW9ucyA9IGFsbG93ZWRNb3Zlc0NvbHVtbk1hcFtcclxuICAgICAgZW1wdHlTcGFjZUxvY2F0aW9uLnhcclxuICAgIF0uY29uY2F0KGFsbG93ZWRNb3Zlc1Jvd01hcFtlbXB0eVNwYWNlTG9jYXRpb24ueV0pO1xyXG4gIH1cclxuICBzZXJpYWw6IHN0cmluZztcclxuICBnZXRTZXJpYWwoKSB7XHJcbiAgICBpZiAoIXRoaXMuc2VyaWFsKSB7XHJcbiAgICAgIHRoaXMuc2VyaWFsID0gSlNPTi5zdHJpbmdpZnkodGhpcy5fbnVtYmVycyk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcy5zZXJpYWw7XHJcbiAgfVxyXG59XHJcbiIsIi8qKlxuICogRXhwb3NlIGBQcmlvcml0eVF1ZXVlYC5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBQcmlvcml0eVF1ZXVlO1xuXG4vKipcbiAqIEluaXRpYWxpemVzIGEgbmV3IGVtcHR5IGBQcmlvcml0eVF1ZXVlYCB3aXRoIHRoZSBnaXZlbiBgY29tcGFyYXRvcihhLCBiKWBcbiAqIGZ1bmN0aW9uLCB1c2VzIGAuREVGQVVMVF9DT01QQVJBVE9SKClgIHdoZW4gbm8gZnVuY3Rpb24gaXMgcHJvdmlkZWQuXG4gKlxuICogVGhlIGNvbXBhcmF0b3IgZnVuY3Rpb24gbXVzdCByZXR1cm4gYSBwb3NpdGl2ZSBudW1iZXIgd2hlbiBgYSA+IGJgLCAwIHdoZW5cbiAqIGBhID09IGJgIGFuZCBhIG5lZ2F0aXZlIG51bWJlciB3aGVuIGBhIDwgYmAuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn1cbiAqIEByZXR1cm4ge1ByaW9yaXR5UXVldWV9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5mdW5jdGlvbiBQcmlvcml0eVF1ZXVlKGNvbXBhcmF0b3IpIHtcbiAgdGhpcy5fY29tcGFyYXRvciA9IGNvbXBhcmF0b3IgfHwgUHJpb3JpdHlRdWV1ZS5ERUZBVUxUX0NPTVBBUkFUT1I7XG4gIHRoaXMuX2VsZW1lbnRzID0gW107XG59XG5cbi8qKlxuICogQ29tcGFyZXMgYGFgIGFuZCBgYmAsIHdoZW4gYGEgPiBiYCBpdCByZXR1cm5zIGEgcG9zaXRpdmUgbnVtYmVyLCB3aGVuXG4gKiBpdCByZXR1cm5zIDAgYW5kIHdoZW4gYGEgPCBiYCBpdCByZXR1cm5zIGEgbmVnYXRpdmUgbnVtYmVyLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfE51bWJlcn0gYVxuICogQHBhcmFtIHtTdHJpbmd8TnVtYmVyfSBiXG4gKiBAcmV0dXJuIHtOdW1iZXJ9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5Qcmlvcml0eVF1ZXVlLkRFRkFVTFRfQ09NUEFSQVRPUiA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgaWYgKHR5cGVvZiBhID09PSAnbnVtYmVyJyAmJiB0eXBlb2YgYiA9PT0gJ251bWJlcicpIHtcbiAgICByZXR1cm4gYSAtIGI7XG4gIH0gZWxzZSB7XG4gICAgYSA9IGEudG9TdHJpbmcoKTtcbiAgICBiID0gYi50b1N0cmluZygpO1xuXG4gICAgaWYgKGEgPT0gYikgcmV0dXJuIDA7XG5cbiAgICByZXR1cm4gKGEgPiBiKSA/IDEgOiAtMTtcbiAgfVxufTtcblxuLyoqXG4gKiBSZXR1cm5zIHdoZXRoZXIgdGhlIHByaW9yaXR5IHF1ZXVlIGlzIGVtcHR5IG9yIG5vdC5cbiAqXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuUHJpb3JpdHlRdWV1ZS5wcm90b3R5cGUuaXNFbXB0eSA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5zaXplKCkgPT09IDA7XG59O1xuXG4vKipcbiAqIFBlZWtzIGF0IHRoZSB0b3AgZWxlbWVudCBvZiB0aGUgcHJpb3JpdHkgcXVldWUuXG4gKlxuICogQHJldHVybiB7T2JqZWN0fVxuICogQHRocm93cyB7RXJyb3J9IHdoZW4gdGhlIHF1ZXVlIGlzIGVtcHR5LlxuICogQGFwaSBwdWJsaWNcbiAqL1xuUHJpb3JpdHlRdWV1ZS5wcm90b3R5cGUucGVlayA9IGZ1bmN0aW9uKCkge1xuICBpZiAodGhpcy5pc0VtcHR5KCkpIHRocm93IG5ldyBFcnJvcignUHJpb3JpdHlRdWV1ZSBpcyBlbXB0eScpO1xuXG4gIHJldHVybiB0aGlzLl9lbGVtZW50c1swXTtcbn07XG5cbi8qKlxuICogRGVxdWV1ZXMgdGhlIHRvcCBlbGVtZW50IG9mIHRoZSBwcmlvcml0eSBxdWV1ZS5cbiAqXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAdGhyb3dzIHtFcnJvcn0gd2hlbiB0aGUgcXVldWUgaXMgZW1wdHkuXG4gKiBAYXBpIHB1YmxpY1xuICovXG5Qcmlvcml0eVF1ZXVlLnByb3RvdHlwZS5kZXEgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGZpcnN0ID0gdGhpcy5wZWVrKCk7XG4gIHZhciBsYXN0ID0gdGhpcy5fZWxlbWVudHMucG9wKCk7XG4gIHZhciBzaXplID0gdGhpcy5zaXplKCk7XG5cbiAgaWYgKHNpemUgPT09IDApIHJldHVybiBmaXJzdDtcblxuICB0aGlzLl9lbGVtZW50c1swXSA9IGxhc3Q7XG4gIHZhciBjdXJyZW50ID0gMDtcblxuICB3aGlsZSAoY3VycmVudCA8IHNpemUpIHtcbiAgICB2YXIgbGFyZ2VzdCA9IGN1cnJlbnQ7XG4gICAgdmFyIGxlZnQgPSAoMiAqIGN1cnJlbnQpICsgMTtcbiAgICB2YXIgcmlnaHQgPSAoMiAqIGN1cnJlbnQpICsgMjtcblxuICAgIGlmIChsZWZ0IDwgc2l6ZSAmJiB0aGlzLl9jb21wYXJlKGxlZnQsIGxhcmdlc3QpID49IDApIHtcbiAgICAgIGxhcmdlc3QgPSBsZWZ0O1xuICAgIH1cblxuICAgIGlmIChyaWdodCA8IHNpemUgJiYgdGhpcy5fY29tcGFyZShyaWdodCwgbGFyZ2VzdCkgPj0gMCkge1xuICAgICAgbGFyZ2VzdCA9IHJpZ2h0O1xuICAgIH1cblxuICAgIGlmIChsYXJnZXN0ID09PSBjdXJyZW50KSBicmVhaztcblxuICAgIHRoaXMuX3N3YXAobGFyZ2VzdCwgY3VycmVudCk7XG4gICAgY3VycmVudCA9IGxhcmdlc3Q7XG4gIH1cblxuICByZXR1cm4gZmlyc3Q7XG59O1xuXG4vKipcbiAqIEVucXVldWVzIHRoZSBgZWxlbWVudGAgYXQgdGhlIHByaW9yaXR5IHF1ZXVlIGFuZCByZXR1cm5zIGl0cyBuZXcgc2l6ZS5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudFxuICogQHJldHVybiB7TnVtYmVyfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuUHJpb3JpdHlRdWV1ZS5wcm90b3R5cGUuZW5xID0gZnVuY3Rpb24oZWxlbWVudCkge1xuICB2YXIgc2l6ZSA9IHRoaXMuX2VsZW1lbnRzLnB1c2goZWxlbWVudCk7XG4gIHZhciBjdXJyZW50ID0gc2l6ZSAtIDE7XG5cbiAgd2hpbGUgKGN1cnJlbnQgPiAwKSB7XG4gICAgdmFyIHBhcmVudCA9IE1hdGguZmxvb3IoKGN1cnJlbnQgLSAxKSAvIDIpO1xuXG4gICAgaWYgKHRoaXMuX2NvbXBhcmUoY3VycmVudCwgcGFyZW50KSA8PSAwKSBicmVhaztcblxuICAgIHRoaXMuX3N3YXAocGFyZW50LCBjdXJyZW50KTtcbiAgICBjdXJyZW50ID0gcGFyZW50O1xuICB9XG5cbiAgcmV0dXJuIHNpemU7XG59O1xuXG4vKipcbiAqIFJldHVybnMgdGhlIHNpemUgb2YgdGhlIHByaW9yaXR5IHF1ZXVlLlxuICpcbiAqIEByZXR1cm4ge051bWJlcn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblByaW9yaXR5UXVldWUucHJvdG90eXBlLnNpemUgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuX2VsZW1lbnRzLmxlbmd0aDtcbn07XG5cbi8qKlxuICogIEl0ZXJhdGVzIG92ZXIgcXVldWUgZWxlbWVudHNcbiAqXG4gKiAgQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqL1xuUHJpb3JpdHlRdWV1ZS5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uKGZuKSB7XG4gIHJldHVybiB0aGlzLl9lbGVtZW50cy5mb3JFYWNoKGZuKTtcbn07XG5cbi8qKlxuICogQ29tcGFyZXMgdGhlIHZhbHVlcyBhdCBwb3NpdGlvbiBgYWAgYW5kIGBiYCBpbiB0aGUgcHJpb3JpdHkgcXVldWUgdXNpbmcgaXRzXG4gKiBjb21wYXJhdG9yIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBhXG4gKiBAcGFyYW0ge051bWJlcn0gYlxuICogQHJldHVybiB7TnVtYmVyfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblByaW9yaXR5UXVldWUucHJvdG90eXBlLl9jb21wYXJlID0gZnVuY3Rpb24oYSwgYikge1xuICByZXR1cm4gdGhpcy5fY29tcGFyYXRvcih0aGlzLl9lbGVtZW50c1thXSwgdGhpcy5fZWxlbWVudHNbYl0pO1xufTtcblxuLyoqXG4gKiBTd2FwcyB0aGUgdmFsdWVzIGF0IHBvc2l0aW9uIGBhYCBhbmQgYGJgIGluIHRoZSBwcmlvcml0eSBxdWV1ZS5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gYVxuICogQHBhcmFtIHtOdW1iZXJ9IGJcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5Qcmlvcml0eVF1ZXVlLnByb3RvdHlwZS5fc3dhcCA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgdmFyIGF1eCA9IHRoaXMuX2VsZW1lbnRzW2FdO1xuICB0aGlzLl9lbGVtZW50c1thXSA9IHRoaXMuX2VsZW1lbnRzW2JdO1xuICB0aGlzLl9lbGVtZW50c1tiXSA9IGF1eDtcbn07XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiaW1wb3J0IHsgUHV6emxlIH0gZnJvbSBcIi4vcHV6emxlXCI7XG5pbXBvcnQgeyBQdXp6bGVDb25zdHJ1Y3RvciB9IGZyb20gXCIuL3B1enpsZS1jb25zdHJ1Y3RvclwiO1xuaW1wb3J0IHsgUHV6emxlUGFpbnRlciB9IGZyb20gXCIuL3B1enpsZS1wYWludGVyXCI7XG5pbXBvcnQgeyBzb2x2ZSwgU3RyYXRlZ3kgfSBmcm9tIFwiLi9wdXp6bGUtc29sdmVyXCI7XG5jb25zdCBuZXdTdGF0ZUJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibmV3U3RhdGVCdG5cIik7XG5jb25zdCBmaW5kU29sdXRpb25CdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImZpbmRTb2x1dGlvblwiKTtcbmNvbnN0IGluaXRpYWxDb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImluaXRpYWxTdGF0ZUNvbnRhaW5lclwiKTtcbmNvbnN0IG9iamVjdGl2ZUNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwib2JqZWN0aXZlQ29udGFpbmVyXCIpO1xuY29uc3Qgc29sdXRpb25Db250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNvbHV0aW9uQ29udGFpbmVyXCIpO1xuY29uc3QgZGlzY2xhaW1lckNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZGlzY2xhaW1lclwiKTtcbmNvbnN0IGNvc3RvQ29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb3N0b0NvbnRhaW5lclwiKTtcbmNsYXNzIE1haW4ge1xuICBpbml0aWFsU3RhdGU6IFB1enpsZTtcbiAgb2JqZXRpdmU6IFB1enpsZTtcbiAgY29uc3RydWN0b3IoXG4gICAgcHV6emxlQ29uc3RydWN0b3I6IFB1enpsZUNvbnN0cnVjdG9yLFxuICAgIHByaXZhdGUgcHV6emxlUGFpbnRlcjogUHV6emxlUGFpbnRlclxuICApIHtcbiAgICB0aGlzLm9iamV0aXZlID0gcHV6emxlQ29uc3RydWN0b3IuY29uc3RydWN0UHV6emxlKFtcbiAgICAgIDEsXG4gICAgICAyLFxuICAgICAgMyxcbiAgICAgIDQsXG4gICAgICB1bmRlZmluZWQsXG4gICAgICA1LFxuICAgICAgNixcbiAgICAgIDcsXG4gICAgICA4LFxuICAgIF0pO1xuICAgIG9iamVjdGl2ZUNvbnRhaW5lci5hcHBlbmRDaGlsZChcbiAgICAgIHB1enpsZVBhaW50ZXIuZ2V0UHV6emxlUmVwcmVzZW50YXRpb24odGhpcy5vYmpldGl2ZSlcbiAgICApO1xuICB9XG5cbiAgc2V0SW5pdGlhbFN0YXRlKGluaXRpYWxTdGF0ZTogUHV6emxlKSB7XG4gICAgbGV0IGluaXRpYWwgPSBpbml0aWFsU3RhdGU7XG4gICAgLy8gaW5pdGlhbCA9IG5ldyBQdXp6bGUoW1xuICAgIC8vICAgWzYgLDcsIDNdLFxuICAgIC8vICAgWzEsIDQsIDJdLFxuICAgIC8vICAgWzgsIG51bGwsIDUgXVxuICAgIC8vIF0pO1xuICAgIHNvbHV0aW9uQ29udGFpbmVyLmlubmVySFRNTCA9IFwiXCI7XG4gICAgaW5pdGlhbENvbnRhaW5lci5pbm5lckhUTUwgPSBcIlwiO1xuICAgIHRoaXMuaW5pdGlhbFN0YXRlID0gaW5pdGlhbDtcbiAgICBpbml0aWFsQ29udGFpbmVyLmFwcGVuZENoaWxkKFxuICAgICAgdGhpcy5wdXp6bGVQYWludGVyLmdldFB1enpsZVJlcHJlc2VudGF0aW9uKHRoaXMuaW5pdGlhbFN0YXRlKVxuICAgICk7XG4gIH1cblxuICBzb2x2ZSgpIHtcbiAgICBpZiAoIXRoaXMuaW5pdGlhbFN0YXRlKSB7XG4gICAgICBhbGVydChcIkRhIGNsaWMgYWwgYm90w7NuICdHZW5lcmFyIGVzdGFkbyBpbmljaWFsJ1wiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgc29sdXRpb25Db250YWluZXIuaW5uZXJIVE1MID0gJydcblxuICAgIGRpc2NsYWltZXJDb250YWluZXIuaW5uZXJIVE1MID1cbiAgICAgIFwiPHA+U09MVUNJT05BTkRPLi4uPC9wPjxwPk5PVEEhIFB1ZWRlIHNlciBxdWUgZWwgYWxnb3JpdG1vIHRhcmRlIGJhc3RhbnRlIHkgcXVlIGVsIG5hdmVnYWRvciBubyBzZWEgcmVzcG9uc2l2byBtaWVudHJhcyBlc3RlIHNlIGVqZWN1dGEgeSBxdWUgc2UgbXVlc3RyZSB1biBtZW5zYWplIGRlIHF1ZSBsYSBww6FnaW5hIGhhIHNpZG8gYmxvcXVlZGEsIHBvciBmYXZvciBubyBjZXJyYXIgbGEgcMOhZ2luYSB5IGRhciBjbGljIGEgZXNwZXJhcjwvcD5cIjtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIGNvbnN0IHB1enpsZSA9IG5ldyBQdXp6bGUoW1sxLCAyLCAzXSxbNCwgdW5kZWZpbmVkLCA1XSxbNiwgNywgOF1dKVxuICAgICAgICBsZXQgc29sdXRpb24gPSBzb2x2ZSh0aGlzLmluaXRpYWxTdGF0ZSwgdGhpcy5vYmpldGl2ZSk7XG4gICAgICAgIHNvbHV0aW9uXG4gICAgICAgICAgLm1hcCgocywgaSkgPT4ge1xuICAgICAgICAgICAgbGV0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgICAgICBkaXYuaW5uZXJIVE1MID0gYDxzdHJvbmc+UGFzbyAke2kgKyAxfTwvc3Ryb25nPmA7XG4gICAgICAgICAgICBsZXQgcHV6emxlID0gdGhpcy5wdXp6bGVQYWludGVyLmdldFB1enpsZVJlcHJlc2VudGF0aW9uKHMuc3RhdGUpO1xuICAgICAgICAgICAgZGl2LmFwcGVuZENoaWxkKHB1enpsZSk7XG4gICAgICAgICAgICByZXR1cm4gZGl2O1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmZvckVhY2goKGQpID0+IHtcbiAgICAgICAgICAgIHNvbHV0aW9uQ29udGFpbmVyLmFwcGVuZENoaWxkKGQpO1xuICAgICAgICAgIH0pO1xuICAgICAgICBkaXNjbGFpbWVyQ29udGFpbmVyLmlubmVySFRNTCA9IFwiXCI7XG4gICAgICAgIGNvc3RvQ29udGFpbmVyLmlubmVyVGV4dCA9IHNvbHV0aW9uW3NvbHV0aW9uLmxlbmd0aCAtIDFdLm5vZGUuZGVlcHRoLnRvU3RyaW5nKCk7XG4gICAgICB9IGNhdGNoIChleGNlcHRpb24pIHtcbiAgICAgICAgYWxlcnQoXCJFbCBwdXp6bGUgbm8gcHVkbyBzZXIgcmVzdWVsdG9cIik7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn1cblxuY29uc3QgcHV6emxlQ29uc3RydWN0b3IgPSBuZXcgUHV6emxlQ29uc3RydWN0b3IoKTtcbmNvbnN0IG1haW4gPSBuZXcgTWFpbihwdXp6bGVDb25zdHJ1Y3RvciwgbmV3IFB1enpsZVBhaW50ZXIoKSk7XG5uZXdTdGF0ZUJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZ2VuZXJhdGVOZXdJbml0aWFsU3RhdGUpO1xuZmluZFNvbHV0aW9uQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gIG1haW4uc29sdmUoKTtcbn0pO1xuXG5mdW5jdGlvbiBnZW5lcmF0ZU5ld0luaXRpYWxTdGF0ZSgpIHtcbiAgbWFpbi5zZXRJbml0aWFsU3RhdGUocHV6emxlQ29uc3RydWN0b3IuY29uc3RydWN0UmFuZG9tUHV6emxlKCkpO1xufVxuXG5nZW5lcmF0ZU5ld0luaXRpYWxTdGF0ZSgpO1xuXG4iXSwic291cmNlUm9vdCI6IiJ9