# js-drawing2d
Lightweight Javascript canvas 2D drawing library. Supports both immediate-mode rendering and 2D scene rendering.

# Installation

```shell
yarn add @jingwood/drawing2d
```

# Hello-world

```js
const renderer = new Renderer2D({
  canvasId: "myCanvas"
});

const scene = new Scene2D();

// create a rectangle object
const rect1 = new Rectangle2D();
rect1.origin.set(500, 300);
rect1.size.set(400, 300);

// rotate 45˚
rect1.angle = 45;

scene.add(rect1);

renderer.show(scene);
```
[See example code](test/test.js)

# API Objects

- **Renderer** - The rendering context.
- **Graphics** - Provides the immediate-mode rendering APIs.
- **Scene** - Collection of objects to be rendered.
- **Object** - An object instance inside scene to be rendered.

# Built-in geometry objects

- Line Segment
- Rectangle2D
- Ellipse2D
- Polygon2D
- Image2D

# License

Released under MIT license.

Copyright (c) 2015-2024 Jingwood, UNVELL Inc., All rights reserved.