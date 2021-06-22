import { Puzzle } from "./puzzle";
import { PuzzleConstructor } from "./puzzle-constructor";
import { PuzzlePainter } from "./puzzle-painter";
import { solve, Strategy } from "./puzzle-solver";
const newStateBtn = document.getElementById("newStateBtn");
const findSolutionBtn = document.getElementById("findSolution");
const initialContainer = document.getElementById("initialStateContainer");
const objectiveContainer = document.getElementById("objectiveContainer");
const solutionContainer = document.getElementById("solutionContainer");
const disclaimerContainer = document.getElementById("disclaimer");
const costoContainer = document.getElementById("costoContainer");
class Main {
  initialState: Puzzle;
  objetive: Puzzle;
  constructor(
    puzzleConstructor: PuzzleConstructor,
    private puzzlePainter: PuzzlePainter
  ) {
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
    objectiveContainer.appendChild(
      puzzlePainter.getPuzzleRepresentation(this.objetive)
    );
  }

  setInitialState(initialState: Puzzle) {
    let initial = initialState;
    // initial = new Puzzle([
    //   [1 ,2, 5],
    //   [8, 6, 3],
    //   [4, null, 7 ]
    // ]);
    solutionContainer.innerHTML = "";
    initialContainer.innerHTML = "";
    this.initialState = initial;
    initialContainer.appendChild(
      this.puzzlePainter.getPuzzleRepresentation(this.initialState)
    );
  }

  solve() {
    if (!this.initialState) {
      alert("Da clic al botón 'Generar estado inicial'");
      return;
    }
    solutionContainer.innerHTML = ''

    disclaimerContainer.innerHTML =
      "<p>SOLUCIONANDO...</p><p>NOTA! Puede ser que el algoritmo tarde bastante y que el navegador no sea responsivo mientras este se ejecuta y que se muestre un mensaje de que la página ha sido bloqueda, por favor no cerrar la página y dar clic a esperar</p>";
    setTimeout(() => {
      try {
        // const puzzle = new Puzzle([[1, 2, 3],[4, undefined, 5],[6, 7, 8]])
        let solution = solve(this.initialState, this.objetive);
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
      } catch (exception) {
        alert("El puzzle no pudo ser resuelto");
      }
    });
  }
}

const puzzleConstructor = new PuzzleConstructor();
const main = new Main(puzzleConstructor, new PuzzlePainter());
newStateBtn.addEventListener("click", generateNewInitialState);
findSolutionBtn.addEventListener("click", () => {
  main.solve();
});

function generateNewInitialState() {
  main.setInitialState(puzzleConstructor.constructRandomPuzzle());
}

generateNewInitialState();

