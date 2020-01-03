import { WebGLRenderer } from "three/src/renderers/WebGLRenderer";
import { Scene, OrthographicCamera, Color, MeshLambertMaterial } from "three";
import { Level } from "../../game/level/level";
import { IVisualRenderer } from "../renderer";
import { WGLRasterizer, IWGLRasterizedPrimitive } from "./rasterizer";
import { BeatingHeart } from "../../util/heart";

export class WGLRenderer implements IVisualRenderer {
    public scene: Scene
    public camera: OrthographicCamera

    public mat = new MeshLambertMaterial({
        color: 0xA0A0A0
    })

    public rasterizer = new WGLRasterizer()

    public wglRenderer = new WebGLRenderer({
        antialias: true
    })

    public level: Level
    public rasterizedLevel: IWGLRasterizedPrimitive

    public heart = new BeatingHeart()

    get domElement(): HTMLCanvasElement {
        return this.wglRenderer.domElement
    }

    updateSize(w: number, h: number) {
        this.camera = new OrthographicCamera(
            -w / 2, w / 2, h / 2, -h / 2, 0.01, 10000
        )
        this.camera.position.z = 500

        this.wglRenderer.setSize(w, h)
    }

    initLevel(level: Level) {
        this.level = level
        this.rasterizedLevel = this.rasterizer.rasterize(level.mode, level)

        this.scene = new Scene()
        this.scene.scale.y = -1

        this.scene.background = new Color(0xFFFFFF)

        this.scene.add(
            this.rasterizedLevel.threeObject
        )
    }

    render(timestamp: DOMHighResTimeStamp) {
        let dTime = this.heart.beat(timestamp)

        this.level.mode.advance(this.level, dTime)
        this.rasterizedLevel.update(this.level.mode.isMaterialDynamic)

        this.wglRenderer.render(
            this.scene, this.camera
        )
    }
}