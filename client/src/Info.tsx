import * as React from "react";
import { useState, useCallback } from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  background: rgba(0, 0, 0, 0.75);
  color: white;
`;

const Content = styled.div<{ isOpen: boolean }>`
  display: ${({ isOpen }) => (isOpen ? "block" : "none")};
  padding: 1em;
`;

const Toggle = styled.button<{ isOpen: boolean }>`
  appearance: none;
  background: rgba(0, 0, 0, 0.75);
  border: none;
  bottom: 100%;
  color: #ccc;
  cursor: pointer;
  font-size: 1.5em;
  padding: 0.5em;
  position: absolute;
  right: 0;

  :before {
    content: "+";
    display: block;
    line-height: 1;
    transform-origin: 50% 50%;
    transform: ${({ isOpen }) => (isOpen ? "rotate(45deg)" : "none")};
  }

  :focus,
  :hover {
    outline: none;
    color: white;
  }
`;

const Info = ({ children, ref, ...rest }: JSX.IntrinsicElements["div"]) => {
  const [isOpen, setIsOpen] = useState(true);
  const toggle = useCallback(() => setIsOpen(!isOpen), [isOpen]);
  return (
    <Wrapper {...rest}>
      <Toggle type="button" onClick={toggle} isOpen={isOpen} />
      <Content style={{ display: isOpen ? "block" : "none" }} isOpen={isOpen}>
        {children}
      </Content>
    </Wrapper>
  );
};

export { Info };
