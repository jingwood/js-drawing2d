////////////////////////////////////////////////////////////////////////////////
// js-drawing2d
// Javascript canvas 2D drawing library. Supports both immediate-mode rendering
// and 2D scene rendering.
//
// MIT License (C) 2015-2020 Jingwood, unvell.com, all rights reserved.
////////////////////////////////////////////////////////////////////////////////

import { Object2D } from "../scene/object.js";
import { Polygon } from "../types/polygon.js";

export class Polygon2D extends Object2D {
  constructor(points) {
    super();
    this.polygon = new Polygon(points);
  }

  hitTestPoint(p) {
    return this.polygon.containsPoint(this.pointToLocal(p));
  }

  draw(g) {
    g.drawPolygon(this.polygon.points, this.style.strokeWidth, this.style.strokeColor, this.style.fillColor);
    this.ondraw(g);
  }
};