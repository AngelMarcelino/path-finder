import { Maze, Direction, LENGTH } from "./maze";
import { Node } from "./node";
import { AbstractDS } from "./data-structures/abstract-ds";
import { Queue } from "./data-structures/queue";
import { Stack } from "./data-structures/stack";
import { getSerial, Point } from "./point";
import * as PriorityQueueJs from "priorityqueuejs";

export enum Strategy {
  BFS = "BFS",
  DFS = "DFS",
  IT = "IT",
}

export interface SolutionElement {
  action: Direction;
  state: Point;
  node: Node;
}
type Flags = { [key: string]: boolean };
function createNode(
  state: Point,
  action: Direction,
  parent: Node,
  deepth: number,
  f: number,
): Node {
  return {
    action: action,
    deepth: deepth,
    parent: parent,
    state: state,
    f: f
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

function successors(node: Node, maze: Maze) {
  const nextStates = maze
    .calculateAllowedDirections(node.state)
    .map((direction) => {
      return <[Direction, Point]>[direction, maze.move(direction, node.state)];
    });
  return nextStates;
}

function expand(node: Node, maze: Maze): Node[] {
  let nextStates = successors(node, maze);
  const result = nextStates.map(([action, p]) =>
    createNode(p, action, node, Number.MAX_VALUE, Number.MAX_VALUE)
  );
  return result;
}

function g(node: Node, objective: Point): number {
  return node.deepth;
}

function h(node: Node, objective: Point): number {
  let result =
    Math.abs(node.state.x - objective.x) + Math.abs(node.state.y - objective.y);
  return result;
}

function f(node: Node, objective: Point) {
  return g(node, objective) + h(node, objective);
}

function AStar(initial: Point, objective: Point, maze: Maze) {
  const visited = {};
  const unvisited: { [key: string]: Node } = {};
  const keys = [];
  unvisited[getSerial(initial)] = createNode(initial, null, null, 0, 0);
  unvisited[getSerial(initial)].f = f(unvisited[getSerial(initial)], objective);
  insertSorted(keys, getSerial(initial));
  while (keys.length !== 0) {
    let current_node = getMinimun(unvisited, keys);
    if (getSerial(current_node.state) == getSerial(objective)) {
      return solution(current_node);
    } else {
      let successors = expand(current_node, maze);
      successors.forEach((element) => {
        if (!unvisited[getSerial(element.state)]) {
          unvisited[getSerial(element.state)] = element;
          insertSorted(keys, getSerial(element.state));
        } 
      });
      for (let i = 0; i < successors.length; i++) {
        let successor = successors[i];
        if (!visited[getSerial(successor.state)]) {
          let new_g_score = current_node.deepth + 1;
          if (new_g_score < unvisited[getSerial(successor.state)].deepth) {
            unvisited[getSerial(successor.state)].deepth = new_g_score;
            unvisited[getSerial(successor.state)].f = f(successor, objective);
          }
        }
      }
      visited[getSerial(current_node.state)] = current_node;
      deleteFromList(keys, getSerial(current_node.state));
      delete unvisited[getSerial(current_node.state)];
    }
  }
  throw new Error("Fail");
}

function Dijstra(initial: Point, objective: Point, maze: Maze) {
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
    createNode(initial, null, null, 0, 0),
  );
  while (queueSize) {
    let u = deq(queue, currentPriority);
    queueSize--;
    if (getSerial(u.state) == getSerial(objective)) {
      return solution(u);
    }
    let successors = expand(u, maze);
    successors = successors.filter((e) => !(getSerial(e.state) in seen));
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
      seen[getSerial(successor.state)] = true;
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
      result.deepth == tracker[getSerial(result.state)]
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
  tracker[getSerial(element.state)] = element.deepth;
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

// function search(
//   initial: Point,
//   objective: Point,
//   borderHolder: AbstractDS<Node>,
//   limit: number = Number.MAX_VALUE,
//   maze: Maze
// ) {
//   const seenPuzzles = {};
//   let border = borderHolder;
//   border.insert(createNode(initial, null, null, 0));
//   while (true) {
//     if (border.length == 0) {
//       throw new Error("Fail");
//     }
//     let currentNode = border.remove();
//     if (getSerial(currentNode.state) === getSerial(objective)) {
//       return solution(currentNode);
//     }
//     if (
//       !seenPuzzles[getSerial(currentNode.state)] &&
//       currentNode.deepth < limit
//     ) {
//       seenPuzzles[getSerial(currentNode.state)] = true;
//       let successors = expand(currentNode, seenPuzzles, maze);
//       if (successors) {
//         successors.forEach((suc) => {
//           border.insert(suc);
//         });
//       }
//     }
//   }
// }

export function solve(
  origin: Point,
  objective: Point,
  maze: Maze
) {
  let result = Dijstra(origin, objective, maze);
  return result;
}
