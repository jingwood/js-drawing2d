////////////////////////////////////////////////////////////////////////////////
// js-drawing2d
// Javascript canvas 2D drawing library. Supports both immediate-mode rendering
// and 2D scene rendering.
//
// MIT License (C) 2015-2020 Jingwood, unvell.com, all rights reserved.
////////////////////////////////////////////////////////////////////////////////

import { Object2D } from "../scene/object.js";
import { LineSegment } from "../types/line.js";
import { Vec2, MathFunctions2 } from "@jingwood/graphics-math";

export class Line2D extends Object2D {
  constructor(start, end) {
    super();

    this.line = new LineSegment(start, end);
    this.hitTestWidth = 5;
  }

  get start() {
    return this.line.start;
  }

  set start(v) {
    this.line.start = v;
  }

  get end() {
    return this.line.end;
  }

  set end(v) {
    this.line.end = v;
  }

  // get origin() {
  //   return Vec2.add(this.start, Vec2.mul(Vec2.sub(this.end, this.start), 0.5));
  // }

  // set origin(v) { 
  //   const offset = Vec2.sub(v, this.origin);
  //   this.start.offset(offset);
  //   this.end.offset(offset);
  // }

  hitTestPoint(p) {
    return MathFunctions2.distancePointToLineSegment(this.pointToLocal(p), this) <=
      Math.max(this.style.strokeWidth, this.hitTestWidth) * 0.5;
  }

  drawSelf(g) {
    g.drawLine(this.line.start, this.line.end,
      this.style.strokeWidth, this.style.strokeColor);
  }

  updateBoundingBox() {
    this.bbox.updateFromTwoPoints(this.line.start, this.line.end);
  }
}
