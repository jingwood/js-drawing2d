////////////////////////////////////////////////////////////////////////////////
// js-drawing2d
// Javascript canvas 2D drawing library. Supports both immediate-mode rendering
// and 2D scene rendering.
//
// MIT License (C) 2015-2020 Jingwood, unvell.com, all rights reserved.
////////////////////////////////////////////////////////////////////////////////

import { BBox2D, MathFunctions } from "@jingwood/graphics-math";

export class Polygon {
	constructor(points) {
		this.bbox = new BBox2D();
		this.points = points;
	}

	set points(points) {
		this._points = points;
		this.updateBoundingBox();
	}

	get points() {
		return this._points;
	}

	get origin() {
		return this.bbox.origin;
	}

	updateBoundingBox() {
		if (!this._points || !Array.isArray(this._points) || this._points.length <= 0) {
			return;
		}

		const { min, max } = this.bbox;
		
		min.x = this._points[0].x;
		min.y = this._points[0].y;

		this._points.forEach(({ x, y }) => {
			if (min.x > x) min.x = x;
			if (min.y > y) min.y = y;
			if (max.x < x) max.x = x;
			if (max.y < y) max.y = y;
		});
	}

	eachEdge(iterator) {
		if (!this.points || this.points.length < 2) return;

		for (let i = 0; i < this.points.length - 1; i++) {
			const ret = iterator(this.points[i], this.points[i + 1]);
			if (ret) return;
		}

		const last1 = this.points[this.points.length - 1], last2 = this.points[0];
		iterator(last1, last2);
	}

	containsPoint(p) {
		if (!this._points) {
			return false;
		}
		
		if (!this.bbox.containsPoint(p)) {
			return false;
		}
		
		return MathFunctions.polygonContainsPoint(this._points, p);
	}

	containsRect(rect) {
		if (!this._points) return false;

		if (!this.bbox.containsRect(rect)) {
			return false;
		}

		return MathFunctions.polygonContainsRect(this._points, rect);
	}

	distanceToPoint(p) {
		if (!this._points)
			return Number.MAX_VALUE;
		else
			return MathFunctions.distancePointToPolygon(p, this._points);
	}
}