import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { renderIntoDiv } from "./three/renderIntoDiv";
import styled from "styled-components";
import { fetchBodies, fetchEarth } from "./servies/backend";
import { Info } from "./Info";
import { Loader } from "./Loader";
import * as Colors from "./colors";

type ViewerProps = {
  date: string;
  hasOrientationPermission: boolean;
};

const Wrapper = styled.div`
  height: 100%;
  position: relative;
  user-select: none;
  width: 100%;
`;

const LoaderWrapper = styled.div<{ show: boolean }>`
  display: flex;
  justify-content: center;
  opacity: ${(props) => (props.show ? 1 : 0)};
  position: absolute;
  top: 50px;
  transition: opacity 0.4s ease-out;
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
      const cont = renderIntoDiv(current, hasOrientationPermission);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          Promise.all([
            fetchBodies(pos.coords.latitude, pos.coords.longitude),
            fetchEarth(pos.coords.latitude, pos.coords.longitude, date),
          ]).then(([bodies, earth]) => {
            cont(bodies, earth);
            setDistance(
              `${Math.round(earth.distance_miles).toLocaleString(
                "en-GB"
              )} miles`
            );
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
      <ThreeContainer ref={ref} />
      <LoaderWrapper show={loading}>
        <Loader style={{ marginTop: 70 }} />
      </LoaderWrapper>
      {!loading && (
        <InfoWrap>
          <p>
            Distance from earth position on {new Date(date).toLocaleString()} is{" "}
            {distance}. The <Color color={Colors.strong.toString()}>pink</Color>{" "}
            line is North and the sun and moon are shown at their current
            position to help calibrate.
          </p>
        </InfoWrap>
      )}
    </Wrapper>
  );
};

export { Viewer };
