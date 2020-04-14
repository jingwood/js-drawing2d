////////////////////////////////////////////////////////////////////////////////
// js-drawing2d
// Javascript canvas 2D drawing library. Supports both immediate-mode rendering
// and 2D scene rendering.
//
// MIT License (C) 2015-2020 Jingwood, unvell.com, all rights reserved.
////////////////////////////////////////////////////////////////////////////////

import { Vec2, BoundingBox2D } from "@jingwood/graphics-math";

export class LineSegment {
  constructor() {
    this._start = new Vec2();
    this._end = new Vec2();
		this.bbox = new BoundingBox2D();
    
    this.set(...arguments);
  }

  set() {
    switch (arguments.length) {
      case 2:
        this.start = arguments[0];
        this.end = arguments[1];
        this.updateBoundingBox();
        break;
      
      case 4:
        this._start.set(arguments[0], arguments[1]);
        this._end.start(arguments[2], arguments[3]);
        this.updateBoundingBox();
        break;
    }
  }

	get x1() {
		return this._start.x;
	}
	set x1(v) {
		this._start.x = v;
		this.updateBoundingBoxX();
	}
	
	get y1() {
		return this._start.y;
	}
	set y1(v) {
		this._start.y = v;
		this.updateBoundingBoxY();
  }

	get x2() {
		return this._end.x;
	}
	set x2(v) {
		this._end.x = v;
		this.updateBoundingBoxX();
	}
	
	get y2() {
		return this._end.y;
	}
	set y2(v) {
		this._end.y = v;
		this.updateBoundingBoxY();
  }

  get start() {
    return this._start;
  }

  set start(v) {
    this._start.set(v);
  }
  
  get end() {
    return this._end;
  }

  set end(v) {
    this._end.set(v);
  }

  get vector() {
    return Vec2.sub(this._end, this._start);
  }

  get length() {
    return this.vector.magnitude;
  }

  get angle() {
    return this.vector.angle;
  }
	
	updateBoundingBox() {
		this.updateBoundingBoxX();
		this.updateBoundingBoxY();
	}

	updateBoundingBoxX() {
		this.bbox.min.x = Math.min(this._start.x, this._end.x) - 1;
		this.bbox.max.x = Math.max(this._start.x, this._end.x) + 1;
	}

	updateBoundingBoxY() {
		this.bbox.min.y = Math.min(this._start.y, this._end.y) - 1;
		this.bbox.max.y = Math.max(this._start.y, this._end.y) + 1;
	}

	intersectsLineSegment(l2) {
    // todo
	}
}