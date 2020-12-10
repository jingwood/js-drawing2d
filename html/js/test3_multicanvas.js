////////////////////////////////////////////////////////////////////////////////
// js-drawing2d
// Javascript canvas 2D drawing library. Supports both immediate-mode rendering
// and 2D scene rendering.
//
// MIT License (C) 2015-2020 Jingwood, unvell.com, all rights reserved.
////////////////////////////////////////////////////////////////////////////////

import { Vec2, Matrix3 } from "@jingwood/graphics-math";
import { Keys } from "@jingwood/input-control";
import { MathFunctions2 as _mf2 } from "@jingwood/graphics-math";
import { Renderer2D } from "../../src/index.js";
import { Scene2D } from "../../src/index.js";
import { Rectangle2D } from "../../src/index.js";
import { Ellipse } from "../../src/shapes/ellipse";
import { Rect } from "../../src/types/rect";
import { Object2D } from "../../src/scene/object.js";
import { Size } from "../../src/types/size";
import { Polygon } from "../../src/types/polygon.js";
import { Polygon2D, Line2D } from "../../src/index.js";

window.addEventListener("load", e => {
  const renderer1 = new Renderer2D({ canvasId: 'canvas1' });
  const renderer2 = new Renderer2D({ canvasId: 'canvas2' });

  const scene1 = new Scene2D();
  const scene2 = new Scene2D();
  
  renderer1.show(scene1);
  renderer2.show(scene2);

  const obj1 = new Rectangle2D();
  obj1.origin.set(300, 300);
  obj1.ondrag = e => obj1.offset(e.movement);
  scene1.add(obj1);

  const obj2 = new Rectangle2D();
  obj2.origin.set(500, 500);
  obj2.style.strokeColor = 'blue';
  setInterval(_ => obj2.angle += 5, 100);
  scene2.add(obj2);

});
