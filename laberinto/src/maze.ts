import { Point } from "./point";

export enum Direction {
  Left = "Left",
  Right = "Rigth",
  Up = "Up",
  Down = "Down",
}
export const LENGTH = 50;
export class Maze {
  constructor(public numbers: number[][]) {}
  move(direction: Direction, point: Point): Point {
    let allowedDirections = this.calculateAllowedDirections(point);
    if (allowedDirections.includes(direction)) {
      let x = point.x;
      let y = point.y;
      if (direction == Direction.Down) {
        y++;
      }
      if (direction == Direction.Up) {
        y--;
      }
      if (direction == Direction.Left) {
        x--;
      }
      if (direction == Direction.Right) {
        x++;
      }
      return {
        x,
        y,
      };
    }
    return null;
  }
  calculateAllowedDirections(location: Point): Direction[] {
    const allowedDirections: Direction[] = [];
    if (this.numbers[location.y + 1] && this.numbers[location.y + 1][location.x]) {
      allowedDirections.push(Direction.Down);
    }
    if (this.numbers[location.y - 1] && this.numbers[location.y - 1][location.x]) {
      allowedDirections.push(Direction.Up);
    }
    if (this.numbers[location.y][location.x + 1]) {
      allowedDirections.push(Direction.Right);
    }
    if (this.numbers[location.y][location.x - 1]) {
      allowedDirections.push(Direction.Left);
    }
    return allowedDirections;
  }
}
