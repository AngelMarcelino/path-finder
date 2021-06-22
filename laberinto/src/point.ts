export interface Point {
  x: number;
  y: number;
}
export function getSerial(point: Point) {
  return point.x + '-' + point.y;
}
