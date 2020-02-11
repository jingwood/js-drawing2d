////////////////////////////////////////////////////////////////////////////////
// js-drawing2d
// Javascript canvas 2D drawing library. Supports both immediate-mode rendering
// and 2D scene rendering.
//
// MIT License (C) 2015-2020 Jingwood, unvell.com, all rights reserved.
////////////////////////////////////////////////////////////////////////////////

import { BoundingBox2D as BBox2D } from "@jingwood/graphics-math";

export class LineSegment {
	constructor(x1, y1, x2, y2) {
		this.start = { x: x1, y: y1 };
		this.end = { x: x2, y: y2 };

		this.bbox = new BBox2D();
		this.updateBoundingBox();
	}

	get x1() {
		return this.start.x;
	}
	set x1(v) {
		this.start.x = v;
		this.updateBoundingBoxX();
	}
	
	get y1() {
		return this.start.y;
	}
	set y1(v) {
		this.start.y = v;
		this.updateBoundingBoxY();
	}

	get x2() {
		return this.end.x;
	}
	set x2(v) {
		this.end.x = v;
		this.updateBoundingBoxX();
	}
	
	get y2() {
		return this.end.y;
	}
	set y2(v) {
		this.end.y = v;
		this.updateBoundingBoxY();
	}
	
	updateBoundingBox() {
		this.updateBoundingBoxX();
		this.updateBoundingBoxY();
	}

	updateBoundingBoxX() {
		this.bbox.min.x = Math.min(this.start.x, this.end.x) - 1;
		this.bbox.max.x = Math.max(this.start.x, this.end.x) + 1;
	}

	updateBoundingBoxY() {
		this.bbox.min.y = Math.min(this.start.y, this.end.y) - 1;
		this.bbox.max.y = Math.max(this.start.y, this.end.y) + 1;
	}

	intersectsLineSegment(l2) {
    // todo
	}
}