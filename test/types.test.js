import { describe, test } from 'node:test'
import assert from 'node:assert/strict'
import { Rect, Size, Polygon } from '../src/index.js'

describe('Rect', () => {
  test('edges', () => {
    const r = new Rect(10, 20, 30, 40)
    assert.equal(r.left, 10)
    assert.equal(r.top, 20)
    assert.equal(r.right, 40)
    assert.equal(r.bottom, 60)
  })

  test('contains', () => {
    const r = new Rect(0, 0, 100, 50)
    assert.ok(r.contains({ x: 50, y: 25 }))
    assert.ok(!r.contains({ x: 150, y: 25 }))
  })

  test('intersectsRect', () => {
    const r = new Rect(0, 0, 100, 100)
    assert.ok(r.intersectsRect(new Rect(50, 50, 100, 100)))
    assert.ok(!r.intersectsRect(new Rect(200, 200, 10, 10)))
  })

  test('offset', () => {
    const r = new Rect(0, 0, 10, 10)
    r.offset(5, 6)
    assert.equal(r.x, 5)
    assert.equal(r.y, 6)
  })
})

describe('Size', () => {
  test('clone', () => {
    const s = new Size(3, 4)
    const c = s.clone()
    assert.notEqual(c, s)
    assert.equal(c.width, 3)
    assert.equal(c.height, 4)
  })
})

describe('Polygon', () => {
  const square = () => new Polygon([
    { x: 0, y: 0 },
    { x: 20, y: 0 },
    { x: 20, y: 20 },
    { x: 0, y: 20 },
  ])

  test('bounding box', () => {
    const p = square()
    assert.equal(p.bbox.min.x, 0)
    assert.equal(p.bbox.min.y, 0)
    assert.equal(p.bbox.max.x, 20)
    assert.equal(p.bbox.max.y, 20)
  })

  test('containsPoint', () => {
    const p = square()
    assert.ok(p.containsPoint({ x: 10, y: 10 }))
    assert.ok(!p.containsPoint({ x: 30, y: 10 }))
  })

  test('distanceToPoint', () => {
    assert.equal(square().distanceToPoint({ x: 15, y: 15 }), 5)
  })
})
