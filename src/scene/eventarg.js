////////////////////////////////////////////////////////////////////////////////
// js-drawing2d
// Javascript canvas 2D drawing library. Supports both immediate-mode rendering
// and 2D scene rendering.
//
// MIT License (c) 2015-2024 Jingwood, UNVELL Inc., All rights reserved.
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