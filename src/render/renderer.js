////////////////////////////////////////////////////////////////////////////////
// js-drawing2d
// Javascript canvas 2D drawing library. Supports both immediate-mode rendering
// and 2D scene rendering.
//
// MIT License (c) 2015-2024 Jingwood, UNVELL Inc., All rights reserved.
////////////////////////////////////////////////////////////////////////////////

import { Graphics2D } from './graphics.js'
import { InputController } from '@jingwood/input-control'
import { Keys } from '@jingwood/input-control/dist/keyboard'
import { Matrix3 } from '@jingwood/graphics-math'

export class Renderer2D {
  static rendererDefaultOptions() {
    return {
      canvasId: 'canvas2d',
      canvasInstance: undefined,
      renderPixelRatio: window.devicePixelRatio || 1,
      debugMode: true,
      debugOptions: {
        showBBox: false,
      },
      autoResize: true,
    }
  }

  constructor(options) {
    this.options = { ...Renderer2D.rendererDefaultOptions(), ...options }
    this.renderSize = { width: 0, height: 0 }

    if (this.options.canvasInstance) {
      this.canvas = this.options.canvasInstance
    } else {
      this.canvas = document.getElementById(this.options.canvasId)

      if (!this.canvas) {
        throw Error('Canvas not found: ' + this.options.canvasId)
      }
    }

    const _this = this

    function canvasResizeCheck() {
      if (_this.options.autoResize) {
        const dpr = _this.options.renderPixelRatio
        const bounds = _this.canvas.getBoundingClientRect()
        if (bounds.width * dpr !== _this.renderSize.width || bounds.height * dpr !== _this.renderSize.height) {
          console.log('canvas resized')
          _this.resetViewport()
          if (_this.currentScene) {
            _this.currentScene.requestUpdateFrame()
          }
        }
      }
    }
    setInterval(canvasResizeCheck, 500)

    this.ctx = this.canvas.getContext('2d')

    if (!this.ctx) {
      throw Error("Can't get context 2d")
    }

    this.graphics = new Graphics2D(this.canvas, this.ctx, this.options)
    this.resetViewport()

    this.inputController = new InputController(this.canvas)
    this.inputController.onmousedown = (e) => {
      if (this.currentScene) this.currentScene.mousedown(this.transformEventArgument(e))
    }
    this.inputController.onmouseup = (e) => {
      if (this.currentScene) this.currentScene.mouseup(this.transformEventArgument(e))
    }
    this.inputController.onmousemove = (e) => {
      if (this.currentScene) {
        this.currentScene.mousemove(this.transformEventArgument(e))
      }
    }
    this.inputController.onmouseenter = (e) => {
      if (this.currentScene) this.currentScene.mouseenter(this.transformEventArgument(e))
    }
    this.inputController.onmouseout = (e) => {
      if (this.currentScene) this.currentScene.mouseout(this.transformEventArgument(e))
    }
    this.inputController.onmousewheel = (e) => {
      if (this.currentScene) this.currentScene.mousewheel(this.transformEventArgument(e))
    }
    this.inputController.onbegindrag = (e) => {
      if (this.currentScene) this.currentScene.begindrag(this.transformEventArgument(e))
    }
    this.inputController.ondrag = (e) => {
      if (this.currentScene) this.currentScene.drag(this.transformEventArgument(e))
    }
    this.inputController.onenddrag = (e) => {
      if (this.currentScene) this.currentScene.enddrag(this.transformEventArgument(e))
    }
    this.inputController.onkeydown = (e) => {
      if (this.currentScene) this.currentScene.keydown(e)
    }
    this.inputController.onkeyup = (e) => {
      if (this.currentScene) this.currentScene.keyup(e)
    }

    if (this.options.debugMode) {
      this.inputController.on('keydown', (e) => {
        let processed = false

        switch (e.lastKeyCode) {
          case Keys.B:
            this.options.debugOptions.showBBox = !this.options.debugOptions.showBBox
            processed = true
            break
        }

        if (processed && this.currentScene) {
          this.currentScene.requestUpdateFrame()
        }
      })
    }

    if (this.options.canvasAutoFocus !== false) {
      this.canvas.tabIndex = 0
      this.canvas.focus()
    }

    this.render()
  }

  resetViewport() {
    const size = this.renderSize

    const dpr = this.options.renderPixelRatio
    const rect = this.canvas.getBoundingClientRect()

    this.aspectRate = rect.width / rect.height

    size.width = this.canvas.width = rect.width * dpr
    size.height = this.canvas.height = rect.height * dpr

    this.canvas.width = size.width
    this.canvas.height = size.height
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  show(scene) {
    if (this.currentScene) {
      this.currentScene.onHide()
    }

    if (this.currentScene !== scene) {
      this.currentScene = scene
      scene.renderer = this
      scene.requestUpdateFrame()
      scene.onShow()
    }
  }

  render() {
    if (this.currentScene && (this.currentScene.animation || this.currentScene.requestedUpdateFrame)) {
      requestAnimationFrame((_) => this.render())

      this.graphics.resetTransform()
      this.clear()

      this.currentScene.requestedUpdateFrame = false
      this.currentScene.render(this.graphics)
    }
  }

  renderToCanvas(canvas, options) {
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw Error("Can't get context 2d from given canvas")
    }

    const g = new Graphics2D(canvas, ctx, options)
    const mat = new Matrix3().loadIdentity()

    if (options) {
      const { origin, scale, size } = options

      if (origin) {
        mat.translate(origin.x, origin.y)
      }

      if (scale) {
        mat.scale(scale, scale)
      }

      if (size) {
        canvas.width = size.width
        canvas.height = size.height
      }
    }

    g.pushTransform(mat)
    this.currentScene.render(g)
    g.popTransform()
  }

  captureImage(options) {
    const memCanvas = document.createElement('canvas')
    memCanvas.width = this.canvas.width
    memCanvas.height = this.canvas.height
    this.renderToCanvas(memCanvas, options)
    return memCanvas.toDataURL()
  }

  transformEventArgument(e) {
    this.transformPoint(e.position)
    this.transformPoint(e.movement)
    return e
  }

  transformPoint(p) {
    p.x *= this.options.renderPixelRatio
    p.y *= this.options.renderPixelRatio
  }
}
