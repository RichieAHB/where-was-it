import * as React from "react";
import { render } from "react-dom";
import { DateInput } from "./DateInput";
import { useState } from "react";
import { Viewer } from "./Viewer";
import { Layout } from "./Layout";

const App = () => {
  const [error, setError] = useState("");
  const [date, setDate] = useState("");
  return (
    <Layout>
      {date ? (
        <Viewer date={date} />
      ) : (
        <>
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
          {error}
        </>
      )}
    </Layout>
  );
};

render(<App />, document.getElementById("react-root"));
