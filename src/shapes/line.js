////////////////////////////////////////////////////////////////////////////////
// js-drawing2d
// Javascript canvas 2D drawing library. Supports both immediate-mode rendering
// and 2D scene rendering.
//
// MIT License (C) 2015-2020 Jingwood, unvell.com, all rights reserved.
////////////////////////////////////////////////////////////////////////////////

import { Object2D } from "../scene/object.js";
import { LineSegment } from "../types/line.js";

export class Line extends Object2D {
  constructor(start, end) {
    super();

    this.line = new LineSegment(start, end);
  }

  draw(g) {
    g.drawLine(this.line.start, this.line.end,
      this.style.strokeWidth, this.style.strokeColor);
  }

  updateBoundingBox() {
    this.bbox.updateFromTwoPoints(this.line.start, this.line.end);
  }
}
