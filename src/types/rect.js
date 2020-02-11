////////////////////////////////////////////////////////////////////////////////
// js-drawing2d
// Javascript canvas 2D drawing library. Supports both immediate-mode rendering
// and 2D scene rendering.
//
// MIT License (C) 2015-2020 Jingwood, unvell.com, all rights reserved.
////////////////////////////////////////////////////////////////////////////////

import { Vec2, BoundingBox2D as BBox2D, MathFunctions2 } from "@jingwood/graphics-math";
import { LineSegment } from "./line.js"
import { Size } from "./size.js";
import { Polygon } from "./polygon";

export class Rect {
	constructor() {
		this._size = new SizeProperty(this);
		this.set(...arguments);
	}

	set(x, y, width, height) {
		switch (arguments.length) {
			default:
				this.x = 0;
				this.y = 0;
				this.width = 0;
				this.height = 0;
				break;
			
			case 1:
				if (typeof arguments[0] === "object") {
					const { x, y, width, height } = arguments[0];
					this.set(x, y, width, height);
				}
				break;

			case 2:
				this.x = arguments[0].x;
				this.y = arguments[0].y;
				this.width = arguments[1].width;
				this.height = arguments[1].height;
				break;

			case 4:
				this.x = x;
				this.y = y;
				this.width = width;
				this.height = height;
				break;
		}
	}

	clone() {
		return new Rect(this.x, this.y, this.width, this.height);
	}

	moveTo(x, y) {
		this.x = x;
		this.y = y;
	}
	
	offset(value) {
		this.x += value.x;
		this.y += value.y;
	}

	get right() {
		return this.x + this.width;
	}
	
	set right(v) {
		this.width = this.x + v;
	}

	get bottom() {
		return this.y + this.height;
	}
	
	set bottom(v) {
		this.height = this.y + v;
	}

	get origin() {
		return new Vec2(
			this.x + this.width / 2,
			this.y + this.height / 2);
	}
	
	set origin(p) {
		this.x = p.x - this.width / 2;
		this.y = p.y - this.height / 2;
	}

	get size() {
		return this._size;
	}

	set size(v) {
		this._size.set(v.width, v.height);
	}

	get topLeft() {
		return new Vec2(this.x, this.y);
	}

	get topCenter() {
		return new Vec2(this.x + this.width * 0.5, this.y);
	}

	get topRight() {
		return new Vec2(this.right, this.y);
	}

	get bottomLeft() {
		return new Vec2(this.x, this.bottom);
	}

	get bottomCenter() {
		return new Vec2(this.x + this.width * 0.5, this.bottom);
	}

	get bottomRight() {
		return new Vec2(this.right, this.bottom);
	}

	get leftCenter() {
		return new Vec2(this.x, this.y + this.height * 0.5);
	}
	
	get rightCenter() {
		return new Vec2(this.right, this.y + this.height * 0.5);
	}

	get topEdge() {
		return new LineSegment(this.x, this.y, this.right, this.y);
	}
	
	get bottomEdge() {
		return new LineSegment(this.x, this.bottom, this.right, this.bottom);
	}

	get leftEdge() {
		return new LineSegment(this.x, this.y, this.x, this.bottom);
	}
	
	get rightEdge() {
		return new LineSegment(this.right, this.y, this.right, this.bottom);
	}
	
	strink(x, y) {
		this.x += x;
		this.width -= x;
		this.y += y;
		this.height -= y;
	}

	inflate(w, h) {
		const hw = w * 0.5, hh = h * 0.5;
		this.x -= hw; this.y -= hh;
		this.width += hw; this.height += hh;
	}

	contains(pos) {
		return this.x <= pos.x && this.y <= pos.y
			&& this.right >= pos.x && this.bottom >= pos.y;
	}
	
	intersectsRect(r2) {
		return MathFunctions2.rectIntersectsRect(this, r2);
	}

	bbox() {
		return new BBox2D(this.topLeft, this.bottomRight);
	}

	toString() {
		return `[${this.x}, ${this.y}], [${this.width}, ${this.height}]`;
	}

	static createFromPoints(p1, p2) {
		var minx = Math.min(p1.x, p2.x);
		var miny = Math.min(p1.y, p2.y);
		var maxx = Math.max(p1.x, p2.x);
		var maxy = Math.max(p1.y, p2.y);
	
		return new Rect(minx, miny, maxx - minx, maxy - miny);
	}

	toPolygon() {
		return Rect.toPolygon(this);
	}

	static toPolygon(rect) {
		return new Polygon([rect.topLeft, rect.topRight, rect.bottomRight, rect.bottomLeft]);
	}
}

class SizeProperty {
  constructor(rect) {
		if (!rect) throw Error("Must specify an instance of rect type");
	}
	
	set(width, height) {
		this.rect.width = width;
		this.rect.height = height;
	}

  get width() {
		return this.rect.width;
	}

	set width(v) {
		this.rect.width = v;
	}

  get height() {
    return this.rect.height;
  }

	set height(v) {
		this.rect.height = v;
	}
}