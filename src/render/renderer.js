////////////////////////////////////////////////////////////////////////////////
// js-drawing2d
// Javascript canvas 2D drawing library. Supports both immediate-mode rendering
// and 2D scene rendering.
//
// MIT License (C) 2015-2020 Jingwood, unvell.com, all rights reserved.
////////////////////////////////////////////////////////////////////////////////

import { Graphics2D } from "./graphics.js";
import { InputController } from "@jingwood/input-control";
import { Keys } from "@jingwood/input-control/dist/keyboard";

const rendererDefaultOptions = {
  canvasId: "canvas2d",
  canvasInstance: undefined,
  renderPixelRatio: window.devicePixelRatio || 1,
  debugMode: true,
  debugOptions: {
    showBBox: false,
  },
};

export class Renderer2D {
  constructor(options) {
    this.options = { ...rendererDefaultOptions, ...options };
    this.renderSize = { width: 0, height: 0 };

    if (this.options.canvasInstance) {
      this.canvas = this.options.canvasInstance;
    } else {
      this.canvas = document.getElementById(this.options.canvasId);

      if (!this.canvas) {
        throw "Canvas not found: " + this.options.canvasId;
      }
    }

    this.ctx = this.canvas.getContext("2d");

    if (!this.ctx) {
      throw "Can't get context 2d";
    }

    this.graphics = new Graphics2D(this.canvas, this.ctx, this.options);
    this.resetViewport();

    this.inputController = new InputController(this.canvas);
    this.inputController.onmousedown = e => { if (this.currentScene) this.currentScene.mousedown(this.transformEventArgument(e)); }
    this.inputController.onmouseup = e => { if (this.currentScene) this.currentScene.mouseup(this.transformEventArgument(e)); }
    this.inputController.onmousemove = e => { if (this.currentScene) { this.currentScene.mousemove(this.transformEventArgument(e)); } }
    this.inputController.onmouseenter = e => { if (this.currentScene) this.currentScene.mouseenter(this.transformEventArgument(e)); }
    this.inputController.onmouseout = e => { if (this.currentScene) this.currentScene.mouseout(this.transformEventArgument(e)); }
    this.inputController.onbegindrag = e => { if (this.currentScene) this.currentScene.begindrag(this.transformEventArgument(e)); }
    this.inputController.ondrag = e => { if (this.currentScene) this.currentScene.drag(this.transformEventArgument(e)); }
    this.inputController.onenddrag = e => { if (this.currentScene) this.currentScene.enddrag(this.transformEventArgument(e)); }
    this.inputController.onkeydown = e => { if (this.currentScene) this.currentScene.keydown(this.transformEventArgument(e)); }
    this.inputController.onkeyup = e => { if (this.currentScene) this.currentScene.keyup(this.transformEventArgument(e)); }

    if (this.options.debugMode) {
      this.inputController.on("keydown", e => {
        switch (e.lastKeyCode) {
          case Keys.B:
            this.options.debugOptions.showBBox = !this.options.debugOptions.showBBox;
            break;
        }

        if (this.currentScene) {
          this.currentScene.requestUpdateFrame();
        }
      });
    }
    
    this.canvas.tabIndex = 0;
    this.canvas.focus();

    this.render();
  }

  resetViewport() {
    const size = this.renderSize;

    const dpr = this.options.renderPixelRatio;
    const rect = this.canvas.getBoundingClientRect();

    this.aspectRate = rect.width / rect.height;

		size.width = rect.width * dpr;
		size.height = rect.height * dpr;
  
    this.canvas.width = size.width;
    this.canvas.height = size.height ;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  show(scene) {
    if (this.currentScene) {
      this.currentScene.onHide();
    }

    if (this.currentScene !== scene) {
      this.currentScene = scene;
      scene.renderer = this;
      scene.requestUpdateFrame();
      scene.onShow();
    }
  }

  render() {
    if (this.currentScene && (this.currentScene.animation || this.currentScene.requestedUpdateFrame)) {
      requestAnimationFrame(_ => this.render());
     
      this.clear();
      
      this.currentScene.render(this.graphics);
      this.currentScene.requestedUpdateFrame = false;
    }
  }

  transformEventArgument(e) {
    this.transformPoint(e.position);
    this.transformPoint(e.movement);
    return e;
  }
  
  transformPoint(p) {
    p.x *= this.options.renderPixelRatio;
    p.y *= this.options.renderPixelRatio;
  }
}

