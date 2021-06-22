export interface AbstractDS<T> {
  insert: (element: T) => void;
  remove: () => T;
  length: number;
}

export class Queue<T> implements AbstractDS<T> {
  array: T[];
  constructor() {
    this.array = [];
  }
  insert(element: T) {
    this.array.push(element);
  }

  remove() {
    const shifted = this.array.shift();
    return shifted;
  }

  get length() {
    return this.array.length;
  }
}

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


