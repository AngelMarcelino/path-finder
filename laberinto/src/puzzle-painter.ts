import { Direction, LENGTH, Maze } from "./maze";
import { getSerial, Point } from "./point";
import { SolutionElement } from "./puzzle-solver";

export class PuzzlePainter {
  getMazeRepresentation(maze: Maze, initial: Point, objetive: Point, solution: {[pointSerial: string]: Direction} = {}) {
    const table = document.createElement('table');
    table.className = 'puzzle';
    for (let i = 0; i < LENGTH; i++) {
      let tr = document.createElement('tr');
      for (let j = 0; j < LENGTH; j++) {
        let td = document.createElement('td');
        let innerText = maze.numbers[i][j] == 0 ? '0' : '';
        if (i == initial.y && j == initial.x) {
          innerText = '1';
        }
        
        const serial = getSerial({
          x: j,
          y: i
        });
        if(serial in solution) {
          let s = solution[serial];
          innerText = '1';
          if (s == Direction.Down || s == Direction.Up) {
            innerText = '|';
          }
          if (s == Direction.Left || s == Direction.Right) {
            innerText = '-';
          }
        }
        if (i == objetive.y && j == objetive.x) {
          innerText = 'x';
        }
        td.innerText = innerText;
        tr.appendChild(td);
      }
      table.appendChild(tr);
    }
    return table;
  }
  
}