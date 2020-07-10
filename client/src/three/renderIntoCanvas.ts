import {
  AmbientLight,
  ArrowHelper,
  BackSide,
  BufferGeometry,
  Camera,
  Color,
  DirectionalLight,
  Geometry,
  Line,
  LineBasicMaterial,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  PerspectiveCamera,
  Scene,
  ShaderMaterial,
  SphereBufferGeometry,
  SphereGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
  Raycaster,
  Frustum,
  Matrix4,
} from "three";
import { DeviceOrientationControls } from "three/examples/jsm/controls/DeviceOrientationControls";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { FetchBodiesResponse, FetchEarthResponse } from "../servies/backend";
import * as Colors from "../colors";

const createBody = (
  az: number,
  alt: number,
  basic = false,
  color = 0xffffff,
  size = 1
): Mesh<Geometry, MeshBasicMaterial | MeshLambertMaterial> => {
  const geometry = new SphereGeometry(size, 100, 100);
  const material = basic
    ? new MeshBasicMaterial({ color })
    : new MeshLambertMaterial({ color });
  const body = new Mesh(geometry, material);
  body.position.setFromSphericalCoords(100, Math.PI / 2 - alt, Math.PI - az);
  return body;
};
const bodyLine = (
  body: Mesh<Geometry, MeshBasicMaterial | MeshLambertMaterial>
) => {
  const material = new LineBasicMaterial({
    color: body.material.color,
  });
  const geometry = new BufferGeometry().setFromPoints([
    new Vector3(0, 0, 0),
    body.position,
  ]);
  return new Line(geometry, material);
};

class DeviceHeadingControls extends DeviceOrientationControls {
  private readonly onDeviceOrientation: (e: DeviceOrientationEvent) => void;

  constructor(camera: Camera) {
    super(camera);
    this.onDeviceOrientation = (e: DeviceOrientationEvent) => {
      const webkitCompassAccuracy = +(e as any).webkitCompassAccuracy;
      if (
        this.alphaOffset === 0 &&
        !e.absolute &&
        webkitCompassAccuracy > 0 &&
        webkitCompassAccuracy < 50
      ) {
        console.log("here", webkitCompassAccuracy);
        this.alphaOffset = MathUtils.degToRad(
          (720 - (e.alpha + (e as any).webkitCompassHeading)) % 360
        );
      }
    };

    window.addEventListener(
      "deviceorientation",
      this.onDeviceOrientation,
      false
    );

    const prevDisconnect = this.disconnect.bind(this);
    this.disconnect = () => {
      prevDisconnect();
      window.addEventListener(
        "deviceorientation",
        this.onDeviceOrientation,
        false
      );
    };
  }
}

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

const getControls = (hasOrientationPermission: boolean, camera: Camera) =>
  hasOrientationPermission
    ? new DeviceHeadingControls(camera)
    : new SpinControls(camera);

const renderIntoDiv = (
  div: HTMLDivElement,
  bodies: FetchBodiesResponse,
  { earth }: FetchEarthResponse,
  hasOrientationPermission: boolean
) => {
  const canvas = document.createElement("canvas");
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  div.appendChild(canvas);

  const direction = document.createElement("div");
  direction.innerText = "⇧";
  direction.style.position = "absolute";
  direction.style.left = "50%";
  direction.style.top = "20px";
  direction.style.marginLeft = "-10px";
  direction.style.color = Colors.strong.toString();
  direction.style.textShadow = "-2px -2px 4px rgba(0, 0, 0, 0.3)";
  direction.style.fontSize = "24px";
  div.appendChild(direction);

  const renderer = new WebGLRenderer({ canvas });

  const scene = new Scene();
  scene.background = new Color().setHSL(0.6, 0, 1);

  const light = new AmbientLight(0x707070);
  scene.add(light);

  const camera = new PerspectiveCamera(
    45,
    canvas.offsetWidth / canvas.offsetHeight,
    1,
    5000
  );

  const renderPass = new RenderPass(scene, camera);
  const bloomPass = new UnrealBloomPass(
    new Vector2(canvas.offsetWidth, canvas.offsetHeight),
    1.5,
    0.4,
    0.85
  );

  bloomPass.strength = 0.5;
  bloomPass.radius = 0.1;
  bloomPass.threshold = 0.7;

  const onResize = () => {
    canvas.removeAttribute("width");
    canvas.removeAttribute("height");
    const { offsetWidth, offsetHeight } = canvas;
    camera.aspect = offsetWidth / offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(offsetWidth, offsetHeight, false);
    composer.setSize(offsetWidth, offsetHeight);
  };

  const composer = new EffectComposer(renderer);
  composer.addPass(renderPass);
  composer.addPass(bloomPass);

  onResize();

  camera.position.y = 2;
  const controls = getControls(hasOrientationPermission, camera);

  // SKYDOME

  const vertexShader = document.getElementById("vertexShader")?.textContent!;
  const fragmentShader = document.getElementById("fragmentShader")
    ?.textContent!;

  const skyUniforms = {
    skyTopColor: { value: new Color(Colors.deep.lighten(4).toNumber()) },
    skyBottomColor: { value: new Color(Colors.deep.lighten(2).toNumber()) },
    groundTopColor: { value: new Color(Colors.deep.toNumber()) },
    groundBottomColor: {
      value: new Color(Colors.deep.lighten(0.5).toNumber()),
    },
    offset: { value: 0 },
    exponent: { value: 1 },
  };

  const domeGeo = new SphereBufferGeometry(4000, 32, 15);
  const skyMat = new ShaderMaterial({
    uniforms: skyUniforms,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    side: BackSide,
  });

  const sky = new Mesh(domeGeo, skyMat);
  scene.add(sky);

  const line = document.createElement("div");
  document.body.appendChild(line);

  window.addEventListener("resize", onResize, false);

  const moon = createBody(bodies.moon.az, bodies.moon.alt);
  scene.add(moon);
  const sun = createBody(bodies.sun.az, bodies.sun.alt, true, 0xffff00, 2);
  scene.add(sun);
  const earthThen = createBody(
    earth.az,
    earth.alt,
    false,
    Colors.earth.toNumber(),
    1
  );
  scene.add(earthThen);
  scene.add(bodyLine(moon));
  scene.add(bodyLine(earthThen));
  scene.add(bodyLine(sun));

  const northArrow = new ArrowHelper(
    new Vector3(0, 0, -1),
    new Vector3(0, 0, 0),
    2000,
    Colors.strong.toNumber(),
    0,
    0
  );

  const frustum = new Frustum();
  const cameraViewProjectionMatrix = new Matrix4();

  scene.add(northArrow);

  const directionalLight = new DirectionalLight(0xffffff, 1);
  directionalLight.position.copy(sun.position);
  scene.add(directionalLight);

  let animationFrame: number | null = null;

  function animate() {
    animationFrame = requestAnimationFrame(animate);
    camera.updateMatrixWorld();
    camera.matrixWorldInverse.getInverse(camera.matrixWorld);
    cameraViewProjectionMatrix.multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse
    );
    frustum.setFromProjectionMatrix(cameraViewProjectionMatrix);
    if (frustum.intersectsObject(earthThen)) {
      direction.style.visibility = `hidden`;
    } else {
      const earthPos = earthThen.position.clone();
      camera.worldToLocal(earthPos);
      const earthDir = new Vector2(earthPos.x, earthPos.y).normalize();
      direction.style.transform = `rotate(${MathUtils.radToDeg(
        -earthDir.angle() + Math.PI / 2
      )}deg)`;
      direction.style.visibility = `visible`;
    }
    controls.update();
    composer.render();
  }

  animate();

  return () => {
    animationFrame !== null && cancelAnimationFrame(animationFrame);
    window.removeEventListener("resize", onResize, false);
    controls.disconnect();
  };
};
export { renderIntoDiv as renderIntoCanvas };
