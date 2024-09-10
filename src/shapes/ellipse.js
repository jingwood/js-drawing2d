////////////////////////////////////////////////////////////////////////////////
// js-drawing2d
// Javascript canvas 2D drawing library. Supports both immediate-mode rendering
// and 2D scene rendering.
//
// MIT License (c) 2015-2024 Jingwood, UNVELL Inc., All rights reserved.
////////////////////////////////////////////////////////////////////////////////

import { Rectangle2D } from "./rectangle2d.js";

export class Ellipse2D extends Rectangle2D {
  constructor(x, y, w, h) {
    super();
  }

  drawSelf(g) {
    g.drawEllipse(this.rect, this.style.strokeWidth, this.style.strokeColor, this.style.fillColor);
    this.ondraw(g);
  }
}