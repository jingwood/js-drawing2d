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
import { Rect } from "../types/rect";
import { Size } from "../types/size";
import { Renderer2D } from "../render/renderer";
import { Graphics2D } from "../render/graphics";
import { MathFunctions } from "@jingwood/graphics-math/";

export class Object2D {
  constructor() {
    this.objects = [];

    this._parent = null;
    this._scene = null;
    this._visible = true;
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
    this._transformDirty = true;
    this._transform = new Matrix3().loadIdentity();
    this._transformInversed = new Matrix3().loadIdentity();
    
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
      this._transformDirty = true;
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

  get x() {
    return this._origin._x;
  }

  set x(v) {
    if (this._origin._x !== v) {
      this._origin.x = v;
    }
  }

  get y() {
    return this._origin._y;
  }

  set y(v) {
    if (this._origin._y !== v) {
      this._origin.y = v;
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
      this._transformDirty = true;
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
	
	get visible() {
		return this._visible;
	}

	set visible(v) {
		if (this._visible !== v) {
			this._visible = v;
      this.onvisibleChanged();
      
      if (this.scene) {
        this.scene.requestUpdateFrame();
      }
		}
	}

  get transform() {
    return this._transform;
  }

  get transformInversed() {
    return this._transformInversed;
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
    if (arguments.length <= 0) return;

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

    if (this.scene) {
      this.scene.requestUpdateFrame();
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
        let ret = child.eachChildInv(handler, options);
        if (ret) return ret;

        ret = handler(child);
        if (ret) return ret;
      }
    }
  }

  hitTestPoint(p) {
    return this.bbox.containsPoint(this.pointToLocal(p));
  }

  hitTestRect(rect) {
    // const r = (rect instanceof Rect) ? rect : new Rect(rect);

    // const p1 = this.pointToLocal(r.topLeft),
    //   p2 = this.pointToLocal(r.topRight),
    //   p3 = this.pointToLocal(r.bottomLeft),
    //   p4 = this.pointToLocal(r.bottomRight);
    
    
    return Rect.intersectsRect(this.wbbox.rect, rect);
  }

  findChildByPosition(p, options) {
    for (let i = this.objects.length - 1; i >= 0; i--) {
      const child = this.objects[i];
      if (!child.visible || child._renderArgs.transparency <= 0) continue;
  
      if (options && typeof options.childrenFilter === "function") {
        if (!options.childrenFilter(child)) continue;
      }

      const target = child.findChildByPosition(p, options);
      if (target) return target;

      if (!options || typeof options.filter !== "function"
        || options.filter(child)) {

        if (child.enabled && child.hitTestPoint(p)) {
          return child;
        }
      }
    }
  }

  pointToLocal(p) {
    return new Vec2(p).mulMat(this._transformInversed);
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
    // const _this = this;

    // function _offset(x, y) {
    //   _this._origin._x += x;
    //   _this._origin._y += y;

    //   _this._transform.translate(x, y);

    //   _this.updateChildrenTransform();
    // }

    // if (arguments.length === 1) {
    //   _offset(arg0.x, arg0.y);
    // } else if (arguments.length === 2) {
    //   _offset(arg0, arg1);
    // }

    // if (this._scene) this._scene.requestUpdateFrame();

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

    if (g.options.debugMode && g.options.debugOptions.showBBox) {
      g.drawRect(this.bbox.rect, 1, "blue");
    }
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

    //if (!this._transformDirty) return;

    window._updates++;
    this._transformDirty = false;

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

    this._transformInversed = this._transform.inverse();
  }

  updateChildren() {
    for (const child of this.objects) {
      child.update();
    }
  }

  updateChildrenTransform() {
    for (const child of this.objects) {
      child.updateTransform();
    }
  }
  
  updateBoundingBox() {
    const { width, height } = this.size.mul(0.5);
    this.bbox.min.set(-width, -height);
    this.bbox.max.set(width, height);
  }

  updateWorldBoundingBox() {
    this.wbbox.set(this.bbox);
    this.wbbox.applyTransform(this.transform);
    // this.wbbox = this.bbox.transform(this.transform);
  }

  clone() {
    const prototypeType = Object.getPrototypeOf(this);
    let newObj = Object.create(prototypeType);

    if (prototypeType) {
      newObj = prototypeType.constructor.call(newObj);
    }

    newObj.origin.set(this.origin);
    newObj.size.set(this.size);
    newObj.angle = this.angle;
    
    newObj.isReceiveHover = this.isReceiveHover;

    if (this.style) {
      if (typeof newObj.style !== "object") {
        newObj.style = {};
      }
      Object.assign(newObj.style, this.style);
    }

    for (const child of this.objects) {
      const newChild = child.clone();
      newObj.add(newChild);
    }

    // newObj.transparency = obj.transparency;

    return newObj;
  }
}

// Event declarations
new EventDispatcher(Object2D).registerEvents(
  "mousedown", "mouseup", "mousemove", "mouseenter", "mouseout",
  "mousewheel", "click",
  "begindrag", "drag", "enddrag",
  // "keyup", "keydown",
  "draw",
  "originChanged", "sizeChanged", "scaleChanged", "visibleChanged",
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
      this.obj._transformDirty = true;
      this.obj.update();
      this.changeCallback();
    }
  }

  set() {
    switch (arguments.length) {
			case 1:
				const arg0 = arguments[0];
				if (arg0) {
					this._x = arg0.x;
					this._y = arg0.y;
				}
				break;

			case 2:
				this._x = arguments[0]; this._y = arguments[1];
				break;
		}
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
      this.obj._transformDirty = true;
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