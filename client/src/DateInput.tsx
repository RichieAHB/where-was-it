import * as React from "react";
import { useCallback, useState } from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  padding: 1em;
`;

type DateInputProps = {
  onDateSelected: (date: string) => void;
};

const DateInput = ({ onDateSelected }: DateInputProps) => {
  const [date, setDate] = useState("");
  const onSubmit = useCallback(
    (e) => {
      e.preventDefault();
      onDateSelected(date);
    },
    [date]
  );
  return (
    <Wrapper>
      <p>
        Select a date in the past (perhaps the day you were born?) to visualize
        where the earth was in the Solar System relative to where we are now:
      </p>
      <form onSubmit={onSubmit}>
        <label>
          Select date:{" "}
          <input
            value={date}
            onChange={(e) => setDate(e.target.value)}
            type="date"
          />
          {date && <button>Where was it?</button>}
        </label>
      </form>
    </Wrapper>
  );
};

export { DateInput };
