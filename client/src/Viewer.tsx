import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { renderIntoCanvas } from "./three/renderIntoCanvas";
import styled from "styled-components";
import { DirectionalLight } from "three";
import { fetchBodies, fetchEarth } from "./servies/backend";

type ViewerProps = {
  date: string;
};

const Wrapper = styled.div`
  height: 100%;
  position: relative;
  width: 100%;
`;

const Canvas = styled.canvas`
  height: 100%;
  width: 100%;
`;

const Info = styled.div`
  background: rgba(0, 0, 0, 0.75);
  bottom: 0;
  color: white;
  left: 0;
  padding: 1em;
  position: absolute;
  right: 0;
`;

const Viewer = ({ date }: ViewerProps) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [distance, setDistance] = useState("");

  useEffect(() => {
    const { current } = ref;
    if (current) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          Promise.all([
            fetchBodies(pos.coords.latitude, pos.coords.longitude),
            fetchEarth(pos.coords.latitude, pos.coords.longitude, date),
          ]).then(([body, earth]) => {
            renderIntoCanvas(current, body, earth);
            setDistance(`${Math.round(earth.distance_miles)} miles`);
            setLoading(false);
          });
        },
        (e) => alert(e.message),
        { enableHighAccuracy: true }
      );
    }
  }, [date]);

  return (
    <Wrapper>
      {loading ? "Loading ..." : ""}
      <Wrapper style={{ visibility: loading ? "hidden" : "visible" }}>
        <Canvas ref={ref} />
        <Info>
          <p>Distance: {distance}</p>
          <p>
            Rotate your device to see the bodies. The white dot is the moon, the{" "}
            <span style={{ color: "yellow" }}>yellow</span> is the sun and the{" "}
            <span style={{ color: "red" }}>red</span> is the earth position at
            the date specified.
          </p>
        </Info>
      </Wrapper>
    </Wrapper>
  );
};

export { Viewer };
