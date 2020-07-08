import * as React from "react";
import { render } from "react-dom";
import { DateInput } from "./DateInput";
import { useState } from "react";
import { Viewer } from "./Viewer";
import { Layout } from "./Layout";
import styled from "styled-components";

const hasOrientation = !!window.DeviceOrientationEvent.requestPermission;

const Wrapper = styled.div`
  padding: 1em;
`;

const App = () => {
  const [error, setError] = useState(
    hasOrientation
      ? ""
      : "Unsupported browser, please use a browser that emits device orientation events (i.e. a mobile browser)."
  );

  const [date, setDate] = useState("");
  return (
    <Layout>
      {date ? (
        <Viewer date={date} />
      ) : (
        <Wrapper>
          {hasOrientation && (
            <DateInput
              onDateSelected={(date) => {
                window.DeviceOrientationEvent.requestPermission().then(
                  (response) => {
                    if (response !== "granted") {
                      setError("Unable to display location without permission");
                    } else {
                      setDate(date);
                    }
                  }
                );
              }}
            />
          )}
          {error}
        </Wrapper>
      )}
    </Layout>
  );
};

render(<App />, document.getElementById("react-root"));
