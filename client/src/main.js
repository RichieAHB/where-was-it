import {
  WebGLRenderer,
  PerspectiveCamera,
  SphereGeometry,
  MeshLambertMaterial,
  Mesh,
  Scene,
  PlaneBufferGeometry,
  MeshBasicMaterial,
  DirectionalLight,
  HemisphereLight,
  SphereBufferGeometry,
  ArrowHelper,
  ShaderMaterial,
  BackSide,
  Color,
  Fog,
  MathUtils,
  AxesHelper, Vector3, LineBasicMaterial, BufferGeometry, Line
} from 'three/src/Three';
import {DeviceOrientationControls} from 'three/examples/jsm/controls/DeviceOrientationControls';

class WindowRenderer extends WebGLRenderer {
  constructor() {
    super();
    this.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.domElement);
  }
}

class WindowCamera extends PerspectiveCamera {
  constructor() {
    super(45, window.innerWidth / window.innerHeight, 1, 5000);
  }
}

const createBody = (az, alt, basic = false, color = 0xffffff) => {
  const geometry = new SphereGeometry(1, 100, 100);
  const material = basic ? new MeshBasicMaterial({color}) : new MeshLambertMaterial({color});
  const body = new Mesh(geometry, material);
  body.position.setFromSphericalCoords(100, Math.PI / 2 - alt, Math.PI - az);
  return body;
};

const bodyLine = (body) => {
  const material = new LineBasicMaterial({
    color: body.material.color
  });
  const geometry = new BufferGeometry().setFromPoints([
    new Vector3(0, 0, 0),
    body.position
  ]);
  return new Line(geometry, material);
};

function init() {
  const renderer = new WindowRenderer();

  const scene = new Scene();
  scene.background = new Color().setHSL(0.6, 0, 1);
  scene.fog = new Fog(scene.background, 1, 5000);

  const camera = new WindowCamera();
  camera.position.y = 2;
  const controls = new DeviceOrientationControls(camera);

  const hemiLight = new HemisphereLight(0xffffff, 0xffffff, 0.6);
  hemiLight.color.setHSL(0.6, 1, 0.6);
  hemiLight.groundColor.setHSL(0.095, 1, 0.75);
  hemiLight.position.set(0, 50, 0);
  scene.add(hemiLight);

// SKYDOME

  const vertexShader = document.getElementById('vertexShader').textContent;
  const fragmentShader = document.getElementById('fragmentShader').textContent;
  const skyUniforms = {
    "skyTopColor": {value: new Color(0x0077ff)},
    "skyBottomColor": {value: new Color(0xffffff)},
    "groundTopColor": {value: new Color(0x004488)},
    "groundBottomColor": {value: new Color(0x001122)},
    "offset": {value: 33},
    "exponent": {value: 0.6}
  };
  skyUniforms["skyTopColor"].value.copy(hemiLight.color);

  scene.fog.color.copy(skyUniforms["skyBottomColor"].value);

  const domeGeo = new SphereBufferGeometry(4000, 32, 15);
  const skyMat = new ShaderMaterial({
    uniforms: skyUniforms,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    side: BackSide
  });

  const sky = new Mesh(domeGeo, skyMat);
  scene.add(sky);

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }

  animate();

  const line = document.createElement('div');
  document.body.appendChild(line);

  const log = (...msgs) => {
    line.innerText = msgs.join(" ");
  };


  window.addEventListener('deviceorientation', e => {
    log(Math.round(e.alpha), Math.round(MathUtils.radToDeg(controls.alphaOffset)), Math.round(e.webkitCompassHeading));
    if (controls.alphaOffset === 0 && e.absolute !== true && +e.webkitCompassAccuracy > 0 && +e.webkitCompassAccuracy < 50) {
      controls.alphaOffset = MathUtils.degToRad((720 - (e.alpha + e.webkitCompassHeading)) % 360);
    }
    // log(Math.round((720 - (e.alpha + e.webkitCompassHeading)) % 360), Math.round(e.alpha), Math.round(e.webkitCompassHeading), Math.round(controls.alphaOffset));
  }, false);

  navigator.geolocation.getCurrentPosition((pos) => {
    Promise.all([
      fetch(`${process.env.BACKEND_HOST}/get_bodies?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`).then(res => res.json()),
      fetch(`${process.env.BACKEND_HOST}/get_earth_then?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&when=1987-03-08`).then(res => res.json())
    ])
        .then(([bodies, {earth, distance_miles}]) => {

          const moon = createBody(bodies.moon.az, bodies.moon.alt);
          scene.add(moon);
          const sun = createBody(bodies.sun.az, bodies.sun.alt, true, 0xffff00);
          scene.add(sun);
          const earthThen = createBody(earth.az, earth.alt, true, 0xff0000);
          scene.add(earthThen);
          scene.add(bodyLine(moon));
          scene.add(bodyLine(earthThen));
          scene.add(bodyLine(sun));

          document.body.prepend(document.createTextNode(`${Math.round(distance_miles).toLocaleString()} miles`));

          const directionalLight = new DirectionalLight(0xffffff, 1);
          directionalLight.position.copy(sun.position);
          scene.add(directionalLight);
        }).catch((e) => {
      alert(`Couldn't connect to ${process.env.BACKEND_HOST} ${e}`);
    });
  }, e => alert(e.message), {enableHighAccuracy: true});
};

document.getElementById('init').addEventListener('click', () => {
  document.getElementById('init').remove();
  init();
});
