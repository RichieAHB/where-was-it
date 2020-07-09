import * as React from "react";
import { render } from "react-dom";
import { DateInput } from "./DateInput";
import { useState } from "react";
import { Viewer } from "./Viewer";
import { Layout } from "./Layout";
import styled from "styled-components";

const Wrapper = styled.div`
  min-height: 100%;
  padding: 1em;
`;

const App = () => {
  const [date, setDate] = useState("");
  const [hasOrientationPermission, setHasOrientationPermission] = useState(
    false
  );
  return (
    <Layout>
      {date ? (
        <Viewer
          hasOrientationPermission={hasOrientationPermission}
          date={date}
        />
      ) : (
        <Wrapper>
          <DateInput
            onDateSelected={(date) => {
              (
                window.DeviceOrientationEvent.requestPermission ||
                (() => Promise.resolve(""))
              )().then((response) => {
                if (response !== "granted") {
                  setHasOrientationPermission(false);
                } else {
                  setHasOrientationPermission(true);
                }
                setDate(date);
              });
            }}
          />
        </Wrapper>
      )}
    </Layout>
  );
};

render(<App />, document.getElementById("react-root"));
