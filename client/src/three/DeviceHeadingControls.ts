import { Camera, MathUtils } from "three";
import { DeviceOrientationControls } from "./DeviceOrientationControls";

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

export { DeviceHeadingControls };
