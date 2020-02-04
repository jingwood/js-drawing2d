////////////////////////////////////////////////////////////////////////////////
// js-drawing2d
// Javascript canvas 2D drawing library. Supports both immediate-mode rendering
// and 2D scene rendering.
//
// MIT License (C) 2015-2020 Jingwood, unvell.com, all rights reserved.
////////////////////////////////////////////////////////////////////////////////

import { Vec2 } from "@jingwood/graphics-math";

export class Size {
  constructor() {
    this.set(...arguments);
  }

  set() {
    switch (arguments.length) {
      default:
      case 0:
        this.width = 0;
        this.height = 0;
        break;

      case 1:
        if (typeof arguments[0] === "object") {
          const { width, height } = arguments[0];
          this.width = width;
          this.height = height;
        }
        break;
		
      case 2:
        {
          const [width, height] = arguments;
          this.width = width;
          this.height = height;
        }
        break;
    }
  }
	
  clone() {
    return new Size(this.width, this.height);
  }

  mul(s) {
    return new Size(this.width * s, this.height * s);
  }

  mul(scalar) {
    return new Size(this.width * scalar, this.height * scalar);
  }

  get v() {
    return new Vec2(this.width, this.height);
  }

  toArray() {
    return [this.width, this.height];
  }
}