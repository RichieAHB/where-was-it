import {
  Camera,
  Euler,
  EventDispatcher,
  MathUtils,
  Quaternion,
  Vector3,
} from "three";

const _zee = new Vector3(0, 0, 1);
const _euler = new Euler();
const _q0 = new Quaternion();
const _q1 = new Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)); // - PI/2 around the x-axis

const _changeEvent = { type: "change" };

// The angles alpha, beta and gamma form a set of intrinsic Tait-Bryan angles of type Z-X'-Y''

const setObjectQuaternion = (
  quaternion: Quaternion,
  alpha: number,
  beta: number,
  gamma: number,
  orient: number
) => {
  _euler.set(beta, alpha, -gamma, "YXZ"); // 'ZXY' for the device, but 'YXZ' for us

  quaternion.setFromEuler(_euler); // orient the device

  quaternion.multiply(_q1); // camera looks out the back of the device, not the top

  quaternion.multiply(_q0.setFromAxisAngle(_zee, -orient)); // adjust for screen orientation
};

const EPS = 0.000001;

interface DeviceOrientation {
  alpha: number | null;
  beta: number | null;
  gamma: number | null;
}

class DeviceOrientationControls extends EventDispatcher {
  private object: Camera;
  private enabled: boolean;
  private deviceOrientation: DeviceOrientation;
  private screenOrientation: number;
  protected alphaOffset: number;
  private lastQuaternion: Quaternion;

  constructor(object: Camera) {
    super();

    if (window.isSecureContext === false) {
      console.error(
        "THREE.DeviceOrientationControls: DeviceOrientationEvent is only available in secure contexts (https)"
      );
    }

    this.lastQuaternion = new Quaternion();

    this.object = object;
    this.object.rotation.reorder("YXZ");

    this.enabled = true;

    this.deviceOrientation = {
      alpha: 0,
      beta: 0,
      gamma: 0,
    };
    this.screenOrientation = 0;

    this.alphaOffset = 0; // radians

    this.connect();
  }

  connect() {
    this.onScreenOrientationChangeEvent(); // run once on load

    // iOS 13+

    if (
      window.DeviceOrientationEvent !== undefined &&
      // @ts-ignore
      typeof window.DeviceOrientationEvent.requestPermission === "function"
    ) {
      // @ts-ignore
      window.DeviceOrientationEvent.requestPermission()
        .then((response: string) => {
          if (response == "granted") {
            window.addEventListener(
              "orientationchange",
              this.onScreenOrientationChangeEvent.bind(this)
            );
            window.addEventListener(
              "deviceorientation",
              this.onDeviceOrientationChangeEvent.bind(this)
            );
          }
        })
        .catch(function (error: Error) {
          console.error(
            "THREE.DeviceOrientationControls: Unable to use DeviceOrientation API:",
            error
          );
        });
    } else {
      window.addEventListener(
        "deviceorientation",
        this.onDeviceOrientationChangeEvent.bind(this)
      );
      window.addEventListener(
        "orientationchange",
        this.onScreenOrientationChangeEvent.bind(this)
      );
    }

    this.enabled = true;
  }

  disconnect() {
    window.removeEventListener(
      "orientationchange",
      this.onScreenOrientationChangeEvent.bind(this)
    );
    window.removeEventListener(
      "deviceorientation",
      this.onDeviceOrientationChangeEvent.bind(this)
    );

    this.enabled = false;
  }

  update() {
    if (this.enabled === false) return;

    const device = this.deviceOrientation;

    if (device) {
      const alpha = device.alpha
        ? MathUtils.degToRad(device.alpha) + this.alphaOffset
        : 0; // Z

      const beta = device.beta ? MathUtils.degToRad(device.beta) : 0; // X'

      const gamma = device.gamma ? MathUtils.degToRad(device.gamma) : 0; // Y''

      const orient = this.screenOrientation
        ? MathUtils.degToRad(this.screenOrientation)
        : 0; // O

      setObjectQuaternion(this.object.quaternion, alpha, beta, gamma, orient);

      if (8 * (1 - this.lastQuaternion.dot(this.object.quaternion)) > EPS) {
        this.lastQuaternion.copy(this.object.quaternion);
        this.dispatchEvent(_changeEvent);
      }
    }
  }

  dispose() {
    this.disconnect();
  }

  private onDeviceOrientationChangeEvent(event: DeviceOrientationEvent) {
    this.deviceOrientation = event;
  }

  private onScreenOrientationChangeEvent() {
    this.screenOrientation = window.orientation || 0;
  }
}

export { DeviceOrientationControls };
