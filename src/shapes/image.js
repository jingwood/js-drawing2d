////////////////////////////////////////////////////////////////////////////////
// js-drawing2d
// Javascript canvas 2D drawing library. Supports both immediate-mode rendering
// and 2D scene rendering.
//
// MIT License (C) 2015-2020 Jingwood, unvell.com, all rights reserved.
////////////////////////////////////////////////////////////////////////////////

import { Rectangle2D } from "./rectangle2d.js";

export class Image2D extends Rectangle2D {
  constructor(img) {
    super();

    this._image = null;

    if (img) {
      this.image = img; 
    }
  }

  get image() {
    return this._image;
  }

  set image(img) {
    this._image = img;
    this.size.set(img.width, img.height);
  }

  drawSelf(g) {
    if (!this._image) {
      console.warn("try to render an image object which doesn't have an valid image");
    } else {
      g.drawImage(this._image, this.rect.x, this.rect.y, this.rect.width, this.rect.height);
    }
  }

  clone() {
    const newObj = super.clone();
    newObj._image = this._image;
    return newObj;
  }
}