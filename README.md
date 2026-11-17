# js-drawing2d
Lightweight Javascript canvas 2D drawing library. Supports both immediate-mode rendering and 2D scene rendering.

# Installation

```shell
npm install @jingwood/drawing2d
```

The package is published as native ES modules. Its only dependencies are [@jingwood/graphics-math](https://github.com/jingwood/js-graphics-math) and [@jingwood/input-control](https://github.com/jingwood/js-input-control), which have no dependencies themselves. It works as-is in bundlers, or in browsers with an [import map](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap) (see [html/test.html](html/test.html)).

# Hello-world

```js
import { Renderer2D, Scene2D, Rectangle2D } from "@jingwood/drawing2d";

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
[See example code](html/js/test.js)

## Migrating from 1.x

- The source is no longer transpiled by Babel. If you need to support legacy browsers, transpile the package in your own build.
- Only the package root (`@jingwood/drawing2d`) can be imported. Deep imports such as `@jingwood/drawing2d/dist/...` are no longer available.
- Requires `@jingwood/graphics-math` 2.x and `@jingwood/input-control` 2.x.

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

# Development

```shell
npm install
npm test     # unit tests (Node.js 22 or later)
npm start    # serve the demo pages under html/
```

# License

Released under MIT license.

Copyright (c) 2015-2024 Jingwood, UNVELL Inc., All rights reserved.
