////////////////////////////////////////////////////////////////////////////////
// js-drawing2d
// Javascript canvas 2D drawing library. Supports both immediate-mode rendering
// and 2D scene rendering.
//
// MIT License (C) 2015-2020 Jingwood, unvell.com, all rights reserved.
////////////////////////////////////////////////////////////////////////////////

import { Renderer2D } from "../src/render/renderer.js";
import { Scene2D } from "../src/scene/scene.js";
import { Rectangle } from "../src/shapes/rectangle.js";

window.addEventListener("load", e => {
  const renderer = new Renderer2D();

  const scene = new Scene2D();
  renderer.show(scene);

  scene.ondraw = g => {
    g.drawRoundRect({ x: 10, y: 10, width: 400, height: 40 }, 50, 6, "#aaa", "#eee");
    g.drawRoundRect({ x: 1000, y: 1000, width: 400, height: 40 }, 200, 2, "#aaa", "#eee");
  };

  const rect1 = new Rectangle();
  rect1.origin.set(100, 100);
  rect1.size.set(400, 300);

  scene.onmousemove = (e) => {
    rect1.origin = e.position;
    scene.requestUpdateFrame();
  };

  scene.ondrag = e => {  
    rect1.origin = e.position;

    if (e.isKeyPressed(32)) {
      rect1.angle += e.movement.x + e.movement.y;
    } else {
      rect1.size.width += e.movement.x;
      rect1.size.height += e.movement.y;
    }

    scene.requestUpdateFrame();
  };

  scene.add(rect1);
  
});
