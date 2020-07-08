import * as React from "react";
import { useEffect, useRef } from "react";
import { renderIntoCanvas } from "./three/renderIntoCanvas";
import styled from "styled-components";

type ViewerProps = {
  date: string;
};

const Canvas = styled.canvas`
  height: 100%;
  width: 100%;
`;

const Viewer = ({ date }: ViewerProps) => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => (ref.current ? renderIntoCanvas(ref.current) : undefined), [
    date,
  ]);

  return <Canvas ref={ref} />;
};

export { Viewer };
