////////////////////////////////////////////////////////////////////////////////
// js-drawing2d
// Javascript canvas 2D drawing library. Supports both immediate-mode rendering
// and 2D scene rendering.
//
// MIT License (C) 2015-2020 Jingwood, unvell.com, all rights reserved.
////////////////////////////////////////////////////////////////////////////////

export class EventArgument {
  constructor(scene, position, movement) {
    this.scene = scene;
    this.position = position;
    this.movement = movement;
  }

  requestUpdateFrame() {
    this.scene.requestUpdateFrame();
  }
}