////////////////////////////////////////////////////////////////////////////////
// js-drawing2d
// Javascript canvas 2D drawing library. Supports both immediate-mode rendering
// and 2D scene rendering.
//
// MIT License (C) 2015-2020 Jingwood, unvell.com, all rights reserved.
////////////////////////////////////////////////////////////////////////////////

import { Matrix3 } from "@jingwood/graphics-math";
import { Rect } from "../types/rect.js";

const defaultOptions = {
};

export class Graphics2D {
	constructor(canvas, ctx, options) {
		this.canvas = canvas;
		this.ctx = ctx;
		this.options = { ...defaultOptions, ...options };

		this.resetDrawingStyle();

		this.currentTransform = new Matrix3().loadIdentity();
		this.transformStack = new Array();

		if (this.options.scale) {
			// this.pushScale(options.scale.x, options.scale.y);
		}
	}

	pushTransform(t) {
		this.transformStack.push(this.currentTransform);
		t = t.mul(this.currentTransform);
		this.ctx.setTransform(t.a1, t.b1, t.a2, t.b2, t.a3, t.b3);
	}

	popTransform() {
		this.currentTransform = this.transformStack.pop();
		var t = this.currentTransform;
		this.ctx.setTransform(t.a1, t.b1, t.a2, t.b2, t.a3, t.b3);
	}

	pushTranslation(x, y) {
		const m = Matrix3.makeTranslation(x, y);
		this.pushTransform(m);
		return m;
	}

	pushRotation(angle, x, y) {
		const m = Matrix3.makeRotation(angle, x, y);
		this.pushTransform(m);
		return m;
	}

	pushScale(x, y) {
		const m = Matrix3.makeScale(x, y);
		this.pushTransform(m);
		return m;
	}

	resetTransform() {
		this.currentTransform.loadIdentity();
		this.transformStack._t_clear();
	}

	setTransform(t) {
		this.ctx.setTransform(t.a1, t.b1, t.a2, t.b2, t.a3, t.b3);
	}

	resetDrawingStyle() {
		this.strokeWidth = 1;
		this.strokeColor = "black";
		this.fillColor = "white";
	}

	drawRect(rect, strokeWidth, strokeColor, fillColor) {
		var ctx = this.ctx;
	
		strokeWidth = strokeWidth || this.strokeWidth || 1;
		strokeColor = strokeColor || this.strokeColor || "black";
		// fillColor = fillColor || this.fillColor;

		// ctx.beginPath();

		if (fillColor) {
			ctx.fillStyle = fillColor;
			ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
		}
		
		if (typeof strokeWidth !== "undefined") {
			ctx.lineWidth = strokeWidth;
		} else {
			ctx.lineWidth = this.strokeWidth;
		}

		if (strokeColor != undefined) {

			if (typeof strokeColor !== "undefined") {
				ctx.strokeStyle = strokeColor;
			} else {
				ctx.strokeStyle = this.strokeColor;
			}

			if (ctx.lineWidth > 0) {
				ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
			}
		}
		// ctx.closePath();

	}

	drawRoundRect(rect, cornerSize, strokeWidth, strokeColor, fillColor) {
		const ctx = this.ctx;
		
		strokeWidth = strokeWidth || this.strokeWidth || 1;
		strokeColor = strokeColor || this.strokeColor || "black";
		fillColor = fillColor || this.fillColor || "white";

		const minEdge = Math.min(rect.width, rect.height);
		if (cornerSize > minEdge) cornerSize = minEdge;

		const
			w = rect.width, h = rect.height,
			x = rect.x, y = rect.y,
			hc = cornerSize / 2,
			xe = x + w, ye = y + h;
	
		ctx.beginPath();
		ctx.moveTo(x + hc, y);
		ctx.arc(xe - hc, y + hc, hc, Math.PI / 2 + Math.PI, 0);
		ctx.arc(xe - hc, ye - hc, hc, 0, Math.PI / 2);
		ctx.arc(x + hc, ye - hc, hc, Math.PI / 2, Math.PI);
		ctx.arc(x + hc, y + hc, hc, Math.PI, Math.PI / 2 + Math.PI);
		ctx.closePath();

		ctx.fillStyle = fillColor;
		if (fillColor) {
			ctx.fill();
		}

		if (strokeWidth > 0 && strokeColor) {
			ctx.lineWidth = strokeWidth;
			ctx.strokeStyle = strokeColor;
			ctx.stroke();
		}
	}

	drawPoint(p, size = 3, strikeColor = "transparent", fillColor = "black") {
		this.drawEllipse(new Rect(p.x - size / 2, p.y - size / 2, size, size), 0, strikeColor, fillColor);
	}

	// drawEllipse(p, size, strokeWidth, strokeColor, fillColor) {
	// 	var r = new Rect(p.x - size / 2, p.y - size / 2, size, size);
	// 	return this.drawEllipse(r, strokeWidth, strokeColor, fillColor);
	// };

	drawEllipse(rect, strokeWidth, strokeColor, fillColor) {
		var ctx = this.ctx;
		
		strokeWidth = strokeWidth || this.strokeWidth;
		strokeColor = strokeColor || this.strokeColor;
		fillColor = fillColor || this.fillColor;

		var w = rect.width;
		var h = rect.height;
		var hw = w / 2;
		var hh = h / 2;
		// var x = rect.x - hw;
		// var y = rect.y - hh;
		var x = rect.x;
		var y = rect.y;
	
		var kappa = 0.5522848,
			ox = hw * kappa,   // control point offset horizontal
			oy = hh * kappa,   // control point offset vertical
			xe = x + w,        // x-end
			ye = y + h,        // y-end
			xm = x + hw,       // x-middle
			ym = y + hh;       // y-middle
	
		ctx.beginPath();
		ctx.moveTo(x, ym);
		ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
		ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
		ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
		ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
	
		ctx.closePath();

		if (fillColor) {
			ctx.fillStyle = fillColor;
			ctx.fill();
		}

		if (typeof strokeWidth === "undefined") {
			strokeWidth = 1;
		}
	
		if (strokeWidth || strokeColor) {
			ctx.lineWidth = strokeWidth || 1;
			ctx.strokeStyle = strokeColor || "black";
			ctx.stroke();
		}
	}

	drawArc(rect, startAngle, endAngle, strokeWidth, strokeColor, fillColor) {
		const ctx = this.ctx;
		
		strokeWidth = strokeWidth || this.strokeWidth || 1;
		strokeColor = strokeColor || this.strokeColor || "black";
		fillColor = fillColor || this.fillColor;

		const x = rect.x, y = rect.y,
			w = rect.width, h = rect.height,
			hw = w / 2, hh = h / 2,
			r = Math.max(w, h);
		
		ctx.beginPath();
		ctx.moveTo(x, y);
		ctx.arc(x, y, r, startAngle * Math.PI / 180, endAngle * Math.PI / 180);
		ctx.closePath();

		if (fillColor) {
			ctx.fillStyle = fillColor;
			ctx.fill();
		}
	
		if (strokeWidth > 0 && strokeColor) {
			ctx.lineWidth = strokeWidth;
			ctx.strokeStyle = strokeColor;
			ctx.stroke();
		}
	}

	drawImage(image, x, y, width, height) {
		var ctx = this.ctx;
		
		ctx.drawImage(image, x, y, width, height);
	}

	drawText(text, p, color, halign, font) {
		const ctx = this.ctx;
	
		ctx.fillStyle = color || "black";		
		ctx.font = font || "12px Arial";
		let { x, y } = p;

		if (font) ctx.font = font;

		if (halign === "center") {
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
		}

		const lines = text.split('\n');

		// TODO: decide line height
		const lineheight = 30;

		for (var i = 0; i < lines.length; i++) {
			const line = lines[i];
			let lx = x;
		
			ctx.fillText(line, lx, y);
			y += lineheight;
		}
	}
  		
	drawLine(from, to, strokeWidth, strokeColor) {
		const ctx = this.ctx;

		ctx.lineWidth = strokeWidth || this.strokeWidth || 1;
		ctx.strokeStyle = strokeColor || this.strokeColor || "black";

		ctx.beginPath();

		if (Array.isArray(from)) {
			ctx.moveTo(from[0], from[1]);
			ctx.lineTo(to[0], to[1]);
		} else {
			ctx.moveTo(from.x, from.y);
			ctx.lineTo(to.x, to.y);
		}

		ctx.closePath();
		ctx.stroke();
	}
		
	drawLineSegments() {
		return this.drawLines(...arguments);
	}

	drawLines(lines, width, color, strip) {
		if (lines.length < 2) return;
	
		const ctx = this.ctx;
	
		if (width === undefined) width = this.strokeWidth;
		if (color === undefined) color = this.strokeColor;

		if (width > 0 && color != "transparent") {
			ctx.lineWidth = width || 1;
			ctx.strokeStyle = color || "black";
	
			ctx.beginPath();
	
			if (strip) {
				const from = lines[0];

				if (Array.isArray(from)) {
					ctx.moveTo(from[0], from[1]);
				} else {
					ctx.moveTo(from.x, from.y);
				}

				for (let i = 1; i < lines.length; i++) {
					const to = lines[i];
					if (Array.isArray(to)) {
						ctx.lineTo(to[0], to[1]);
					} else {
						ctx.lineTo(to.x, to.y);
					}
				}
			} else {
				for (let i = 0; i < lines.length; i += 2) {
					const from = lines[i], to = lines[i + 1];
					if (Array.isArray(from)) {
						ctx.moveTo(from[0], from[1]);
						ctx.lineTo(to[0], to[1]);
					} else {
						ctx.moveTo(from.x, from.y);
						ctx.lineTo(to.x, to.y);
					}
				}
			}

			ctx.closePath();
			ctx.stroke();
		}
	}
		
	drawArrow(from, to, width, color, arrowSize) {
		var ctx = this.ctx;
		
		if (width === undefined) width = 2;
		if (arrowSize === undefined) arrowSize = width * 5;
		
		ctx.lineWidth = width;
		ctx.strokeStyle = color || "black";
		
		var angle = Math.atan2(to.y - from.y, to.x - from.x);
		
		ctx.beginPath();
		
		ctx.moveTo(from.x, from.y);
		ctx.lineTo(to.x, to.y);
		
		ctx.lineTo(to.x - arrowSize * Math.cos(angle - Math.PI / 6),
			to.y - arrowSize * Math.sin(angle - Math.PI / 6));
		
		ctx.moveTo(to.x, to.y);
		ctx.lineTo(to.x - arrowSize * Math.cos(angle + Math.PI / 6),
			to.y - arrowSize * Math.sin(angle + Math.PI / 6));
		
		ctx.closePath();
		ctx.stroke();
	}
		
	fillArrow(from, to, size, color) {
		var ctx = this.ctx;
		
		size = size || 10;
		ctx.fillStyle = color || "black";
		
		var angle = Math.atan2(to.y - from.y, to.x - from.x);
		
		ctx.beginPath();
		
		ctx.moveTo(to.x, to.y);
		ctx.lineTo(to.x - size * Math.cos(angle - Math.PI / 6), to.y - size * Math.sin(angle - Math.PI / 6));
		ctx.lineTo(to.x - size * Math.cos(angle + Math.PI / 6), to.y - size * Math.sin(angle + Math.PI / 6));
		
		ctx.closePath();
		ctx.fill();
	}
		
	drawPolygon(points, strokeWidth, strokeColor, fillColor) {
		const ctx = this.ctx;

		if (!points || points.length < 2) return;
		
		ctx.beginPath();
		
		var p0 = points[0];
		if (Array.isArray(p0))
			ctx.moveTo(p0[0], p0[1]);
		else
			ctx.moveTo(p0.x, p0.y);
		
		for (var i = 1; i < points.length; i++) {
			var p = points[i];
			if (Array.isArray(p))
				ctx.lineTo(p[0], p[1]);
			else
				ctx.lineTo(p.x, p.y);
		}
		
		if (Array.isArray(p0))
			ctx.lineTo(p0[0], p0[1]);
		else
			ctx.lineTo(p0.x, p0.y);

		ctx.closePath();
				
		strokeWidth = strokeWidth || this.strokeWidth || 1;
		strokeColor = strokeColor || this.strokeColor || "black";
		fillColor = fillColor || this.fillColor;
		
		if (fillColor) {
			ctx.fillStyle = fillColor;
			ctx.fill();
		}

		if (strokeWidth || strokeColor) {
			ctx.lineWidth = strokeWidth || 1;
			ctx.strokeStyle = strokeColor || "black";
		
			ctx.stroke();
		}
	}
}