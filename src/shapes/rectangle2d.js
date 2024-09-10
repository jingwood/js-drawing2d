////////////////////////////////////////////////////////////////////////////////
// js-drawing2d
// Javascript canvas 2D drawing library. Supports both immediate-mode rendering
// and 2D scene rendering.
//
// MIT License (c) 2015-2024 Jingwood, UNVELL Inc., All rights reserved.
////////////////////////////////////////////////////////////////////////////////

import { Object2D } from "../scene/object.js";
import { Rect } from "../types/rect.js";

export class Rectangle2D extends Object2D {
  constructor(rect) {
    super();
    this.rect = new Rect();
    
    if (rect) {
      this.setFromRect(rect);
    }
  }

  setFromRect(rect) {
    this.origin.set(rect.origin);
    this.size.set(rect.size);
  }

  update() {
    super.update();

    const { width, height } = this.size.mul(0.5);
    this.rect.set(-width, -height, this.size.width, this.size.height);
  }

  drawSelf(g) {
    g.drawRect(this.rect, this.style.strokeWidth, this.style.strokeColor, this.style.fillColor, this.style.strokeStyle);
  }
};