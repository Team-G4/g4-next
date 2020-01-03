import { IRasterizer, IRasterizedPrimitive, Rasterizable } from "../rasterizer";
import { BallPrimitive, BarPrimitive } from "../../game/level/primitives";
import { Level } from "../../game/level/level";
import { Ring } from "../../game/level/ring";
import { IMode, PrimitiveMaterial } from "../../game/mode/mode";
import { StyledPathGroup, StyledPath } from "./path";

export interface ICanvas2DRasterizedPrimitive extends IRasterizedPrimitive {
    path: StyledPathGroup | StyledPath
}

export class Canvas2DRasterizedBallPrimitive implements ICanvas2DRasterizedPrimitive {
    path: StyledPathGroup | StyledPath

    constructor(
        public rasterizer: Canvas2DRasterizer,
        public ball: BallPrimitive,
        public mode: IMode
    ) {}

    update() {
        let path = new Path2D()

        let {x, y} = this.ball.ballPosition

        path.arc(
            x, y,
            this.ball.ballRadius,
            0, 2 * Math.PI
        )

        this.path = new StyledPath(
            path, this.rasterizer.getStyleFromPrimMat(
                this.mode.getMaterial(this.ball)
            )
        )
    }
}

export class Canvas2DRasterizedBarPrimitive implements ICanvas2DRasterizedPrimitive {
    path: StyledPathGroup | StyledPath

    constructor(
        public rasterizer: Canvas2DRasterizer,
        public bar: BarPrimitive,
        public mode: IMode
    ) {}

    update() {
        let path = new Path2D()

        path.arc(
            this.bar.ring.centerX, this.bar.ring.centerY,
            this.bar.distance + this.bar.barRadius,
            2 * Math.PI * this.bar.angle - 0.01,
            2 * Math.PI * (this.bar.angle + this.bar.length) + 0.01
        )
        path.arc(
            this.bar.ring.centerX, this.bar.ring.centerY,
            this.bar.distance - this.bar.barRadius,
            2 * Math.PI * (this.bar.angle + this.bar.length) + 0.01,
            2 * Math.PI * this.bar.angle - 0.01,
            true
        )

        this.path = new StyledPath(
            path, this.rasterizer.getStyleFromPrimMat(
                this.mode.getMaterial(this.bar)
            )
        )
    }
}

export class Canvas2DRasterizedRing implements ICanvas2DRasterizedPrimitive {
    public path: StyledPathGroup

    public items: ICanvas2DRasterizedPrimitive[]

    constructor(
        rasterizer: Canvas2DRasterizer,
        public ring: Ring,
        mode: IMode
    ) {
        this.items = this.ring.items.map(item => rasterizer.rasterizePrimitive(mode, item))
    }

    update() {
        let path = new StyledPathGroup()
        
        this.items.forEach(item => {
            item.update()
            path.addPath(item.path)
        })

        this.path = path
    }
}

export class Canvas2DRasterizedLevel implements ICanvas2DRasterizedPrimitive {
    public path: StyledPathGroup

    public rings: Canvas2DRasterizedRing[]

    constructor(
        rasterizer: Canvas2DRasterizer,
        public level: Level,
        mode: IMode
    ) {
        this.rings = this.level.rings.map(ring => new Canvas2DRasterizedRing(rasterizer, ring, mode))
    }

    update() {
        let path = new StyledPathGroup()
        
        this.rings.forEach(ring => {
            ring.update()
            path.addPath(ring.path)
        })

        this.path = path
    }
}

export class Canvas2DRasterizer implements IRasterizer {
    getStyleFromPrimMat(pm: PrimitiveMaterial) {
        return pm.color
    }

    rasterizePrimitive(mode: IMode, prim: Rasterizable): ICanvas2DRasterizedPrimitive {
        if (prim instanceof BallPrimitive) {
            return new Canvas2DRasterizedBallPrimitive(this, prim, mode)
        } else if (prim instanceof BarPrimitive) {
            return new Canvas2DRasterizedBarPrimitive(this, prim, mode)
        } else if (prim instanceof Ring) {
            return new Canvas2DRasterizedRing(this, prim, mode)
        } else if (prim instanceof Level) {
            return new Canvas2DRasterizedLevel(this, prim, mode)
        }

        return null
    }
}