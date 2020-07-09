import {
  AmbientLight,
  ArrowHelper,
  BackSide,
  BufferGeometry,
  Camera,
  Color,
  DirectionalLight,
  Geometry,
  HemisphereLight,
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
} from "three";
import { DeviceOrientationControls } from "three/examples/jsm/controls/DeviceOrientationControls";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { FetchBodiesResponse, FetchEarthResponse } from "../servies/backend";

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

const renderIntoCanvas = (
  canvas: HTMLCanvasElement,
  bodies: FetchBodiesResponse,
  { earth, distance_miles }: FetchEarthResponse,
  hasOrientationPermission: boolean
) => {
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
    skyTopColor: { value: new Color(0x6764a8) },
    skyBottomColor: { value: new Color(0x565397) },
    groundTopColor: { value: new Color(0x2b2a4d) },
    groundBottomColor: { value: new Color(0x161427) },
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

  let animationFrame: number | null = null;

  function animate() {
    animationFrame = requestAnimationFrame(animate);
    controls.update();
    composer.render();
  }

  animate();

  const line = document.createElement("div");
  document.body.appendChild(line);

  window.addEventListener("resize", onResize, false);

  const moon = createBody(bodies.moon.az, bodies.moon.alt);
  scene.add(moon);
  const sun = createBody(bodies.sun.az, bodies.sun.alt, true, 0xffff00, 2);
  scene.add(sun);
  const earthThen = createBody(earth.az, earth.alt, false, 0x88aaff, 1);
  scene.add(earthThen);
  scene.add(bodyLine(moon));
  scene.add(bodyLine(earthThen));
  scene.add(bodyLine(sun));

  const northArrow = new ArrowHelper(
    new Vector3(0, 0, -1),
    new Vector3(0, 0, 0),
    2000,
    0xd80480,
    0,
    0
  );

  scene.add(northArrow);

  const directionalLight = new DirectionalLight(0xffffff, 1);
  directionalLight.position.copy(sun.position);
  scene.add(directionalLight);

  return () => {
    animationFrame !== null && cancelAnimationFrame(animationFrame);
    window.removeEventListener("resize", onResize, false);
    controls.disconnect();
  };
};
export { renderIntoCanvas };
