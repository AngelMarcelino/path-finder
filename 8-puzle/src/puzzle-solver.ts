
import { Puzzle, Direction, LENGTH } from "./puzzle";
import { Node } from "./node";
import { AbstractDS } from "./data-structures/abstract-ds";
import { Queue } from "./data-structures/queue";
import { Stack } from "./data-structures/stack";

export enum Strategy {
  BFS = "BFS",
  DFS = "DFS",
  IT = "IT",
}

export interface SolutionElement {
  action: Direction;
  state: Puzzle;
  node: Node;
}
type Flags = { [key: string]: boolean };
function createNode(
  state: Puzzle,
  action: Direction,
  parent: Node,
  deepth: number,
  f?: number
): Node {
  return {
    action: action,
    deepth: deepth,
    parent: parent,
    state: state,
    f: f,
  };
}

function solution(node: Node) {
  let actions: SolutionElement[] = [];
  let current = node;
  while (current) {
    actions.push({
      action: current.action,
      state: current.state,
      node: current,
    });
    current = current.parent;
  }
  actions.reverse();
  return actions;
}

function successors(node: Node) {
  let puzzle = node.state;
  const nextStates = puzzle.allowedDirections.map((direction) => {
    return <[Direction, Puzzle]>[direction, puzzle.moveEmpty(direction)];
  });
  return nextStates;
}

function expand(node: Node): Node[] {
  let nextStates = successors(node);
  const result = nextStates.map(([action, p]) => {
    let res = createNode(p, action, node, Number.MAX_VALUE);
    res.f = Number.MAX_VALUE;
    return res;
  });
  return result;
}

function g(node: Node, objective: Puzzle): number {
  return node.deepth;
}

function h(node: Node, objective: Puzzle): number {
  let differentCount = 0;
  for (let i = 0; i < LENGTH; i++) {
    for (let j = 0; j < LENGTH; j++) {
      if (objective.numbers[i][j] != node.state.numbers[i][j]) {
        differentCount++;
      }
    }
  }
  return differentCount;
}

function f(node: Node, objective: Puzzle) {
  return g(node, objective) + h(node, objective);
}

function AStar(initial: Puzzle, objective: Puzzle) {
  const visited = {};
  const unvisited: { [key: string]: Node } = {};
  const keys = [];
  unvisited[initial.getSerial()] = createNode(initial, null, null, 0);
  unvisited[initial.getSerial()].f = f(
    unvisited[initial.getSerial()],
    objective
  );
  insertSorted(keys, initial.getSerial());
  let minKey = initial.getSerial();
  while (keys.length !== 0) {
    let current_node = getMinimun(unvisited, keys);
    if (current_node.deepth > 25) {
      throw new Error("Fail");
    }
    if (current_node.state.getSerial() == objective.getSerial()) {
      return solution(current_node);
    } else {
      let successors = expand(current_node);
      successors.forEach((element) => {
        if (!unvisited[element.state.getSerial()]) {
          unvisited[element.state.getSerial()] = element;
          insertSorted(keys, element.state.getSerial());
        }
      });
      for (let i = 0; i < successors.length; i++) {
        let successor = successors[i];
        if (!visited[successor.state.getSerial()]) {
          let new_g_score = current_node.deepth + 1;
          if (new_g_score < unvisited[successor.state.getSerial()].deepth) {
            unvisited[successor.state.getSerial()].deepth = new_g_score;
            unvisited[successor.state.getSerial()].f = f(successor, objective);
          }
        }
      }
      visited[current_node.state.getSerial()] = current_node;
      deleteFromList(keys, current_node.state.getSerial());
      delete unvisited[current_node.state.getSerial()];
    }
  }
  throw new Error("Fail");
}

function insertSorted(list: string[], value: string) {
  let start = 0; // first index in array
  let end = list.length - 1; // the last index in the array
  while (start <= end) {
    let mid = Math.floor((start + end) / 2); //calculate the midpoint
    if (value === list[mid]) {
    } else if (value < list[mid]) {
      end = mid - 1; //search only first half of the array
    } else if (value > list[mid]) {
      start = mid + 1; //search only 2nd half of the array
    }
  }

  list.splice(start, 0, value);
}

function deleteFromList(list: string[], value: string) {
  let start = 0; // first index in array
  let end = list.length - 1; // the last index in the array
  while (start <= end) {
    let mid = Math.floor((start + end) / 2); //calculate the midpoint
    if (value === list[mid]) {
      list.splice(mid, 1);
      return;
    } else if (value < list[mid]) {
      end = mid - 1; //search only first half of the array
    } else if (value > list[mid]) {
      start = mid + 1; //search only 2nd half of the array
    }
  }
}

function getMinimun(object: { [key: string]: Node }, keys: string[]) {
  let min = object[keys[0]];
  for (let i = 1; i < keys.length; i++) {
    let element = object[keys[i]];
    if (element.f < min.f) {
      min = element;
    }
  }
  return min;
}

export function solve(puzzle: Puzzle, objective: Puzzle) {
  let result = null;
  result = AStar(puzzle, objective);
  return result;
}
