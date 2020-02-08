import { Object2D } from "../scene/object";
import { Vec2 } from "@jingwood/graphics-math";
import { EventDispatcher } from "@jingwood/input-control/dist/event";

export class DraggableObject extends Object2D {
  constructor() {
    super();
    this.dragOffset = new Vec2();
  }

  begindrag(e) {
    this.dragOffset = Vec2.sub(e.position, this.origin);
  }

  drag(e) {
    const targetOrigin = Vec2.sub(e.position, this.dragOffset);
    const newTargetOrigin = this.beforeMove(targetOrigin);
    this.origin.set(newTargetOrigin);
  }

  beforeMove(newpos) {
    return newpos;
  }
}

class Behavior {
}

export class DragBehavior { 
  constructor(type) {
  }
}

// new EventDispatcher(DraggableObject).registerEvents(
//   "beforeMove");