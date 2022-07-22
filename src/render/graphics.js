////////////////////////////////////////////////////////////////////////////////
// js-drawing2d
// Javascript canvas 2D drawing library. Supports both immediate-mode rendering
// and 2D scene rendering.
//
// MIT License (C) 2015-2020 Jingwood, unvell.com, all rights reserved.
////////////////////////////////////////////////////////////////////////////////

import { Vec2, Matrix3 } from "@jingwood/graphics-math";
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
		this.transformStack = [];

		if (this.options.scale) {
			// this.pushScale(options.scale.x, options.scale.y);
		}
	}

	pushTransform(t) {
		this.transformStack.push(this.currentTransform);
		t = t.mul(this.currentTransform);
		this.currentTransform = t;
		this.ctx.setTransform(t.a1, t.b1, t.a2, t.b2, t.a3, t.b3);
	}

	popTransform() {
		this.currentTransform = this.transformStack.pop();
		const t = this.currentTransform;
		this.ctx.setTransform(t.a1, t.b1, t.a2, t.b2, t.a3, t.b3);
	}

	pushTranslation(x, y) {
		const m = Matrix3.makeTranslation(x, y);
		this.pushTransform(m);
		return m;
	}

	pushRotation(angle, x = 0, y = 0) {
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

		const t = this.currentTransform;
		this.ctx.setTransform(t.a1, t.b1, t.a2, t.b2, t.a3, t.b3);
	}

	setTransform(t) {
		if (this.transformStack.length > 0) {
			this.transformStack = [];
		}
		this.currentTransform.copyFrom(t);
		this.ctx.setTransform(t.a1, t.b1, t.a2, t.b2, t.a3, t.b3);
	}

	resetDrawingStyle() {
		this.strokeWidth = 1;
		this.strokeColor = "black";
		this.fillColor = "white";
	}

	drawRect(rect, strokeWidth, strokeColor, fillColor, strokeStyle) {
		const ctx = this.ctx;

		// ctx.beginPath();

		if (fillColor) {
			ctx.fillStyle = fillColor;
			ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
		}

		if (strokeColor && strokeWidth > 0) {
			ctx.strokeStyle = strokeColor;
			ctx.lineWidth = strokeWidth;

			if (strokeStyle) {
				switch (strokeStyle) {
					case "dash":
						ctx.setLineDash([5, 2]); break;
				}
			}

			ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);

			if (strokeStyle) ctx.setLineDash([]);
		}
		// ctx.closePath();

	}

	drawRoundRect(rect, cornerSize, strokeWidth = 1, strokeColor = "black", fillColor = "white", strokeStyle) {
		const ctx = this.ctx;

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

		if (fillColor) {
			ctx.fillStyle = fillColor;
			ctx.fill();
		}

		if (strokeWidth > 0 && strokeColor) {
			ctx.lineWidth = strokeWidth;
			ctx.strokeStyle = strokeColor;

			switch (strokeStyle) {
				case "dash":
					ctx.setLineDash([strokeWidth, ctx.lineWidth]); break;
			}

			ctx.stroke();

			if (strokeStyle) ctx.setLineDash([]);
		}
	}

	drawPoint(p, size = 3, strikeWidth, strikeColor, fillColor) {
		this.drawEllipse(new Rect(p.x - size / 2, p.y - size / 2, size, size), strikeWidth, strikeColor, fillColor);
	}

	// drawEllipse(p, size, strokeWidth, strokeColor, fillColor) {
	// 	var r = new Rect(p.x - size / 2, p.y - size / 2, size, size);
	// 	return this.drawEllipse(r, strokeWidth, strokeColor, fillColor);
	// };

	drawEllipse(rect, strokeWidth, strokeColor, fillColor) {
		const ctx = this.ctx;

		const w = rect.width, h = rect.height;
		const hw = w / 2, hh = h / 2;
		const x = rect.x, y = rect.y;

		const kappa = 0.5522848,
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

		if (strokeWidth || strokeColor) {
			ctx.lineWidth = strokeWidth;
			ctx.strokeStyle = strokeColor;
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

	drawText(text, p, color, font, options) {
		const ctx = this.ctx

		options = {
			hAlign: 'center',
			lineHeight: 30,
			...options
		}

		ctx.fillStyle = color || "black"
		ctx.font = font || "1.5em Arial"

		let { x, y } = p

		const halign = options && options.hAlign ? options.hAlign : 'center'
		ctx.textAlign = halign

		if (halign === "center") {
			ctx.textBaseline = "middle"
		}

		if (typeof text !== "string") {
			text = new String(text)
		}

    let stroked = false

    if (options.strokeStyle) {
			ctx.strokeStyle = options.strokeStyle
      stroked = true
    }

    if (options.strokeWidth) {
      ctx.lineWidth = options.strokeWidth
      stroked = true
    }

		const lines = text.split('\n')

		// TODO: decide line height automatically
		const lineheight = (options && options.lineHeight) ? options.lineHeight : 30

		for (var i = 0; i < lines.length; i++) {
			const line = lines[i]
			let lx = x

      if (stroked) {
        ctx.strokeText(line, lx, y);
      }

			ctx.fillText(line, lx, y)
			y += lineheight
		}
	}

	drawLine(from, to, strokeWidth = 1, strokeColor = "black", strokeStyle = undefined) {
		const ctx = this.ctx;

		ctx.lineWidth = strokeWidth;
		ctx.strokeStyle = strokeColor;

		if (strokeStyle && strokeStyle !== 'solid') {
			if (Array.isArray(strokeStyle)) {
				ctx.setLineDash(strokeStyle);
			} else {
				ctx.setLineDash([8, 4, 4]);
			}
		}

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

		if (strokeStyle) {
			ctx.setLineDash([]);
		}
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

	drawArrow(start, end, width = 2, color = "black", arrowSize = width + 10, fillColor = color, strokeStyle) {
		const ctx = this.ctx;

		const v = Vec2.sub(end, start);
		const n = Vec2.normalize(v);
		const angle = Math.atan2(n.y, n.x);
		const pi6 = Math.PI / 6;
		const end2 = Vec2.sub(end, Vec2.mul(n, arrowSize * 0.5));

		ctx.beginPath();

		ctx.moveTo(start.x, start.y);
		ctx.lineTo(end2.x, end2.y);

		ctx.lineWidth = width;
		ctx.strokeStyle = color;

		switch (strokeStyle) {
			case "dash":
				ctx.setLineDash([ctx.lineWidth, ctx.lineWidth]); break;
		}

		ctx.stroke();

		if (strokeStyle) ctx.setLineDash([]);

		ctx.moveTo(end.x, end.y);
		ctx.lineTo(end.x - arrowSize * Math.cos(angle - pi6), end.y - arrowSize * Math.sin(angle - pi6));
		ctx.lineTo(end.x - arrowSize * Math.cos(angle + pi6), end.y - arrowSize * Math.sin(angle + pi6));

		ctx.closePath();

		ctx.fillStyle = fillColor;
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