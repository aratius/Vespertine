import { Vector2, Vector4 } from "three";

export interface ITouchInput {
  id: string | number;
  input: Vector4;
}

export class ExternalForceManager {

  public inputTouches: ITouchInput[] = []
  public resolution: Vector2 = new Vector2(0, 0)

  constructor(canvas: HTMLCanvasElement, resolution: Vector2) {
    this.resolution = resolution

    canvas.addEventListener("mousedown", (event: MouseEvent) => {
      if (event.button === 0) {
        const x = (event.clientX / canvas.clientWidth) * this.resolution.x;
        const y = 1.0 - (event.clientY + window.scrollY) / canvas.clientHeight;
        this.inputTouches.push({
          id: "mouse",
          input: new Vector4(x, y, 0, 0)
        });
      }
    });
    canvas.addEventListener("mousemove", (event: MouseEvent) => {
      if (this.inputTouches.length > 0) {
        const x = (event.clientX / canvas.clientWidth) * this.resolution.x;
        const y = 1.0 - (event.clientY + window.scrollY) / canvas.clientHeight;
        // 普通に前回の値と比べて速度を取得している模様
        const z = x - this.inputTouches[0].input.x
        const w = y - this.inputTouches[0].input.y
        this.inputTouches[0].input.set(x, y, z, w)
      }
    });
    canvas.addEventListener("mouseup", (event: MouseEvent) => {
      if (event.button === 0) {
        this.inputTouches.pop();
      }
    });

    canvas.addEventListener("touchstart", (event: TouchEvent) => {
      for (const touch of event.changedTouches) {
        const x = (touch.clientX / canvas.clientWidth) * this.resolution.x;
        const y = 1.0 - (touch.clientY + window.scrollY) / canvas.clientHeight;
        this.inputTouches.push({
          id: touch.identifier,
          input: new Vector4(x, y, 0, 0)
        });
      }
    });

    canvas.addEventListener("touchmove", (event: TouchEvent) => {
      event.preventDefault();
      for (const touch of event.changedTouches) {
        const registeredTouch = this.inputTouches.find(value => {
          return value.id === touch.identifier;
        });
        if (registeredTouch !== undefined) {
          const x = (touch.clientX / canvas.clientWidth) * this.resolution.x;
          const y = 1.0 - (touch.clientY + window.scrollY) / canvas.clientHeight;
          registeredTouch.input
            .setZ(x - registeredTouch.input.x)
            .setW(y - registeredTouch.input.y);
          registeredTouch.input.setX(x).setY(y);
        }
      }
    });

    canvas.addEventListener("touchend", (event: TouchEvent) => {
      for (const touch of event.changedTouches) {
        const registeredTouch = this.inputTouches.find(value => {
          return value.id === touch.identifier;
        });
        if (registeredTouch !== undefined) {
          this.inputTouches = this.inputTouches.filter(value => {
            return value.id !== registeredTouch.id;
          });
        }
      }
    });

    canvas.addEventListener("touchcancel", (event: TouchEvent) => {
      for (let i = 0; i < this.inputTouches.length; ++i) {
        for (let j = 0; j < event.touches.length; ++j) {
          if (this.inputTouches[i].id === event.touches.item(j)?.identifier) {
            break;
          } else if (j === event.touches.length - 1) {
            this.inputTouches.splice(i--, 1);
          }
        }
      }
    });
  }

}