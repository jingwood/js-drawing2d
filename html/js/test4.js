////////////////////////////////////////////////////////////////////////////////
// js-drawing2d
// Javascript canvas 2D drawing library. Supports both immediate-mode rendering
// and 2D scene rendering.
//
// MIT License (c) 2015-2024 Jingwood, UNVELL Inc., All rights reserved.
////////////////////////////////////////////////////////////////////////////////

import { Vec2, Matrix3 } from "@jingwood/graphics-math";
// import { Keys, MouseButtons } from "@jingwood/input-control";
import { MathFunctions2 as _mf2 } from "@jingwood/graphics-math";
import { Renderer2D } from "../../src/index.js";
import { Scene2D } from "../../src/index.js";
import { Rectangle2D } from "../../src/index.js";
// import { Ellipse } from "../../src/shapes/ellipse";
// import { Rect } from "../../src/types/rect";
// import { Object2D } from "../../src/scene/object.js";
// import { Size } from "../../src/types/size";
// import { Polygon } from "../../src/types/polygon.js";
// import { Polygon2D, Line2D } from "../../src/index.js";

window.addEventListener("load", e => {
  const renderer = new Renderer2D()
  // const ic = renderer.inputController

  const scene = new Scene2D()
  renderer.show(scene)

  // ------------------------------

  const obj1 = new Rectangle2D()
  obj1.origin.set(500,500)
  obj1.size.set(300, 300)
  obj1.style.fillColor = 'blue'

  const obj2 = new Rectangle2D()
  obj2.origin.set(0, 0)
  obj2.style.fillColor = 'yellow'

  obj1.add(obj2)
  scene.add(obj1)

  // ------------------------------

  let origin = new Vec2(obj1.origin)
  let angle = 0
  
  scene.on('draw', g => {
    g.drawText('text 1', new Vec2(100, 100))

    // console.log('------')
    // console.log(0, g.currentTransform)
    g.pushTranslation(origin.x, origin.y)
    // console.log(1, g.currentTransform)

    g.pushRotation(angle, 0, 0)
    // console.log(2, g.currentTransform)
    g.drawText('rotated text 1', Vec2.zero)
    g.popTransform()
    // console.log(1, g.currentTransform)

    g.pushTranslation(300, 0)
    // console.log(2, g.currentTransform)
    g.drawText('text 2', Vec2.zero)
    g.popTransform()
    // console.log(1, g.currentTransform)

    g.popTransform()
    // console.log(0, g.currentTransform)
  })

  scene.animation = true

  scene.on('frame', _ => {
    angle += 1.5
  })

  scene.on('drag', e => {
    obj1.origin.set(e.position)
    origin.set(e.position)

    // no need to call during animation mode
    // scene.requestUpdateFrame()
  })
  
  // ------------------------------

})
