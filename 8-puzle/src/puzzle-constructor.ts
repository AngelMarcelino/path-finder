import { Puzzle } from "./puzzle";
export class PuzzleConstructor {
  constructor() {}
  constructRandomPuzzle(): Puzzle {
    const puzzleNumbers = [...new Array(9)];
    const selected = [...new Array(10)];
    let setElements = 0;
    while (setElements < 8) {
      let currentNumber = this.getRandomInt(1, 8);
      let currentPosition = this.getRandomInt(0, 8);
      if (!selected[currentNumber]) {
        if (!puzzleNumbers[currentPosition]) {
          puzzleNumbers[currentPosition] = currentNumber;
          setElements ++;
          selected[currentNumber] = 1;
        }
      }
    }
    const matrix = this.constructSquareMatrixFromOneDimensionArray(puzzleNumbers, 3);
    return new Puzzle(matrix);
  }

  constructPuzzle(numbers: number[]) {
    const matrix = this.constructSquareMatrixFromOneDimensionArray(numbers, 3);
    return new Puzzle(matrix);
  }

  private constructSquareMatrixFromOneDimensionArray(array: number[], length: number) {
    const placeholder = [...new Array(length)].map(() => [...new Array(length)]);
    for (let i = 0; i < array.length; i++) {
      let row = Math.floor(i / length);
      let column = i%length;
      placeholder[row][column] = array[i];
    }
    return placeholder;
  }

  private getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
