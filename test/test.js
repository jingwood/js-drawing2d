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
import { Rectangle } from "../src/shapes/rectangle.js";
import { Ellipse } from "../src/shapes/ellipse";
import { Rect } from "../src/types/rect";
import { Object2D } from "../src/scene/object.js";
import { Size } from "../src/types/size";
import { Polygon } from "../src/types/polygon.js";

if (!Object.prototype._t_foreach) {
  Object.defineProperty(Object.prototype, "_t_foreach", {
    value: function(iterator) {
      if (this == null) {
        throw Error("Cannot iterate over null object");
      }
      const _this = this || window;
      for (const key in _this) {
        if (_this.hasOwnProperty(key)) {
          const ret = iterator.call(_this, key, _this[key]);
          if (ret === false) break;
        }
      }
    },
    enumerable: false,
  });
}

class TestRect extends Rectangle {
  constructor() {
    super();

    this.dragToSnapBehavior = new DragToSnapBehavior(this);
  }

  drag(e) {
    if (e.isKeyPressed(Keys.R)) {
      this.angle += e.movement.x + e.movement.y;
    } else if (e.isKeyPressed(Keys.S)) {
      this.size.width += e.movement.x;
      this.size.height += e.movement.y;
    } else {
      super.drag(e);
    }
  }

  draw(g) {
    super.draw(g);

    g.drawRect(this.bbox.rect, this.style.strokeWidth, this.style.strokeColor, this.style.fillColor);

    if (g.options.debugMode) {
      g.drawText(`(${this._worldOrigin.x}, ${this._worldOrigin.y})`, { x: 0, y: 20 }, "black", "center");
    }
  }
}

class DragToMoveBehavior {
  constructor(obj) {
    this.obj = obj;

    this.obj.on("begindrag", e => {
      this.obj.dragOffset = Vec2.sub(e.position, this.obj.origin);
    });

    this.obj.on("drag", e => {
      this.dragToMove(e.position);
    });

    this.obj.on("enddrag", e => {
      if (this.obj.scene) {
        this.obj.scene.requestUpdateFrame();
      }
    });
  }

  dragToMove(pos) {
    const targetOrigin = Vec2.sub(pos, this.obj.dragOffset);
    this.obj.origin.set(targetOrigin);
  }
}

class DragToSnapBehavior extends DragToMoveBehavior {
  constructor(obj) {
    super(obj);

    this.obj.on("enddrag", _ => {
      DragToSnapBehavior.resetGuideLines();
    });
  }

  dragToMove(pos) {
    const obj = this.obj;

    DragToSnapBehavior.resetGuideLines();
    const guideLines = DragToSnapBehavior.guideLines;
    
    const targetOrigin = Vec2.sub(pos, this.obj.dragOffset);
    const localTargetOrigin = obj.pointToLocal(targetOrigin);

    const hs = Size.toVector(obj.size).mul(0.5);
    const rect = new Rect(Vec2.sub(localTargetOrigin, hs), obj.size);
    const rectPolygon = new Polygon(DragToSnapBehavior.rectToPoints(rect));
    rectPolygon.transform(obj.transform);

    DragToSnapBehavior.findSnapObjects(obj, rectPolygon.points);

    let xFixed = false, yFixed = false;

    for (const [go] of guideLines.points) {
      if (go) {
        targetOrigin.x += go.dp.x - go.sp.x;
        targetOrigin.y += go.dp.y - go.sp.y;
        xFixed = true, yFixed = true;
        break;
      }
    }
      
    if (!yFixed) {
      for (const [go] of guideLines.x) {
        if (go) {
          targetOrigin.y += go.dp.y - go.sp.y;
          yFixed = true;
          break;
        }
      }
    }

    if (!xFixed) {
      for (const [go] of guideLines.y) {
        if (go) {
          targetOrigin.x += go.dp.x - go.sp.x;
          xFixed = true;
          break;
        }
      }
    }
      
    this.obj.origin.set(targetOrigin);
  }

  static findSnapObjects(srcObj, srcPoints) {
    const guideLines = DragToSnapBehavior.guideLines;

    function findNearestPoints(destPoints) {
      const checkDistance = 30;

      function addToArray(parr, go) {
        while (parr.length > 0 && go.dist < parr[parr.length - 1].dist) {
          parr.pop();
        }
        parr.push(go);
      }

      for (let i = 0; i < 9; i++) {
        const sp = srcPoints[i];

        const parr = guideLines.points[i],
          parrx = guideLines.x[i],
          parry = guideLines.y[i];

        for (const dp of destPoints) {
          const kx = dp.x - sp.x, ky = dp.y - sp.y;
          let dist = Math.sqrt(kx * kx + ky * ky);

          if (dist < checkDistance) {
            addToArray(parr, { sp, dp, dist });
          }
          else if (parr.length == 0 && (dist = Math.abs(ky)) < checkDistance) {
            addToArray(parrx, { sp, dp, dist });
          } else if ((dist = Math.abs(kx)) < checkDistance) {
            addToArray(parry, { sp, dp, dist });
          }
        }
      }
    }

    if (DragToSnapBehavior.scene) {
      DragToSnapBehavior.scene.eachObject(obj => {
        const rectPolygon = new Polygon(DragToSnapBehavior.rectToPoints(new Rect(obj.bbox.rect)));
        rectPolygon.transform(obj.transform);
        findNearestPoints(rectPolygon.points);
      }, {
        filter: obj => obj === srcObj
      });
    }
  }

  static rectToPoints(rect) {
    return [rect.topLeft, rect.topCenter, rect.topRight,
    rect.leftCenter, rect.origin, rect.rightCenter,
    rect.bottomLeft, rect.bottomCenter, rect.bottomRight];
  }

  static resetGuideLines() {
    const guideLines = DragToSnapBehavior.guideLines;
    guideLines.points = [[], [], [], [], [], [], [], [], []];
    guideLines.x = [[], [], [], [], [], [], [], [], []];
    guideLines.y = [[], [], [], [], [], [], [], [], []];
  }

  static drawGuideLines(g) {
    const guideLines = DragToSnapBehavior.guideLines;
    if (!guideLines) return;

    const maxx = g.canvas.width, maxy = g.canvas.height;

    if (guideLines.points) {
      for (const [go] of guideLines.points) {
        if (go) {
          function drawCross(p) {
            const size = 7;
            g.drawLine({ x: p.x - size, y: p.y - size }, { x: p.x + size, y: p.y + size }, "2", "black");
            g.drawLine({ x: p.x + size, y: p.y - size }, { x: p.x - size, y: p.y + size }, "2", "black");
          }

          drawCross(go.sp);
          drawCross(go.dp);
        }
      }
    }

    if (guideLines.x) {
      for (const [p] of guideLines.x) {
        if (p) g.drawLine({ x: 0, y: p.dp.y }, { x: maxx, y: p.dp.y }, "2", "red");
      }
    }

    if (guideLines.y) {
      for (const [p] of guideLines.y) {
        if (p) g.drawLine({ x: p.dp.x, y: 0 }, { x: p.dp.x, y: maxy }, "2", "blue");
      }
    }
  }
}

DragToSnapBehavior.scene = null;
DragToSnapBehavior.guideLines = {};

window.addEventListener("load", e => {
  const renderer = new Renderer2D();

  const scene = new Scene2D();
  renderer.show(scene);

  DragToSnapBehavior.scene = scene;
  scene.ondraw = g => {
    g.drawRoundRect({ x: 10, y: 10, width: 400, height: 40 }, 50, 6, "#aaa", "#eee");

    DragToSnapBehavior.drawGuideLines(g);
  };

  const rect1 = new TestRect();
  rect1.origin.set(500, 100);
  rect1.size.set(400, 300);

  const r11 = new TestRect();
  r11.origin.set(100, 0);
  r11.style.fillColor = "lightgreen";
  r11.angle = 30;
  rect1.add(r11);

  scene.add(rect1);

  const rect2 = new TestRect();
  rect2.origin.set(1000, 1000);
  rect2.size.set(400, 300);
  // rect2.angle = 30;
  scene.add(rect2);

  // const rect3 = new TestRect();
  // rect3.origin.set(1600, 1600);
  // rect3.size.set(300, 400);
  // rect3.angle = 30;
  // scene.add(rect3);

});
