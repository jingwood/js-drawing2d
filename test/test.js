////////////////////////////////////////////////////////////////////////////////
// js-drawing2d
// Javascript canvas 2D drawing library. Supports both immediate-mode rendering
// and 2D scene rendering.
//
// MIT License (C) 2015-2020 Jingwood, unvell.com, all rights reserved.
////////////////////////////////////////////////////////////////////////////////

import { Vec2 } from "@jingwood/graphics-math/dist/vec2";
import { Keys } from "@jingwood/input-control";
import { MathFunctions as _mf } from "@jingwood/graphics-math";
import { Renderer2D } from "../src/render/renderer.js";
import { Scene2D } from "../src/scene/scene.js";
import { Rectangle } from "../src/shapes/rectangle.js";
import { Ellipse } from "../src/shapes/ellipse";
import { Rect } from "../src/types/rect";
import { Object2D } from "../src/scene/object.js";
import { DraggableObject } from "../src/shapes/draggable";

class TestRect extends DraggableObject {
  constructor() {
    super();
  }

  draw(g) {
    g.drawRect(this.bbox.rect, this.style.strokeWidth, this.style.strokeColor, this.style.fillColor);
  }
}

window.addEventListener("load", e => {
  const renderer = new Renderer2D();

  const scene = new Scene2D();
  renderer.show(scene);

  scene.ondraw = g => {
    // g.drawRoundRect({ x: 10, y: 10, width: 400, height: 40 }, 50, 6, "#aaa", "#eee");
    // g.drawRoundRect({ x: 1000, y: 1000, width: 400, height: 40 }, 200, 2, "#aaa", "#eee");

    for (const line of moveGuideLines) {
      switch (line.type) {
        case "left":
        case "right":
          g.drawLine({ x: line.start.x, y: 0 }, { x: line.start.x, y: renderer.renderSize.height }, "2", "blue");
          break;
      }
    }
  };

  scene.onmousemove = (e) => {
    scene.requestUpdateFrame();
  };

  const rect1 = new TestRect();
  rect1.origin.set(100, 100);
  rect1.size.set(400, 300);

  Object2D.prototype.on("mousedown", function(e) {
  });

  const r11 = new Rectangle();
  r11.origin.set(100, 0);
  r11.style.fillColor = "lightgreen";
  // r11.angle = 30;
  rect1.add(r11);

  let moveGuideLines = [];

  function findNearestObject(p) {
    moveGuideLines = [];

    scene.eachObject(obj => {
      const rect = new Rect(obj.wbbox.rect);
      const checkDistance = 20;
      
      let l, dist, gl;
      l = rect.rightEdge;
      dist = _mf.distancePointToLine2D(p, l);
      if (dist < checkDistance) {
        gl = { type: "right", dist, ...l };
        moveGuideLines.push(gl);
      }
    });
  }

  rect1.drag = function(e) {

    const targetOrigin = new Vec2(e.position).sub(this.dragOffset);
    const targetTopLeft = targetOrigin.sub(rect1.size.v.mul(0.5));

    findNearestObject(targetTopLeft);

    moveGuideLines.sort((l1, l2) => l1.dist - l2.dist);

    if (e.isKeyPressed(Keys.R)) {
      rect1.angle += e.movement.x + e.movement.y;
    } else if (e.isKeyPressed(Keys.S)) {
      rect1.size.width += e.movement.x;
      rect1.size.height += e.movement.y;
    } else {

      if (moveGuideLines.length === 0) {
        rect1.origin.set(targetOrigin);
      } else {
        const gl1 = moveGuideLines[0];
        switch (gl1.type) {
          case "right":
            rect1.origin.set(gl1.start.x + rect1.size.width * 0.5, targetOrigin.y);
            break;
          
          case "left":
            rect1.origin.set(gl1.end.x + rect1.size.width * 0.5, targetOrigin.y);
            break;
        }
      }
    }

    scene.requestUpdateFrame();
  };

  scene.add(rect1);

  const rect2 = new TestRect();
  rect2.origin.set(1000, 1000);
  rect2.size.set(400, 300);
  scene.add(rect2);

});
