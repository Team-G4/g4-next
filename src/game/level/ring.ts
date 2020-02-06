import { IPrimitive, SerializedPrimitive, isIPrimitive, BallPrimitive, BarPrimitive } from "./primitives"
import { Group, Material } from "three"
import { Level } from "./level"
import { Cannon } from "./cannon"

export class Ring {
    public items: (IPrimitive | Ring)[] = []

    public centerX = 0
    public centerY = 0
    public rotation = 0

    constructor(
        public level: Level,
        public timeMultiplier = 1,
        public distanceFromCenter = 0,
        public revolutionFrequency = 0,
        public revolutionPhase = 0,
        public parentRing: Ring = null
    ) {}

    add(...prim: (IPrimitive | Ring)[]) {
        this.items.push(...prim)
    }

    serialize(): SerializedPrimitive {
        return {
            type: "Ring",

            items: this.items.map(item => item.serialize())
        }
    }

    advanceRingPosition(dTime: number) {
        const parentX = this.parentRing?.centerX ?? 0
        const parentY = this.parentRing?.centerY ?? 0

        this.rotation += dTime

        this.centerX = parentX + Math.cos(this.rotation * this.revolutionFrequency * 2 * Math.PI + this.revolutionPhase * 2 * Math.PI) * this.distanceFromCenter
        this.centerY = parentY + Math.sin(this.rotation * this.revolutionFrequency * 2 * Math.PI + this.revolutionPhase * 2 * Math.PI) * this.distanceFromCenter
    }

    advance(dTime: number) {
        this.advanceRingPosition(dTime)
        this.items.forEach(i => i.advance(
            dTime * this.timeMultiplier
        ))
    }

    hitTest(x: number, y: number, bulletRadius = 0): IPrimitive {
        for (const item of this.items) {
            const hit = item.hitTest(x, y, bulletRadius)
            if (hit) {
                if (hit instanceof Ring) return hit.hitTest(x, y, bulletRadius)
                else if (isIPrimitive(item)) return item
            }
        }

        return null
    }

    getSpan(): number {
        return Math.max(
            ...this.items.map(i => i.getSpan())
        )
    }
}