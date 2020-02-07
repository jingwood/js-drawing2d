////////////////////////////////////////////////////////////////////////////////
// js-drawing2d
// Javascript canvas 2D drawing library. Supports both immediate-mode rendering
// and 2D scene rendering.
//
// MIT License (C) 2015-2020 Jingwood, unvell.com, all rights reserved.
////////////////////////////////////////////////////////////////////////////////

import { Vec2, Matrix3 } from "@jingwood/graphics-math";
import { EventDispatcher } from "@jingwood/input-control";
import { EventArgument } from "./eventarg";

export class Scene2D {
  constructor() {
    this.animation = false;
    this.requestedUpdateFrame = false;

    this.objects = [];
    this.focusObject = null;
    this.dragObject = null;
    this.hoverObject = null;
  }

  onShow() {
    // this.renderer.currentScene = this;
    // this.requestUpdateFrame();
  }

  onHide() {
  }

  render(g) {
    for (var i = 0; i < this.objects.length; i++) {
      var obj = this.objects[i];
      if (obj && obj.visible) {
        obj.render(g);
      }
    }

    this.ondraw(g);
  }

  requestUpdateFrame() {
    this.requestedUpdateFrame = true;
    if (this.renderer) {
      requestAnimationFrame(_ => this.renderer.render());
    }
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
    this.requestUpdateFrame();
  }

  remove(obj) {
    this.objects.remove(obj);
  }

  eachObject(handler, options) {
    for (let i = 0; i < this.objects.length; i++) {
      const obj = this.objects[i];

      if (!options || typeof options.filter !== "function"
        || !options.filter(obj)) {
        if (handler(obj) === false) return false;
        if (obj.eachChild(handler, options) === false) return false;
      }
    }
  }

  eachObjectInv(handler, options) {
    for (let i = this.objects.length - 1; i >= 0; i--) {
      const obj = this.objects[i];

      if (!options || typeof options.filter !== "function"
        || !options.filter(obj)) {
        if (obj.eachChildInv(handler, options) === false) return false;
        if (handler(obj) === false) return false;
      }
    }
  }

  eachObjectFromParentInv(parent, handler) {
    var ret = undefined;

    for (var i = parent.objects.length - 1; i >= 0; i--) {
      var obj = parent.objects[i];
      if (handler(obj) === false) break;

      if (this.eachObjectFromParentInv(obj, handler) === false) return false;
    }
  }

  findObjectByPosition(p) {
    let target = null;

    this.eachObjectInv(obj => {
      if (obj.visible && obj.hitTestPoint(p)) {
        target = obj;
        return false;
      }
    });

    return target;
  }

  mousedown(e) {
    const pos = e.position;

    const obj = this.findObjectByPosition(pos);
    let isProcessed = false;
    
    if (obj) {
      this.dragObject = obj;
      isProcessed = obj.mousedown(this.createEventArgument(e, obj));
    }

    if (!isProcessed) {
      this.onmousedown(this.createEventArgument(e));
    }
  }

  mouseup(e) {
    this.onmouseup(this.createEventArgument(e));
  }

  mousemove(e) {
    const pos = e.position;
    const obj = this.findObjectByPosition(pos);
    
    if (obj) {
      obj.mousemove(this.createEventArgument(e, obj));
    }

    if (this.hoverObject !== obj) {
      if (this.hoverObject) {
        this.hoverObject.mouseout(this.createEventArgument(e, this.hoverObject));
      }

      this.hoverObject = obj;

      if (this.hoverObject) {
        obj.mouseenter(this.createEventArgument(e, this.hoverObject));
      }
    }
    
    this.onmousemove(this.createEventArgument(e));
  }

  mouseenter() {
  }

  mouseout() {
  }

  begindrag(e) {
    const evtArg = this.createEventArgument(e, this.dragObject);
    
    if (this.dragObject) {
      this.dragObject.begindrag(evtArg);
      this.requestUpdateFrame();
    }
    
    this.onbegindrag(evtArg);
  }

  drag(e) {
    const evtArg = this.createEventArgument(e, this.dragObject);

    if (this.dragObject) {
      this.dragObject.drag(evtArg);
      this.requestUpdateFrame();
    }

    this.ondrag(evtArg);
  }

  enddrag(e) {
    const evtArg = this.createEventArgument(e, this.dragObject);
    
    if (this.dragObject) {
      this.dragObject.enddrag(evtArg);
      this.dragObject = null;
      this.requestUpdateFrame();
    }
    
    this.onenddrag(evtArg);
  }

  keydown(e) {
    this.onkeydown(e);
  }

  keyup(e) {
    this.onkeyup(e);
  }

  createEventArgument(arg, obj) {      
    if (obj) {
      arg.localPosition = obj.pointToObject(arg.position);
    }

    return arg;
  }
};

// Event declarations
new EventDispatcher(Scene2D).registerEvents(
	"mousedown", "mouseup", "mousemove", "mousewheel",
  "begindrag", "drag", "enddrag",
  "getFocus", "lostFocus",
	"keyup", "keydown",
	"objectAdd", "objectRemove",
	"draw");
