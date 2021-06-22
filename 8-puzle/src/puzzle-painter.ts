import { LENGTH, Puzzle } from "./puzzle";

export class PuzzlePainter {
  getPuzzleRepresentation(puzzle: Puzzle) {
    const table = document.createElement('table');
    table.className = 'puzzle';
    for (let i = 0; i < LENGTH; i++) {
      let tr = document.createElement('tr');
      for (let j = 0; j < LENGTH; j++) {
        let td = document.createElement('td');
        td.innerText = (puzzle.numbers[i][j] || '').toString();
        tr.appendChild(td);
      }
      table.appendChild(tr);
    }
    return table;
  }
  
}