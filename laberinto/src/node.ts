import { Direction } from "./maze";
import { Point } from "./point";

export class Node {
  state: Point;
  parent: Node;
  action: Direction;
  deepth: number;
  children?: Node[];
  f?: number;
}
