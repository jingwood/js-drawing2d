////////////////////////////////////////////////////////////////////////////////
// js-drawing2d
// Javascript canvas 2D drawing library. Supports both immediate-mode rendering
// and 2D scene rendering.
//
// MIT License (C) 2015-2020 Jingwood, unvell.com, all rights reserved.
////////////////////////////////////////////////////////////////////////////////

import { Object2D } from "../scene/object.js";
import { Rect } from "../types/rect.js";

export class Rectangle extends Object2D {
  constructor() {
    super();
    this.rect = new Rect();
  }

  update() {
    super.update();

    const { width, height } = this.size.mul(0.5);
    this.rect.set(-width, -height, this.size.width, this.size.height);
  }

  drawSelf(g) {
    g.drawRect(this.rect, this.style.strokeWidth, this.style.strokeColor, this.style.fillColor);
  }
};