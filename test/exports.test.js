import { test } from 'node:test'
import assert from 'node:assert/strict'
import * as drawing2d from '../src/index.js'

test('package entry exports the public API', () => {
  const names = ['Renderer2D', 'Graphics2D', 'Scene2D', 'Object2D', 'Line2D', 'Rectangle2D', 'Ellipse2D', 'Image2D', 'Polygon2D', 'LineSegment', 'Polygon', 'Rect', 'Size']
  for (const name of names) {
    assert.equal(typeof drawing2d[name], 'function', `${name} is exported`)
  }
})
