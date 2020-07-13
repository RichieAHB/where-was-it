import {
  Camera,
  Geometry,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  Renderer,
  SphereGeometry,
  Vector3,
} from "three";

class Body {
  private labelPosition = new Vector3();
  private labelWorld = new Vector3();

  static create(
    name: string,
    az: number,
    alt: number,
    { basic = false, color = 0xffffff, size = 1 } = {}
  ): Body {
    const geometry = new SphereGeometry(size, 100, 100);
    const material = basic
      ? new MeshBasicMaterial({ color })
      : new MeshLambertMaterial({ color });
    const body = new Mesh(geometry, material);
    body.position.setFromSphericalCoords(100, Math.PI / 2 - alt, Math.PI - az);
    const domElement = document.createElement("div");
    domElement.style.position = "absolute";
    domElement.style.textShadow = "1px 1px 3px rgba(0, 0, 0, 0.75)";
    domElement.style.color = "white";
    domElement.style.fontSize = "12px";
    domElement.innerText = name;
    return new Body(body, domElement);
  }

  constructor(
    public readonly mesh: Mesh<
      Geometry,
      MeshBasicMaterial | MeshLambertMaterial
    >,
    private domElement: HTMLElement
  ) {}

  appendLabel(element: HTMLElement) {
    element.appendChild(this.domElement);
  }

  moveLabel(renderer: Renderer, camera: Camera) {
    this.labelWorld.copy(this.mesh.position);
    if (camera.worldToLocal(this.labelWorld).z >= 0) {
      this.domElement.style.visibility = "hidden";
    } else {
      this.labelPosition.copy(this.mesh.position).project(camera);
      this.domElement.style.visibility = "visible";
      this.domElement.style.left = `${
        ((this.labelPosition.x + 1) / 2) * renderer.domElement.width
      }px`;
      this.domElement.style.bottom = `${
        ((this.labelPosition.y + 1) / 2) * renderer.domElement.height
      }px`;
    }
  }
}

export { Body };
