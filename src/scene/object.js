////////////////////////////////////////////////////////////////////////////////
// js-drawing2d
// Javascript canvas 2D drawing library. Supports both immediate-mode rendering
// and 2D scene rendering.
//
// MIT License (C) 2015-2020 Jingwood, unvell.com, all rights reserved.
////////////////////////////////////////////////////////////////////////////////

import { Vec2, Matrix3, BoundingBox2D as BBox2D } from "@jingwood/graphics-math";
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

    this._parent = null;
    this._scene = null;
    this.visible = true;
    this.zIndex = 0;
    this.style = new ObjectStyle();
    
    this._isHover = false;
    this.isReceiveHover = false;
    this.isActive = false;
    this.isSelected = false;
    this.isEnabled = true;
    
    this._suspendUpdate = false;

    this.bbox = new BBox2D();
    this.wbbox = new BBox2D();
    this._origin = new Vec2Property(this);
    this._size = new SizeProperty(this, 100, 100);
    this._worldOrigin = new Vec2();

    this._angle = 0;
    this._scale = new Vec2Property(this, 1, 1);
    this._transform = new Matrix3().loadIdentity();
  }

  get parent() {
    return this._parent;
  }

  set parent(p) {
    if (this._parent !== p) {
      this._parent = p;
      this.update();
    }
  }

  get scene() {
    return this._scene;
  }

  set scene(v) {
    if (this._scene !== v) {
      this._scene = v;

      for (const child of this.objects) {
        child.scene = v;
      }
    }
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

  get worldOrigin() {
    return this._worldOrigin;
  }

  get isHover() {
    return this._isHover;
  }
  
  set isHover(v) {
    if (this._isHover !== v) {
      this._isHover = v;
      this.onhoverChange();
      
      if (this._scene) {
        this._scene.requestUpdateFrame();
      }
    }
  }

  add() {
    for (let i = 0; i < arguments.length; i++) {
      const obj = arguments[i];

      if (Array.isArray(obj)) {
        for (const child of obj) {
          this.add(child);
        }
      }
      else {
        this.objects._t_pushIfNotExist(obj);
        obj.parent = this;
        obj.scene = this.scene;
      }
    }
  }

  remove(obj) {
    this.objects._t_remove(obj);
    obj.parent = null;
  }

  clear() {
    this.objects._t_clear();
  }

  eachChild(handler, options) {
    for (let i = 0; i < this.objects.length; i++) {
      const child = this.objects[i];

      if (!options || typeof options.filter !== "function"
        || !options.filter(child)) {
        
        if (handler(child) === false) return false;

        if (!options
          || typeof options.childrenFilter !== "function"
          || !options.childrenFilter(this)) {
          if (child.eachChild(handler, options) === false) return false;
        }
      }
    }
  }

  eachChildInv(handler, options) {
    for (let i = this.objects.length - 1; i >= 0; i--) {
      const child = this.objects[i];

      if (!options || typeof options.filter !== "function"
        || !options.filter(obj)) {
               
        if (!options
          || typeof options.childrenFilter !== "function"
          || !options.childrenFilter(this)) {
            if (child.eachChildInv(handler, options) === false) return false;
        }

        if (handler(child) === false) return false;
      }
    }
  }

  hitTestPoint(p) {
    return this.bbox.contains(this.pointToLocal(p));
  }

  findChildByPosition(p) {
    let target = null;
  
    this.eachChildInv(child => {
      if (child.visible && child.isEnabled && child.hitTestPoint(p)) {
        target = child;
        return false;
      }
    });
  
    return target;
  }

  pointToLocal(p) {
    const t = this._transform.inverse();
    return new Vec2(p).mulMat(t);
  }

  pointToWorld(p) {
    return new Vec2(p).mulMat(this._transform);
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

  click(e) {
    this.onclick(e);
  }
  
  moveTo(p) {
    if (arguments.length === 1) {
      this.origin.set(p);
      this.onmove();
    } else if (arguments.length === 2) {
      this.origin.set(arguments[0], arguments[1]);
      this.onmove();
    }
  }

  offset(arg0, arg1) {
    if (arguments.length === 1) {
      this.origin.set(this.origin.x + arg0.x, this.origin.y + arg0.y);
    } else if (arguments.length === 2) {
      this.origin.set(this.origin.x + arg0, this.origin.y + arg1);
    }
  }

  render(g) {
    const style = this.style;
      
    if (style) {
      if (style.strokeWidth) g.strokeWidth = style.strokeWidth;
      if (style.strokeColor) g.strokeColor = style.strokeColor;
      if (style.fillColor) g.fillColor = style.fillColor;
    }
  
    g.setTransform(this._transform);
      
    this.draw(g);

    for (let k = 0; k < this.objects.length; k++) {
      const child = this.objects[k];
      if (child && child.visible) {
        child.render(g);
      }
    }

    this.drawAfterChildren(g);

    if (g.options.debugMode && g.options.debugOptions.showBBox) {
      g.resetTransform();
      g.drawRect(this.wbbox.rect, 1, "red");
    }
  }

  draw(g) {
    this.ondraw(g);
  }

  drawAfterChildren(g) {
  }

  update() {
    if (this._suspendUpdate) return;
    
    this.updateTransform();
    this.updateBoundingBox();
    this.updateWorldBoundingBox();
    this.updateChildren();
    
    if (this._scene) {
      this._scene.requestUpdateFrame();
    }
  }

  updateTransform() {

    this._transform.loadIdentity();
    this._transform.notIdentity = false;

    const t = this._transform;

    if (this.origin.x !== 0 || this.origin.y !== 0
      || this.angle !== 0
      || this.scale.x !== 1 || this.scale.y !== 1) {
      t.translate(this.origin.x, this.origin.y);
      t.rotate(this.angle);
      t.scale(this.scale.x, this.scale.y);
      t.notIdentity = true;
    }

    if (this.parent) {
      // if (!this.notIdentity) {
      //   this._transform.copyFrom(this.parent.transform);
      // } else {
        this._transform = this._transform.mul(this.parent.transform);
        this._transform.notIdentity = true;
      // }
 
      this._worldOrigin = this.origin.mulMat(this.parent.transform);

    }
    
    this._worldOrigin.set(this.origin);
  }

  updateChildren() {
    for (const child of this.objects) {
      child.update();
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
  "mousewheel", "click",
  "begindrag", "drag", "enddrag",
  "getFocus", "lostFocus",
	"keyup", "keydown",
  "childAdd", "childRemove",
  "move", "rotate",
  "draw",
  "hoverChange");

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

class ReadonlyProperty {
  constructor(obj, name, getter) {
    this.obj = obj;
    Object.defineProperty(obj, name, {
      get: getter
    });
  }

  static define(obj, name, getter) {
    Object.defineProperty(obj, name, {
      get: getter
    });
  }
}

class SizeProperty extends Size {
  constructor(obj, width = 0, height = 0) {
    super();
    this.obj = obj;

    this._width = width;
    this._height = height;
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