import { Puzzle, Direction, LENGTH } from "./puzzle";
import { Node } from "./node";
import { AbstractDS } from "./data-structures/abstract-ds";
import { Queue } from "./data-structures/queue";
import { Stack } from "./data-structures/stack";
import * as PriorityQueueJs from "priorityqueuejs";

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

function Dijstra(initial: Puzzle, objective: Puzzle) {
  let seen = {};
  let currentPriority = {};
  const queue = new PriorityQueueJs((a: Node, b: Node) => {
    return (
      b.deepth - a.deepth
    );
  });
  let queueSize = 1;
  enq(
    queue,
    currentPriority,
    createNode(initial, null, null, 0),
  );
  while (queueSize) {
    let u = deq(queue, currentPriority);
    queueSize--;
    if (u.state.getSerial() == objective.getSerial()) {
      return solution(u);
    }
    let successors = expand(u);
    successors = successors.filter((e) => !(e.state.getSerial() in seen));
    queueSize += successors.length;
    successors.forEach((element) => {
      enq(
        queue,
        currentPriority,
        element,
      );
    });

    for (let i = 0; i < successors.length; i++) {
      let successor = successors[i];
      seen[successor.state.getSerial()] = true;
      let alt = u.deepth + 1;
      if (alt < successor.deepth) {
        enq(queue, currentPriority, {...successor, deepth: alt});
      }
    }
  }
  throw new Error("Fail");
}

function deq(queue: PriorityQueueJs<Node>, tracker: any) {
  while (true) {
    let result = queue.deq();
    if (
      result.deepth == tracker[result.state.getSerial()]
    ) {
      return result;
    }
  }
}

function enq(
  queue: PriorityQueueJs<Node>,
  tracker: any,
  element: Node,
) {
  queue.enq(element);
  tracker[element.state.getSerial()] = element.deepth;
}

function getMinAndRemoveFound(list: Node[], distances: any) {
  let minValue = Number.MAX_VALUE;
  let minNode: Node = null;
  let minIndex = -1;
  for (let i = 0; i < list.length; i++) {
    let distance = distances[list[i].state.getSerial()];
    if (distance < minValue) {
      minValue = distance;
      minNode = list[i];
      minIndex = i;
    }
  }
  list.splice(minIndex, 1);
  return minNode;
}

function insertSorted(list: number[], value: number) {
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

function deleteFromList(list: number[], value: number) {
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
  result = Dijstra(puzzle, objective);
  return result;
}
