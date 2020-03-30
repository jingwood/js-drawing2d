////////////////////////////////////////////////////////////////////////////////
// js-drawing2d
// Javascript canvas 2D drawing library. Supports both immediate-mode rendering
// and 2D scene rendering.
//
// MIT License (C) 2015-2020 Jingwood, unvell.com, all rights reserved.
////////////////////////////////////////////////////////////////////////////////

import { Rectangle } from "./rectangle.js";

export class Image extends Rectangle {
  constructor(img, x, y, w, h) {
    super();

    this.img = img;
  }

  drawSelf(g) {
    g.drawImage(this.img, this.rect.x, this.rect.y, this.rect.width, this.rect.height);
  }
}