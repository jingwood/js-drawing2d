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
import { Renderer2D } from "../src/render/renderer.js";
import { Scene2D } from "../src/scene/scene.js";
import { Rectangle2D } from "../src/shapes/rectangle.js";
import { Ellipse } from "../src/shapes/ellipse";
import { Rect } from "../src/types/rect";
import { Object2D } from "../src/scene/object.js";
import { Size } from "../src/types/size";
import { Polygon } from "../src/types/polygon.js";
import { Polygon2D } from "../src/index.js";

class TestRect extends Rectangle2D {
  drawSelf(g) {
    super.drawSelf(g);

    g.drawText(this.worldOrigin.x + "," + this.worldOrigin.y, { x: 0, y: 0 },
      "black", "center");
  }
}

window.addEventListener("load", e => {
  const renderer = new Renderer2D();

  const scene = new Scene2D();
  renderer.show(scene);

  scene.ondraw = g => {
    g.drawRoundRect({ x: 10, y: 10, width: 400, height: 40 }, 50, 6, "#aaa", "#eee");
  };

  const rect1 = new TestRect();
  rect1.origin.set(500, 300);
  rect1.size.set(400, 400);
  // rect1.angle = 45;

  const r11 = new TestRect();
  r11.origin.set(100, 0);
  r11.style.fillColor = "lightgreen";
  r11.angle = 30;
  r11.isReceiveHover = true;
  rect1.add(r11);

  rect1.transparency = 0.5;
  r11.transparency = 1;

  // rect1.enableCache = true;

  scene.add(rect1);

  const rect2 = new TestRect();
  rect2.origin.set(1000, 1000);
  rect2.size.set(400, 300);
  scene.add(rect2);

  const p1 = new Polygon2D([
    new Vec2(-200, -200), new Vec2(200, -100),
    new Vec2(200, 200), new Vec2(-200, 100),
  ]);
  p1.origin.set(2000, 1000);
  p1.onmouseenter = e => p1.style.fillColor = '#00aaff';
  p1.onmouseout = e => p1.style.fillColor = "yellow";
  p1.angle = 30;
  p1.isReceiveHover = true;
  p1.onclick = e => p1.angle += 5;
  p1.ondrag = e => p1.offset(e.movement);
  p1.ondraw = g => g.drawText(Math.round(p1.worldOrigin.x) + ","
    + Math.round(p1.worldOrigin.y), { x: 0, y: 0 }, "black", "center");
  scene.add(p1);



  const rect1clone = rect1.clone();
  rect1clone.origin.set(500, 800);
  rect1clone.enableCache = true;
  rect1clone.scaleOrigin.set(-200, 0);
  rect1clone.scale.set(0.5, 0.5);
  rect1clone.transparency = 0.8;
  scene.add(rect1clone);
});
