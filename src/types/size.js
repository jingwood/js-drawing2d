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

  add(s2) {
    return Size.add(this, s2);
  }

  static add(s2) {
    return new Size(this.width + s2.width, this.height + s2.height);
  }

  sub(s2) {
    return Size.sub(this, s2);
  }

  static sub(s1, s2) {
    return new Size(s1.width - s2.width, s1.height - s2.height);
  }

  mul(scalar) {
    return Size.mul(this, scalar);
  }

  static mul(size, scalar) {
    if (typeof scalar === "object") {
      return new Size(size.width * scalar.width, size.height * scalar.height);
    } else if (!isNaN(scalar)) {
      return new Size(size.width * scalar, size.height * scalar);
    }
  }

  div(scalar) {
    return Size.div(this, scalar);
  }

  static div(size, scalar) {
    if (typeof scalar === "object") {
      return new Size(size.width / scalar.width, size.height / scalar.height);
    } else if (!isNaN(scalar)) {
      return new Size(size.width / scalar, size.height / scalar);
    }
  }

  get v() {
    return toVector(this);
  }

  static toVector(size) {
    return new Vec2(size.width, size.height);
  }

  toArray() {
    return [this.width, this.height];
  }
}