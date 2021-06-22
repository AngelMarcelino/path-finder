import { LENGTH, Maze } from "./maze";
import { Point } from "./point";
import { getRandomInt } from "./utils/random-int";
export class PuzzleConstructor {
  constructor() {}
  
  constructMaze(numbers: number[]) {
    const matrix = this.constructSquareMatrixFromOneDimensionArray(numbers, LENGTH);
    return new Maze(matrix);
  }

  private constructSquareMatrixFromOneDimensionArray(
    array: number[],
    length: number
  ) {
    const placeholder = [...new Array(length)].map(() => [
      ...new Array(length),
    ]);
    for (let i = 0; i < array.length; i++) {
      let row = Math.floor(i / length);
      let column = i % length;
      placeholder[row][column] = array[i];
    }
    return placeholder;
  }

  randomInitialState(limit: Point): Point {
    return {
      x: getRandomInt(0, limit.x),
      y: getRandomInt(0, limit.y),
    };
  }
}
