////////////////////////////////////////////////////////////////////////////////
// js-drawing2d
// Javascript canvas 2D drawing library. Supports both immediate-mode rendering
// and 2D scene rendering.
//
// MIT License (C) 2015-2020 Jingwood, unvell.com, all rights reserved.
////////////////////////////////////////////////////////////////////////////////

import { Vec2, Matrix3 } from "@jingwood/graphics-math";
import { Keys } from "@jingwood/input-control";
import { MathFunctions as _mf } from "@jingwood/graphics-math";
import { Renderer2D } from "../src/render/renderer.js";
import { Scene2D } from "../src/scene/scene.js";
import { Rectangle } from "../src/shapes/rectangle.js";
import { Ellipse } from "../src/shapes/ellipse";
import { Rect } from "../src/types/rect";
import { Object2D } from "../src/scene/object.js";
import { DraggableObject } from "../src/shapes/draggable";
import { Size } from "../src/types/size";

if (!Object.prototype._t_foreach) {
  Object.defineProperty(Object.prototype, "_t_foreach", {
    value: function(iterator) {
      if (this == null) {
        throw "Not an object";
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

class TestRect extends DraggableObject {
  constructor() {
    super();
  }

  draw(g) {
    super.draw(g);

    g.drawRect(this.bbox.rect, this.style.strokeWidth, this.style.strokeColor, this.style.fillColor);

    if (g.options.debugMode) {
      g.drawText(`(${this._worldOrigin.x}, ${this._worldOrigin.y})`, { x: 0, y: 20 }, "black", "center");
    }
  }
}

window.addEventListener("load", e => {
  const renderer = new Renderer2D();

  const scene = new Scene2D();
  renderer.show(scene);

  let moveGuideLines = [];

  const guideLines = {
    x: [],
    y: [],

    alternates: {
      right: [],
      left: [],
      top: [],
      bottom: [],
    }
  };

  scene.ondraw = g => {
    g.drawRoundRect({ x: 10, y: 10, width: 400, height: 40 }, 50, 6, "#aaa", "#eee");

    const maxx = renderer.renderSize.width, maxy = renderer.renderSize.height;

    guideLines.alternates._t_foreach((srcType, alt) => {
      if (alt.length > 0) {
        const gl = alt[0];
        const line = gl.l;

        switch (gl.destType) {
          case "left":
            g.drawLine({ x: line.start.x, y: 0 }, { x: line.start.x, y: maxy }, "2", "blue");
            break;
              
          case "right":
            g.drawLine({ x: line.end.x, y: 0 }, { x: line.end.x, y: maxy }, "2", "blue");
            break;
 
          case "top":
            g.drawLine({ x: 0, y: line.start.y }, { x: maxx, y: line.start.y }, "2", "red");
            break;
              
          case "bottom":
            g.drawLine({ x: 0, y: line.end.y }, { x: maxx, y: line.end.y }, "2", "red");
            break;
        }
      }
    });
  };

  const rect1 = new TestRect();
  rect1.origin.set(500, 100);
  rect1.size.set(400, 300);

  const r11 = new TestRect();
  r11.origin.set(100, 0);
  r11.style.fillColor = "lightgreen";
  r11.angle = 30;
  rect1.add(r11);

  function findNearestObject(srcObj, p, srcType) {
    function findEdgeOfObject(l, destType) {
      const checkDistance = 30;

      const dist = _mf.distancePointToLine2D(p, l);
      if (dist < checkDistance) {
        const gl = { srcType, destType, dist, l };
        guideLines.alternates[srcType].push(gl);
      }
    }

    scene.eachObject(obj => {
      const rect = new Rect(obj.wbbox.rect);
      
      if (srcType === "left" || srcType === "right") {
        findEdgeOfObject(rect.rightEdge, "right");
        findEdgeOfObject(rect.leftEdge, "left");
      }

      if (srcType === "top" || srcType === "bottom") {
        findEdgeOfObject(rect.topEdge, "top");
        findEdgeOfObject(rect.bottomEdge, "bottom");
      }
    }, {
      filter: obj => obj === srcObj
    });

  }

  rect1.drag = function(e) {

    const obj = rect1;

    if (e.isKeyPressed(Keys.R)) {
      obj.angle += e.movement.x + e.movement.y;
    } else if (e.isKeyPressed(Keys.S)) {
      obj.size.width += e.movement.x;
      obj.size.height += e.movement.y;
    } else {

      const targetOrigin = Vec2.sub(e.position, this.dragOffset);

      moveGuideLines = [];
      guideLines.alternates = {
        right: [],
        left: [],
        top: [],
        bottom: [],
      };
  
      const hs = Size.toVector(obj.bbox.size).mul(0.5);
      const rectp = new Rect(targetOrigin.sub(hs), obj.size).toPolygon();
      rectp.transform(Matrix3.makeRotation(obj.angle));
 
      findNearestObject(obj, rectp.points[0], "left");
      findNearestObject(obj, rectp.points[1], "right");
      findNearestObject(obj, rectp.points[0], "top");
      findNearestObject(obj, rectp.points[1], "bottom");
  
      guideLines.alternates._t_foreach((_, alt) => {
        if (alt.length > 0) {
          alt.sort((l1, l2) => l1.dist - l2.dist);
          moveGuideLines.push(alt[0]);
        }
      });


      if (moveGuideLines.length === 0) {
        obj.origin.set(targetOrigin);
      } else {

        const hw = obj.size.width * 0.5, hh = obj.size.height * 0.5;

        guideLines.alternates._t_foreach((srcType, alt) => {
          if (alt.length > 0) {
            const gl = alt[0];
            const l = gl.l;

            switch (srcType) {
              case "left":
                switch (gl.destType) {
                  case "left":
                    targetOrigin.x = l.start.x + hw;
                    break;
                  case "right":
                    targetOrigin.x = l.end.x + hw;
                    break;
                }
                break;
          
              case "right":
                switch (gl.destType) {
                  case "left":
                    targetOrigin.x = l.start.x - hw;
                    break;
                  case "right":
                    targetOrigin.x = l.end.x - hw;
                    break;
                }
                break;
           
              case "top":
                switch (gl.destType) {
                  case "top":
                    targetOrigin.y = l.start.y + hh;
                    break;
                  case "bottom":
                    targetOrigin.y = l.end.y + hh;
                    break;
                }
                break;
            
              case "bottom":
                switch (gl.destType) {
                  case "top":
                    targetOrigin.y = l.start.y - hh;
                    break;
                  case "bottom":
                    targetOrigin.y = l.end.y - hh;
                    break;
                }
                break;
            }
          }
        });

        obj.origin.set(targetOrigin);
      }
    }

    scene.requestUpdateFrame();
  };

  scene.on("enddrag", function(e) {
    moveGuideLines = [];
  });

  scene.add(rect1);

  const rect2 = new TestRect();
  rect2.origin.set(1000, 1000);
  rect2.size.set(400, 300);
  scene.add(rect2);

});
