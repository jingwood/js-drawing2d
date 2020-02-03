////////////////////////////////////////////////////////////////////////////////
// js-drawing2d
// Javascript canvas 2D drawing library. Supports both immediate-mode rendering
// and 2D scene rendering.
//
// MIT License (C) 2015-2020 Jingwood, unvell.com, all rights reserved.
////////////////////////////////////////////////////////////////////////////////

import { Rectangle } from "./rectangle.js";

export class Ellipse extends Rectangle {
  constructor(x, y, w, h) {
    super();
  }

  draw(g) {
    g.drawEllipse(this.rect);
    this.ondraw(g);
  }
}