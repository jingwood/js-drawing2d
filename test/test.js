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
import { Polygon2D, Line2D } from "../src/index.js";

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

  scene.on("draw", g => {
    g.drawRoundRect({ x: 10, y: 10, width: 400, height: 40 }, 50, 6, "#aaa", "#eee");
    g.drawArrow({ x: 100, y: 600 }, { x: 700, y: 1500 }, 10, "blue", 100, "blue", "dash");
  });

  scene.on("keydown", e => {

    if (e.keyCode === Keys.Z) {
      renderer.options.debugOptions.showBBox = !renderer.options.debugOptions.showBBox;
      scene.requestUpdateFrame();
    }
  });

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
  p1.ondrag = e => { p1.offset(e.movement); e.isProcessed = true; }
  p1.ondraw = g => g.drawText(Math.round(p1.worldOrigin.x) + ","
    + Math.round(p1.worldOrigin.y), { x: 0, y: 0 }, "black", "center");
  const pr1 = new Rectangle2D();
  pr1.origin.set(100, 0);
  p1.add(pr1);
  scene.add(p1);

  const pobjs = [];
  for (let i = 0; i < 300; i++) {
    const cp = p1.clone();
    cp.origin.set(Math.random() * 2000, Math.random() * 2000);
    cp.onmouseenter = e => cp.style.fillColor = '#00aaff';
    cp.onmouseout = e => cp.style.fillColor = "yellow";
    pobjs.push(cp);
    scene.add(cp);
  }

  function move(diff) {
    const dt = new Date();
    window._updates = 0;
    pobjs.forEach(po => po.offset(diff));
    const elapsed = new Date() - dt;
    console.log(window._updates + " " + elapsed + "ms.");
  }

  scene.on("drag", e => move(e.movement));

  // setInterval(_ => move({ x: Math.random() * 20, y: Math.random() * 20 }), 2000);


  const rect1clone = rect1.clone();
  rect1clone.origin.set(500, 800);
  rect1clone.scaleOrigin.set(-200, 0);
  rect1clone.scale.set(0.5, 0.5);
  rect1clone.transparency = 0.8;
  rect1clone.enableCache = true;
  scene.add(rect1clone);


  const layer = new Object2D();
  layer.enabled = false;
  scene.add(layer);

  const panel = new Rectangle2D();
  panel.style.fillColor = "#d0f0ff";
  panel.origin.set(1400, 500);
  panel.size.set(500, 500);
  layer.add(panel);

  const line1 = new Line2D(new Vec2(-200, -200), new Vec2(200, 200));
  line1.style.strokeWidth = 30;
  // line1.scale.set(.1, .1);
  line1.on("mouseenter", e => {
    line1.style.strokeColor = "#3333ff";
    scene.requestUpdateFrame();
  });
  line1.on("mouseout", e => {
    line1.style.strokeColor = "black";
    scene.requestUpdateFrame();
  });
  panel.add(line1);

  // test select objects by rect
  (_ => {
    const selectedObjs = [];
    const rect = new Rect(100, 100, 500, 1400);
    const mat = new Matrix3().loadIdentity().translate(2000, 0).rotate(90);
    rect.applyTransform(mat);

    for (const obj of scene.objects) {
      if (obj.hitTestRect(rect)) {
        selectedObjs.push(obj);
      }
    }
    scene.on("draw", g => g.drawRect(rect, 4, "black", null, "dash"));
    
    console.log(selectedObjs);
  })();


  // const r1 = new Rectangle2D();
  // r1.origin.set(100, 100);
  // scene.add(r1);

  scene.on("mousedown", e => {
    const obj = scene.findObjectByPosition(e.position);
    console.log(obj);
  });
  
});
