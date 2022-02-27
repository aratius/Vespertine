import { Vector2, Vector4 } from "three";

export interface ITouchInput {
  id: string | number;
  input: Vector4;
}

/**
 * 外力（マウス・タッチ）のロジックを別モジュールに
 */
export class ExternalForceManager {

  public inputTouches: ITouchInput[] = []
  public aspect: number
  private _canvas?: HTMLCanvasElement

  constructor(canvas: HTMLCanvasElement, resolution: number) {
    this.aspect = resolution
	this._canvas = canvas

    canvas.addEventListener("mousedown", (event: MouseEvent) => {
      if (event.button === 0) {
		const input = this._getInput(new Vector2(event.clientX, event.clientY), new Vector4(0))

        this.inputTouches.push({
          id: "mouse",
          input: new Vector4(input.x, input.y, 0, 0)
        });
      }
    });
    canvas.addEventListener("mousemove", (event: MouseEvent) => {
      if (this.inputTouches.length > 0) {
		const input = this._getInput(new Vector2(event.clientX, event.clientY), this.inputTouches[0].input)
        this.inputTouches[0].input.set(input.x, input.y, input.z, input.w)
      }
    });
    canvas.addEventListener("mouseup", (event: MouseEvent) => {
      if (event.button === 0) {
        this.inputTouches.pop();
      }
    });

    canvas.addEventListener("touchstart", (event: TouchEvent) => {
      for (const touch of event.changedTouches) {
		const input = this._getInput(new Vector2(touch.clientX, touch.clientY), new Vector4(0))
        this.inputTouches.push({
          id: touch.identifier,
          input: new Vector4(input.x, input.y, 0, 0)
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
			const input = this._getInput(new Vector2(touch.clientX, touch.clientY), registeredTouch.input)
			registeredTouch.input.set(input.x, input.y, input.z, input.w)
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

  /**
   * input算出
   * @param pointerPos
   * @param lastInput
   * @returns {Vector4}
   */
  private  _getInput(pointerPos: Vector2, lastInput: Vector4): Vector4 {
	const x = (pointerPos.x / this._canvas!.clientWidth) * this.aspect;
	const y = 1.0 - (pointerPos.y + window.scrollY) / this._canvas!.clientHeight;
	// 普通に前回の値と比べて速度を取得している模様
	const z = x - lastInput.x
	const w = y - lastInput.y
	return new Vector4(x, y, z, w)
  }

}