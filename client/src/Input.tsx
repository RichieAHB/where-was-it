import * as React from "react";
import styled from "styled-components";

const Container = styled.label`
  display: block;
  
  & + & {
    margin-top: 1rem;
  }
`;

const Label = styled.span`
  display: block;
  margin-bottom: 1em;
`;

const InputEl = styled.input`
  width: 100%;
`;

type InputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type: string;
};

const Input = ({ label, value, onChange, type }: InputProps) => {
  return (
    <Container>
      <Label>{label}</Label>
      <InputEl
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
      />
    </Container>
  );
};

export { Input };
