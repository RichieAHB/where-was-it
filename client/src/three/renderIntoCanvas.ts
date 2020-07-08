import {
  BackSide,
  BufferGeometry,
  Color,
  DirectionalLight,
  Fog,
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
  Vector3,
  WebGLRenderer,
} from "three";
import { DeviceOrientationControls } from "three/examples/jsm/controls/DeviceOrientationControls";
import {
  fetchBodies,
  FetchBodiesResponse,
  fetchEarth,
  FetchEarthResponse,
} from "../servies/backend";

const createBody = (
  az: number,
  alt: number,
  basic = false,
  color = 0xffffff
): Mesh<Geometry, MeshBasicMaterial | MeshLambertMaterial> => {
  const geometry = new SphereGeometry(1, 100, 100);
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
const renderIntoCanvas = (
  canvas: HTMLCanvasElement,
  bodies: FetchBodiesResponse,
  { earth, distance_miles }: FetchEarthResponse
) => {
  const renderer = new WebGLRenderer({ canvas });

  const scene = new Scene();
  scene.background = new Color().setHSL(0.6, 0, 1);
  scene.fog = new Fog(scene.background, 1, 5000);

  const camera = new PerspectiveCamera(
    45,
    canvas.offsetWidth / canvas.offsetHeight,
    1,
    5000
  );

  const onResize = () => {
    canvas.removeAttribute("width");
    canvas.removeAttribute("height");
    camera.aspect = canvas.offsetWidth / canvas.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight, false);
  };

  onResize();

  camera.position.y = 2;
  const controls = new DeviceOrientationControls(camera);

  const hemiLight = new HemisphereLight(0xffffff, 0xffffff, 0.6);
  hemiLight.color.setHSL(0.6, 1, 0.6);
  hemiLight.groundColor.setHSL(0.095, 1, 0.75);
  hemiLight.position.set(0, 50, 0);
  scene.add(hemiLight);

  // SKYDOME

  const vertexShader = document.getElementById("vertexShader")?.textContent!;
  const fragmentShader = document.getElementById("fragmentShader")
    ?.textContent!;
  const skyUniforms = {
    skyTopColor: { value: new Color(0x0077ff) },
    skyBottomColor: { value: new Color(0xffffff) },
    groundTopColor: { value: new Color(0x004488) },
    groundBottomColor: { value: new Color(0x001122) },
    offset: { value: 33 },
    exponent: { value: 0.6 },
  };
  skyUniforms["skyTopColor"].value.copy(hemiLight.color);

  scene.fog.color.copy(skyUniforms["skyBottomColor"].value);

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
    renderer.render(scene, camera);
  }

  animate();

  const line = document.createElement("div");
  document.body.appendChild(line);

  window.addEventListener("resize", onResize, false);

  const onDeviceOrientation = (e: DeviceOrientationEvent) => {
    const webkitCompassAccuracy = +(e as any).webkitCompassAccuracy;
    if (
      controls.alphaOffset === 0 &&
      !e.absolute &&
      webkitCompassAccuracy > 0 &&
      webkitCompassAccuracy < 50
    ) {
      controls.alphaOffset = MathUtils.degToRad(
        (720 - (e.alpha + (e as any).webkitCompassHeading)) % 360
      );
    }
  };

  window.addEventListener("deviceorientation", onDeviceOrientation, false);

  const moon = createBody(bodies.moon.az, bodies.moon.alt);
  scene.add(moon);
  const sun = createBody(bodies.sun.az, bodies.sun.alt, true, 0xffff00);
  scene.add(sun);
  const earthThen = createBody(earth.az, earth.alt, true, 0xff0000);
  scene.add(earthThen);
  scene.add(bodyLine(moon));
  scene.add(bodyLine(earthThen));
  scene.add(bodyLine(sun));

  const directionalLight = new DirectionalLight(0xffffff, 1);
  directionalLight.position.copy(sun.position);
  scene.add(directionalLight);

  return () => {
    animationFrame !== null && cancelAnimationFrame(animationFrame);
    window.removeEventListener("deviceorientation", onDeviceOrientation);
    window.removeEventListener("resize", onResize, false);
  };
};
export { renderIntoCanvas };
