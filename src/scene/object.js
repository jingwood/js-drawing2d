////////////////////////////////////////////////////////////////////////////////
// js-drawing2d
// Javascript canvas 2D drawing library. Supports both immediate-mode rendering
// and 2D scene rendering.
//
// MIT License (C) 2015-2020 Jingwood, unvell.com, all rights reserved.
////////////////////////////////////////////////////////////////////////////////

import { Vec2, Matrix3, BBox2D } from "@jingwood/graphics-math";
import { EventDispatcher } from "@jingwood/input-control";
import { ObjectStyle } from "./style";
import { EventArgument } from "./eventarg";
import { Size } from "../types/size";
import { Renderer2D } from "../render/renderer";

// TODO: remove polyfill
if (typeof BBox2D.transform !== "function") {
  BBox2D.transform = function(bbox, matrix) {
    const v1 = bbox.min.mulMat(matrix);
    const v2 = new Vec2(bbox.max.x, bbox.min.y).mulMat(matrix);
    const v3 = new Vec2(bbox.min.x, bbox.max.y).mulMat(matrix);
    const v4 = bbox.max.mulMat(matrix);
  
    const minx = Math.min(v1.x, v2.x, v3.x, v4.x);
    const miny = Math.min(v1.y, v2.y, v3.y, v4.y);
    const maxx = Math.max(v1.x, v2.x, v3.x, v4.x);
    const maxy = Math.max(v1.y, v2.y, v3.y, v4.y);
  
    return new BBox2D(new Vec2(minx, miny), new Vec2(maxx, maxy));
  }
}

// TODO: remove polyfill
if (typeof BBox2D.prototype.transform !== "function") {
  BBox2D.prototype.transform = function(matrix) {
    return BBox2D.transform(this, matrix);
  }
}

export class Object2D {
  constructor() {
    this.objects = [];

    this.visible = true;
    this.zIndex = 0;
    this.style = new ObjectStyle();
    this.selected = false;

    this.bbox = new BBox2D();
    this.wbbox = new BBox2D();
    this._origin = new Vec2Property(this);
    this._size = new SizeProperty(this);

    this._angle = 0;
    this._scale = new Vec2Property(this, 1, 1);
    this._transform = new Matrix3().loadIdentity();
  }

  set origin(v) {
    if (this._origin.x !== v.x || this._origin.y !== v.y) {
      this._origin.set(v);
    }
  }

  get origin() {
    return this._origin;
  }

  set size(v) {
    if (this._size.width !== v.width || this._size.height !== v.height) {
      this._size.set(v);
    }
  }

  get size() {
    return this._size;
  }

  set width(v) {
    this._size.width = v;
  }

  get width() {
    return this._size.width;
  }

  set height(v) {
    this._size.height = v;
  }

  get height() {
    return this._size.height;
  }

  get angle() {
    return this._angle;
  }

  set angle(v) {
    if (this._angle !== v) {
      this._angle = v;
      this.update();
    }
  }

  get scale() {
    return this._scale;
  }

  set scale(v) {
    if (this._scale.x !== v.x || this._scale.y !== v.y) {
      this._scale.set(v);
    }
  }

  get transform() {
    return this._transform;
  }

  add() {
    for (var i = 0; i < arguments.length; i++) {
      var arg = arguments[i];
      if (Array.isArray(arg)) {
        for (var k = 0; k < arg.length; k++) {
          this.add(arg[k]);
        }
      }
      else {
        this.objects._t_pushIfNotExist(arg);
      }
    }
  }

  remove(obj) {
    this.objects._t_remove(obj);
  }

  clear() {
    this.objects._t_clear();
  }

  eachChild(handler) {
    for (var i = 0; i < this.objects.length; i++) {
      var child = this.objects[i];
      if (handler(child) === false) break;
      if (child.eachChild(handler) === false) break;
    }
  }

  eachChildInv(handler) {
    for (let i = this.objects.length - 1; i >= 0; i--) {
      const child = this.objects[i];
      if (child.eachChildInv(handler) === false) return false;
      if (handler(child) === false) return false;
    }
  }

  hitTestPoint(p) {
    return this.bbox.contains(this.pointToObject(p));
  }

  pointToObject(p) {
    const t = this._transform.inverse();
    return new Vec2(p).mulMat(t);
  }

  mousedown(e) {
    this.onmousedown(e);
  }

  mousemove(e) {
    this.onmousemove(e);
  }

  mouseup(e) {
    this.onmouseup(e);
  }

  mouseenter(e) {
    this.onmouseenter(e);
  }

  mouseout(e) {
    this.onmouseout(e);
  }

  begindrag(e) {
    this.onbegindrag(e);
  }

  drag(e) {
    this.ondrag(e);
  }

  enddrag(e) {
    this.onenddrag(e);
  }
  
  moveTo(p) {
    if (arguments.length === 1) {
      this.bbox.origin = p;
      this.onmove();
    } else if (arguments.length === 2) {
      this.bbox.origin = { x: arguments[0], y: arguments[1] };
      this.onmove();
    }
  }

  render(g) {
    const style = this.style;
      
    if (style) {
      if (style.strokeWidth) g.strokeWidth = style.strokeWidth;
      if (style.strokeColor) g.strokeColor = style.strokeColor;
      if (style.fillColor) g.fillColor = style.fillColor;
    }
  
    if (this._transform.notIdentity) {
      g.pushTransform(this._transform);
    }
      
    this.draw(g);

    for (let k = 0; k < this.objects.length; k++) {
      const child = this.objects[k];
      if (child && child.visible) {
        child.render(g);
      }
    }

    if (this._transform.notIdentity) {
      g.popTransform();
    }

    // g.resetDrawingStyle();

    if (g.options.debugMode && g.options.debugOptions.showBBox) {
      // g.drawRect(this.bbox.rect, 1, "blue");
      g.drawRect(this.wbbox.rect, 1, "red");
    }
  }

  draw(g) {
    this.ondraw(g);
  }

  update() {
    this.updateTransform();
    this.updateBoundingBox();
    this.updateWorldBoundingBox();
  }

  updateTransform() {
    const t = this._transform;
    t.loadIdentity();
    t.notIdentity = false;

    if (this.origin.x !== 0 || this.origin.y !== 0
      || this.angle !== 0
      || this.scale.x !== 1 || this.scale.y !== 1) {
      t.translate(this.origin.x, this.origin.y);
      t.rotate(this.angle);
      t.scale(this.scale.x, this.scale.y);
      t.notIdentity = true;
    }
  }
  
  updateBoundingBox() {
    const { width, height } = this.size.mul(0.5);
    this.bbox.min.set(-width, -height);
    this.bbox.max.set(width, height);
  }

  updateWorldBoundingBox() {
    this.wbbox = this.bbox.transform(this.transform);
  }

}

// Event declarations
new EventDispatcher(Object2D).registerEvents(
  "mousedown", "mouseup", "mousemove", "mouseenter", "mouseout",
  "mousewheel",
  "begindrag", "drag", "enddrag",
  "getFocus", "lostFocus",
	"keyup", "keydown",
  "childAdd", "childRemove",
  "move", "rotate",
  "draw");

class Vec2Property extends Vec2 {
  constructor(obj, x = 0, y = 0) {
    super();
    this.obj = obj;

    this._x = x;
    this._y = y;
  }

  notify() {
    if (this.obj) {
      this.obj.update();
    }
  }

  set() {
    super.set(...arguments);
    this.notify();
  }

  get x() {
    return this._x;
  }

  set x(v) {
    if (this._x !== v) {
      this._x = v;
      this.notify();
    }
  }

  get y() {
    return this._y;
  }

  set y(v) {
    if (this._y !== v) {
      this._y = v;
      this.notify();
    }
  }
}

class SizeProperty extends Size {
  constructor(obj) {
    super();
    this.obj = obj;

    this._width = 0;
    this._height = 0;
  }

  notify() {
    if (this.obj) {
      this.obj.update();
    }
  }

  set() {
    super.set(...arguments);
    this.notify();
  }

  get width() {
    return this._width;
  }

  set width(v) {
    if (this._width !== v) {
      this._width = v;
      this.notify();
    }
  }

  get height() {
    return this._height;
  }

  set height(v) {
    if (this._height !== v) {
      this._height = v;
      this.notify();
    }
  }
}