////////////////////////////////////////////////////////////////////////////////
// js-drawing2d
// Javascript canvas 2D drawing library. Supports both immediate-mode rendering
// and 2D scene rendering.
//
// MIT License (C) 2015-2020 Jingwood, unvell.com, all rights reserved.
////////////////////////////////////////////////////////////////////////////////

import { Rectangle } from "./rectangle.js";
import { Rect } from "../types/rect.js";

export class ActivePoint extends Rectangle {
  constructor(x, y) {
    super(new Rect(x - 6, y - 6, 12, 12));

    this.style.strokeWidth = 2;
    this.style.strokeColor = "#385377";
    this.style.fillColor = "rgba(150,150,255,0.3)";
  }

  drawSelf(g) {
    g.drawEllipse(this.bbox, this.style.strokeWidth, this.style.strokeColor, this.style.fillColor);
  }

  drag(e) {
    this.bbox.x += e.movement.x;
    this.bbox.y += e.movement.y;

    this.update();
    this.ondrag(e);
  }
}
