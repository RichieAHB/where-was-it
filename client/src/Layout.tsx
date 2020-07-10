import * as React from "react";
import styled from "styled-components";
import { useEffect, useState } from "react";
import { deep, strong } from "./colors";

const getWindowSize = () => ({
  height: window.innerHeight,
  width: window.innerWidth,
});

const useWindowSize = () => {
  const [size, setSize] = useState(getWindowSize());

  useEffect(() => {
    const handler = () => setSize(getWindowSize());
    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("resize", handler);
    };
  });
  return size;
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const Bookend = styled.header`
  background-color: ${deep.toString()};
  color: white;
  flex-grow: 0;
  padding: 1em;

  a {
    color: white;
  }
`;

const Title = styled.h1`
  color: ${strong.toString()};
  font-size: 3rem;
  margin: 0 0 0.25em;
`;

const Subtitle = styled.h2`
  font-size: 16px;
  font-weight: 400;
  margin: 0;
`;

const Main = styled.main`
  border-color: #2b2a4d;
  border-style: solid;
  border-width: 1px 0;
  flex: 1;
`;

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  const { height } = useWindowSize();
  return (
    <Container style={{ height }}>
      <Bookend>
        <Title>PastFinder</Title>
        <Subtitle>
          A visualisation of where the earth was in the solar system on a given
          date.
        </Subtitle>
      </Bookend>
      <Main>{children}</Main>
      <Bookend>
        Made by <a href="https://twitter.com/RichieAHB">@richieahb</a>
      </Bookend>
    </Container>
  );
};

export { Layout };
