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
import { Graphics2D } from "../render/graphics";
import { MathFunctions } from "@jingwood/graphics-math/";

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
    this._transparency = 1;
    
    this._isHover = false;
    this.isReceiveHover = false;
    this.isActive = false;
    this.isSelected = false;
    this.enabled = true;
    
    this._suspendUpdate = false;

    this.bbox = new BBox2D();
    this.wbbox = new BBox2D();
    this._origin = new Vec2Property(this, 0, 0, _ => this.onoriginChanged());
    this._size = new SizeProperty(this, 100, 100);
    this._worldOrigin = new Vec2();
    this.minSize = new Size(20, 20);

    this._angle = 0;
    this._scale = new Vec2Property(this, 1, 1, _ => this.onscaleChanged());
    this.rotateOrigin = new Vec2();
    this.scaleOrigin = new Vec2();
    this._transform = new Matrix3().loadIdentity();
    
    this.enableCache = false;
    this.cacheDirty = true;
    this.cachePadding = 10;

    this._renderArgs = {
      transparency: 1
    };
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
      this.onhoverChanged();
      
      if (this._scene) {
        this._scene.requestUpdateFrame();
      }
    }
  }

  get transparency() {
    return this._transparency;
  }

  set transparency(v) {
    this._transparency = v;

    this._updateRenderArgs();

    for (const child of this.objects) {
      child._updateRenderArgs();
    }
  }

  _updateRenderArgs() {
    if (this.parent) {
      this._renderArgs.transparency = MathFunctions.clamp(Math.min(this._transparency, this.parent.transparency));
    } else {
      this._renderArgs.transparency = MathFunctions.clamp(this._transparency);
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

      if (!options || typeof options.filter !== "function" || options.filter(child)) {
        if (child.eachChildInv(handler, options) === false) return false;
        if (handler(child) === false) return false;
      }
    }
  }

  hitTestPoint(p) {
    return this.enabled && this.bbox.contains(this.pointToLocal(p));
  }

  findChildByPosition(p) {
    let target = null;
  
    this.eachChildInv(child => {
      if (child.visible && child.hitTestPoint(p)) {
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

    if (this._renderArgs.transparency < 1) {
      g.ctx.globalAlpha = this._renderArgs.transparency;
    } else {
      g.ctx.globalAlpha = 1;
    }
  
    g.setTransform(this._transform);
    
    if (this.enableCache) {
      if (this.cacheDirty) {
        this.cacheDraw();
        this.cacheDirty = false;
      }

      if (this.cacheCanvas) {
        g.drawImage(this.cacheCanvas, -this.width * 0.5 - this.cachePadding * 0.5,
          -this.height * 0.5 - this.cachePadding * 0.5,
          this.width + this.cachePadding, this.height + this.cachePadding);
      }
    } else {
      this.draw(g);
    }

    g.ctx.globalAlpha = 1;

    if (g.options.debugMode && g.options.debugOptions.showBBox) {
      g.resetTransform();
      g.drawRect(this.wbbox.rect, 1, "red");
    }
  }

  draw(g) {
    this.drawSelf(g);
    this.ondraw(g);
    this.drawChildren(g);
    this.drawAfterChildren(g);
  }

  drawSelf(g) {
  }

  drawChildren(g) {
    for (const child of this.objects) {
      if (child && child.visible) {
        child.render(g);
      }
    }
  }

  drawAfterChildren(g) {
  }

  cacheDraw() {
    if (!this.cacheCanvas) {
      this.cacheCanvas = document.createElement("canvas");
      this.cache2DContext = null;
      this.cache2DGraphics = null;
    }

    this.cacheCanvas.width = this.width + this.cachePadding;
    this.cacheCanvas.height = this.height + this.cachePadding;

    if (!this.cache2DContext) {
      this.cache2DContext = this.cacheCanvas.getContext("2d");
    }
    this.cache2DContext.clearRect(0, 0, this.cacheCanvas.width, this.cacheCanvas.height);

    if (!this.cache2DGraphics) {
      this.cache2DGraphics = new Graphics2D(this.cacheCanvas, this.cache2DContext);
    }

    let transform = new Matrix3().loadIdentity();
    transform.translate(this.width * 0.5 + this.cachePadding * 0.5,
      this.height * 0.5 + this.cachePadding * 0.5);

    if (this.parent) {
      transform = transform.mul(this.parent.transform);
    }

    this._cacheTransform = transform;
    this.updateChildren();

    this.cache2DGraphics.setTransform(transform);
 
    this.draw(this.cache2DGraphics);
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

      if (this.scaleOrigin.x !== 0 || this.scaleOrigin.y !== 0) {
        t.translate(this.scaleOrigin.x , this.scaleOrigin.y );
      }

      t.scale(this.scale.x, this.scale.y);

      if (this.scaleOrigin.x !== 0 || this.scaleOrigin.y !== 0) {
        t.translate(-this.scaleOrigin.x , -this.scaleOrigin.y );
      }

      t.notIdentity = true;
    }

    if (this.parent) {
      this._transform.notIdentity = true;

      if (this.parent.cacheCanvas) {
        this._transform = this._transform.mul(this.parent._cacheTransform);
        this._worldOrigin.set(this.origin.mulMat(this.parent._cacheTransform));
      } else {
        this._transform = this._transform.mul(this.parent.transform);
        this._worldOrigin.set(this.origin.mulMat(this.parent.transform));
      }
 
    } else {
      this._worldOrigin.set(this.origin);
    }
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

  clone() {
    const prototypeType = Object.getPrototypeOf(this);
    const newObj = Object.create(prototypeType);

    if (prototypeType) {
      prototypeType.constructor.call(newObj);
    }

    newObj.origin.set(this.origin);
    newObj.size.set(this.size);
    newObj.angle = this.angle;

    if (this.style) {
      newObj.style = {};
      Object.assign(newObj.style, this.style);
    }

    for (const child of this.objects) {
      const newChild = child.clone();
      newObj.add(newChild);
    }

    return newObj;
  }
}

// Event declarations
new EventDispatcher(Object2D).registerEvents(
  "mousedown", "mouseup", "mousemove", "mouseenter", "mouseout",
  "mousewheel", "click",
  "begindrag", "drag", "enddrag",
  "keyup", "keydown",
  "draw",
  "originChanged", "sizeChanged", "scaleChanged",
  "hoverChanged",

  // "childAdd", "childRemove",
  // "getFocus", "lostFocus",
  // "moved", "rotated",
);

class Vec2Property extends Vec2 {
  constructor(obj, x = 0, y = 0, changeCallback) {
    super();
    this.obj = obj;

    this._x = x;
    this._y = y;
    this.changeCallback = changeCallback;
  }

  notify() {
    if (this.obj) {
      this.obj.update();
      this.changeCallback();
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
      this.obj.onsizeChanged();
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
    if (this.obj) {
      if (v < this.obj.minSize.width) v = this.obj.minSize.width;
    }

    if (this._width !== v) {
      this._width = v;
      this.notify();
    }
  }

  get height() {
    return this._height;
  }

  set height(v) {
    if (this.obj) {
      if (v < this.obj.minSize.height) v = this.obj.minSize.height;
    }
    
    if (this._height !== v) {
      this._height = v;
      this.notify();
    }
  }
}