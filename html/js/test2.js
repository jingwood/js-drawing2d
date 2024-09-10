////////////////////////////////////////////////////////////////////////////////
// js-drawing2d
// Javascript canvas 2D drawing library. Supports both immediate-mode rendering
// and 2D scene rendering.
//
// MIT License (c) 2015-2024 Jingwood, UNVELL Inc., All rights reserved.
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
  const renderer = new Renderer2D();

  const scene = new Scene2D();
  renderer.show(scene);


  const pl = new Polygon2D([
    new Vec2(400, 100),
    new Vec2(1300, 100),
    new Vec2(1000, 500),
    new Vec2(100, 500),
  ]);

  // scene.add(pl);

  const ctx = renderer.graphics.ctx;


  function createPath() {
    const pts1 = [
      new Vec2(400, 500),
      new Vec2(1300, 100),
      new Vec2(1500, 1500),
      new Vec2(200, 1300),
    ];

    const innerPts = [
      new Vec2(1100, 800),
      new Vec2(600, 900),
      new Vec2(700, 1200),
      new Vec2(1100, 1200),
    ];

    function drawPolygon(_pts) {

      ctx.moveTo(_pts[0].x, _pts[0].y);
    
      for (const p of _pts) {
        ctx.lineTo(p.x, p.y);
      }

      ctx.lineTo(_pts[0].x, _pts[0].y);
    }

    ctx.beginPath();
    
    drawPolygon(pts1);
    drawPolygon(innerPts);

    ctx.closePath();
  }

  let isHit;

  scene.on('draw', g => {

    createPath();

    ctx.lineWidth = 3;
    ctx.strokeStyle = "black";
    ctx.fillStyle = isHit ? 'green' : 'yellow';
  

    ctx.fill();
    ctx.stroke();

  });

  scene.on('mousemove', e => {
    createPath();
    
    isHit = (ctx.isPointInPath(e.position.x, e.position.y));
    console.log(isHit);
    scene.requestUpdateFrame();
  });
  
});
