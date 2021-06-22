import { Direction, Puzzle } from "./puzzle";

export class Node {
  state: Puzzle;
  parent: Node;
  action: Direction;
  deepth: number;
  f: number;
  children?: Node[];
}
