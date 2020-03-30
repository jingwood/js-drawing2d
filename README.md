# js-drawing2d
Lightweight Javascript canvas 2D drawing library. Supports both immediate-mode rendering and 2D scene rendering.

# Hello-world

```js
const renderer = new Renderer2D();

const scene = new Scene2D();

// create a rectangle
const rect1 = new Rectangle();
rect1.origin.set(500, 300);
rect1.size.set(400, 300);

// rotate 45˚
rect1.angle = 45;

scene.add(rect1);

renderer.show(scene);
```
[See example code](test/test.js)

# License

Released under MIT license.

Copyright (C) 2020 Jingwood & unvell.com, all rights reserved.