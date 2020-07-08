import * as React from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 85vh;
  width: 100%;
`;

const Bookend = styled.header`
  flex-grow: 0;
  padding: 1em;
`;

const Title = styled.h1`
  font-size: 20px;
  font-weight: 400;
  margin: 0 0 0.25em;
`;

const Subtitle = styled.h2`
  font-size: 16px;
  font-weight: 400;
  margin: 0;
`;

const Main = styled.main`
  flex: 1;
`;

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  return (
    <Container>
      <Bookend>
        <Title>Where was it?</Title>
        <Subtitle>
          A visualisation of where the earth was in the solar system on a given
          date.
        </Subtitle>
      </Bookend>
      <Main>{children}</Main>
      <Bookend>Made by @richieahb</Bookend>
    </Container>
  );
};

export { Layout };
