import { LENGTH, Maze } from "./maze";
import { MazeSample1, MazeSample2 } from "./maze-sample";
import { getSerial, Point } from "./point";
import { PuzzleConstructor } from "./puzzle-constructor";
import { PuzzlePainter } from "./puzzle-painter";
import { solve, Strategy } from "./puzzle-solver";
const newStateBtn = document.getElementById("newStateBtn");
const findSolutionBtn = document.getElementById("findSolution");
const initialContainer = document.getElementById("initialStateContainer");
const disclaimerContainer = document.getElementById("disclaimer");
const costoContainer = document.getElementById("costoContainer");
function convertToMatrix(table: HTMLTableElement) {
  const tr = Array.from(table.children).map((e) =>
    Array.from(e.children).map((ne) => (ne.innerHTML === "" ? 1 : 0))
  );
  console.log(JSON.stringify(tr).replace(/\],/g, "],\n"));
}
class Main {
  initialState: Point;
  maze: Maze;
  constructor(private puzzlePainter: PuzzlePainter, private objetive: Point) {
    const numbers = [...new Array(LENGTH)].map((a) =>
      [...new Array(LENGTH)].map((na) => 1)
    );
    this.maze = new Maze(MazeSample2);
    // objectiveContainer.appendChild(
    //   puzzlePainter.getMazeRepresentation(this.maze, this.objetive)
    // );
  }

  setProblem(initialState: Point, objetiveState: Point) {
    initialContainer.innerHTML = "";
    this.initialState = initialState;
    this.objetive = objetiveState;
    const table = this.puzzlePainter.getMazeRepresentation(
      this.maze,
      this.initialState,
      this.objetive
    );
    table.addEventListener("click", (e: MouseEvent) => {
      let td = e.target as HTMLTableDataCellElement;
      if (td.nodeName.toLowerCase() == "td") {
        td.innerHTML = "0";
        console.dir(td);
      }
      convertToMatrix(table);
    });
    initialContainer.appendChild(table);
  }

  solve() {
    if (!this.initialState) {
      alert("Da clic al botón 'Generar estado inicial'");
      return;
    }


    disclaimerContainer.innerHTML =
      "<p>SOLUCIONANDO...</p><p>NOTA! Puede ser que el algoritmo tarde bastante y que el navegador no sea responsivo mientras este se ejecuta y que se muestre un mensaje de que la página ha sido bloqueda, por favor no cerrar la página y dar clic a esperar</p>";
    setTimeout(() => {
      try {
        // const puzzle = new Puzzle([[1, 2, 3],[4, undefined, 5],[6, 7, 8]])
        let solution = solve(
          this.initialState,
          this.objetive,
          this.maze
        );
        console.log(solution);
        initialContainer.innerHTML = "";
        initialContainer.appendChild(
          this.puzzlePainter.getMazeRepresentation(
            this.maze,
            this.initialState,
            this.objetive,
            solution.reduce(
              (accum, curr) => (
                (accum[getSerial(curr.state)] = curr.action), accum
              ),
              {}
            )
          )
        );
        disclaimerContainer.innerHTML = "";
        costoContainer.innerText = solution[
          solution.length - 1
        ].node.deepth.toString();
      } catch (exception) {
        alert("El puzzle no pudo ser resuelto");
      }
    });
  }
}
const puzzleConstructor = new PuzzleConstructor();
const main = new Main(
  new PuzzlePainter(),
  puzzleConstructor.randomInitialState({
    x: LENGTH,
    y: LENGTH,
  })
);
newStateBtn.addEventListener("click", generateNewInitialState);
findSolutionBtn.addEventListener("click", () => {
  main.solve();
});

function generateNewInitialState() {
  main.setProblem(
    {
      x: 0,
      y: LENGTH - 1,
    },
    {
      x: LENGTH - 1,
      y: 0,
    }
  );
}

generateNewInitialState();
