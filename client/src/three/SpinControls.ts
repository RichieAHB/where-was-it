import { MathUtils, Camera } from "three";

class SpinControls {
  private mouseDown: boolean = false;

  constructor(private camera: Camera) {
    this.connect();
    this.camera.rotation.order = "YXZ";
  }

  connect() {
    window.addEventListener("mousedown", (e) => {
      this.mouseDown = true;
    });

    window.addEventListener("mouseup", () => {
      this.mouseDown = false;
    });

    window.addEventListener("mousemove", (event) => {
      if (!this.mouseDown) return;
      this.camera.rotation.x = Math.max(
        Math.min(
          this.camera.rotation.x + MathUtils.degToRad(event.movementY * 0.25),
          Math.PI / 2
        ),
        -(Math.PI / 2)
      );
      this.camera.rotation.y += MathUtils.degToRad(event.movementX * 0.25);
      this.camera.updateMatrix();
    });
  }

  update() {}

  disconnect() {}
}

export { SpinControls };
