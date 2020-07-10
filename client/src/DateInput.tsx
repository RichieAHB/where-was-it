import * as React from "react";
import { useCallback, useState } from "react";
import { Input } from "./Input";
import styled from "styled-components";
import { deep } from "./colors";

const FormWrapper = styled.div`
  justify-content: center;
  display: flex;
`;

const Form = styled.form`
  align-items: left;
  display: flex;
  flex: 1;
  flex-direction: column;
  margin-bottom: 1em;
  max-width: 320px;

  @media all and (max-width: 500px) {
    max-width: 100%;
  }
`;

const P = styled.p`
  line-height: 1.75;
  margin: 0;

  & + & {
    margin-top: 1em;
  }
`;

const Button = styled.button`
  appearance: none;
  background-color: ${deep.toString()};
  border: none;
  border-radius: 0.5em;
  color: white;
  cursor: pointer;
  font-family: "Megrim", cursive;
  font-size: 20px;
  font-weight: 600;
  margin-top: 1em;
  padding: 1em;

  &:hover,
  &:focus {
    color: #d80480;
  }

  &:disabled {
    color: white;
    cursor: default;
    opacity: 0.5;
  }
`;

const Info = styled.aside`
  background: #d80480;
  border-radius: 0.5em;
  color: white;
  margin: 1em 0;
  padding: 1em;

  &:before {
    content: "Note:";
    display: block;
    font-size: 1.25em;
    font-weight: 700;
    margin-bottom: 0.5em;
  }
`;

const canUseOrientation = window.DeviceOrientationEvent.requestPermission;

type DateInputProps = {
  onDateSelected: (date: string) => void;
};

function todayDate() {
  const d = new Date();
  const month = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  const year = d.getFullYear();

  return [year, month, day].join("-");
}

function todayTime() {
  const d = new Date();
  const hour = `${d.getHours()}`.padStart(2, "0");
  const min = `${d.getMinutes()}`.padStart(2, "0");

  return [hour, min].join(":");
}

const DateInput = ({ onDateSelected }: DateInputProps) => {
  const [date, setDate] = useState(todayDate);
  const [time, setTime] = useState(todayTime);
  const onSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const dateTime = new Date(`${date}T${time}`);
      const tzo = dateTime.getTimezoneOffset();
      const sign = tzo > 0 ? "-" : "+";
      const absTzo = Math.abs(tzo);
      const hour = `${absTzo / 60}`.padStart(2, "0");
      const min = `${Math.floor(absTzo % 60)}`.padStart(2, "0");
      onDateSelected(`${date}T${time}:00${sign}${hour}:${min}`);
    },
    [date, time]
  );
  return (
    <>
      <P>
        Select a date (perhaps the day you were born?) to visualize where the
        earth was (or will be) in the Solar System relative to where we are now:
      </P>
      <FormWrapper>
        <Form onSubmit={onSubmit}>
          <Input
            label="Select date:"
            type="date"
            value={date}
            onChange={setDate}
          />
          <Input
            label="Select time:"
            type="time"
            value={time}
            onChange={setTime}
          />
          <Button>Find it</Button>
        </Form>
      </FormWrapper>
      {!canUseOrientation && (
        <Info>
          <P>
            This site is best viewed on a mobile device with orientiation
            information. This will allow you to angle your phone to help you
            determine the exact location in the sky. You can still use the site
            on this device but it won't work as well.
          </P>
        </Info>
      )}
    </>
  );
};

export { DateInput };
