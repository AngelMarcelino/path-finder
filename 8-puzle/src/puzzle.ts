import { Point } from "./point";

export enum Direction {
  Left = "Left",
  Right = "Rigth",
  Up = "Up",
  Down = "Down",
}



const allowedMovesColumnMap: { [index: number]: Direction[] } = {
  0: [Direction.Right],
  1: [Direction.Left, Direction.Right],
  2: [Direction.Left],
};

const allowedMovesRowMap: { [index: number]: Direction[] } = {
  0: [Direction.Down],
  1: [Direction.Up, Direction.Down],
  2: [Direction.Up],
};

type DirectionMapType = {[x: string]: number};

const directionMap: DirectionMapType = {
  [Direction.Up]: -1,
  [Direction.Down]: 1,
  [Direction.Left]: -1,
  [Direction.Right]: 1,
};

export const LENGTH = 3;

export class Puzzle {
  private _allowedDirections: Direction[];

  get allowedDirections(): Direction[] {
    if (!this._allowedDirections) {
      this.calculateAllowedDirections();
    }
    return this._allowedDirections;
  }

  constructor(private _numbers: number[][]) {
  }

  get numbers () {
    return this._numbers;
  }

  private validateNumbers() {
    let emptySpaceFound = false;
    for (let i = 0; i < LENGTH; i++) {
      for (let j = 0; j < LENGTH; j++) {
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

  moveEmpty(direction: Direction): Puzzle {
    if (this.allowedDirections.includes(direction)) {
      const currentEmptyLocation = this.getEmptySpaceLocation();
      const targetLocation: Point = {...currentEmptyLocation};
      let propertyToModify = 'x';
      if ([Direction.Up, Direction.Down].includes(direction)) {
        propertyToModify = 'y';
      }
      targetLocation[propertyToModify] += directionMap[direction];
      const newNumbers = this.swap(currentEmptyLocation, targetLocation);
      return new Puzzle(newNumbers);
    } else {
      throw new Error("movement not allowed");
    }
  }

  private swap(a: Point, b: Point) {
    const newNumbers = this._numbers.map(rows => [...rows]);
    let aux: number = newNumbers[b.y][b.x];
    newNumbers[b.y][b.x] = newNumbers[a.y][a.x];
    newNumbers[a.y][a.x] = aux;
    return newNumbers;
  }

  private getEmptySpaceLocation(): Point {
    let col: number;
    let row: number;
    for (let i = 0; i < LENGTH; i++) {
      for (let j = 0; j < LENGTH; j++) {
        if (!this._numbers[i][j]) {
          row = i;
          col = j;
          break;
        }
      }
    }
    return <Point>{ x: col, y: row };
  }

  private calculateAllowedDirections() {
    const emptySpaceLocation = this.getEmptySpaceLocation();
    this._allowedDirections = allowedMovesColumnMap[
      emptySpaceLocation.x
    ].concat(allowedMovesRowMap[emptySpaceLocation.y]);
  }
  serial: string;
  getSerial() {
    if (!this.serial) {
      this.serial = JSON.stringify(this._numbers);
    }
    return this.serial;
  }
}
