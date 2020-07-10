import * as React from "react";
import styled from "styled-components";
import * as Colors from "./colors";

const Inner = styled.div`
  align-items: center;
  background-color: ${Colors.deep.toString()};
  box-shadow: 0 0 100px 0 ${Colors.strong.withAlpha(0.75).toString("rgba")};
  border-radius: 50%;
  color: white;
  display: flex;
  font-size: 14px;
  height: 80px;
  justify-content: center;
  position: relative;
  text-align: center;
  width: 80px;
`;

const OuterContainer = styled.div<{ radius: number; year: number }>`
  align-items: middle;
  animation: spin ${(props) => props.year}s linear infinite;
  display: flex;
  height: 0;
  left: 50%;
  justify-content: flex-end;
  position: absolute;
  top: 50%;
  transform-origin: 0 0;
  width: ${(props) => props.radius}px;

  @keyframes spin {
    from {
      transform: rotate(-90deg);
    }

    to {
      transform: rotate(270deg);
    }
  }
`;

const Outer = styled.div`
  background-color: ${Colors.strong.toString()};
  border-radius: 50%;
  height: 15px;
  width: 10px;
`;

type PlanetProps = {
  radius: number;
  year: number;
};

const Planet = ({ radius, year }: PlanetProps) => {
  return (
    <OuterContainer radius={radius} year={year}>
      <Outer />
    </OuterContainer>
  );
};

const Loader = ({ ref, ...props }: JSX.IntrinsicElements["div"]) => (
  <Inner {...props}>
    Fetching positions
    <Planet radius={90} year={1.5} />
    <Planet radius={110} year={2} />
    <Planet radius={130} year={2.5} />
  </Inner>
);

export { Loader };
