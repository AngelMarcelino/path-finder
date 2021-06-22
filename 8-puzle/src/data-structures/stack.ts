import { AbstractDS } from "./abstract-ds";

export class Stack<T> implements AbstractDS<T> {
  array: T[];
  constructor() {
    this.array = [];
  }
  insert(element: T) {
    this.array.push(element);
  }

  remove() {
    const shifted = this.array.pop();
    return shifted;
  }

  get length() {
    return this.array.length;
  }
}
