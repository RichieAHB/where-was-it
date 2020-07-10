import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { renderIntoCanvas } from "./three/renderIntoCanvas";
import styled from "styled-components";
import { fetchBodies, fetchEarth } from "./servies/backend";
import { Info } from "./Info";

type ViewerProps = {
  date: string;
  hasOrientationPermission: boolean;
};

const Wrapper = styled.div`
  height: 100%;
  position: relative;
  width: 100%;
`;

const ThreeContainer = styled.div`
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
`;

const InfoWrap = styled(Info)`
  bottom: 0;
  left: 0;
  position: absolute;
  right: 0;
`;

const Color = styled.span`
  font-weight: 700;
  color: ${(props) => props.color};
`;

const Viewer = ({ date, hasOrientationPermission }: ViewerProps) => {
  const ref = useRef<HTMLDivElement>(null);
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
            renderIntoCanvas(current, body, earth, hasOrientationPermission);
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
        <ThreeContainer ref={ref} />
        <InfoWrap>
          <p>Distance from previous earth position: {distance}</p>
          <p>
            The <Color color="white">white</Color> dot is the moon in its
            current position, the <Color color="yellow">yellow</Color> is the
            sun in its current position and the{" "}
            <Color color="#88aaff">light blue</Color> is the earth position at
            the date specified. The <Color color="#d80480">pink</Color> line is
            North.
          </p>
        </InfoWrap>
      </Wrapper>
    </Wrapper>
  );
};

export { Viewer };
