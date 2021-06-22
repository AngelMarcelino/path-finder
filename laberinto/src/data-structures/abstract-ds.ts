export interface AbstractDS<T> {
  insert: (element: T) => void;
  remove: () => T;
  length: number;
}




