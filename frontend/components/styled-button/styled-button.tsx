//src/components/button/index.tsx
import styled from "styled-components";

interface ButtonProps {
  active?: boolean;
}

const StyledButton = styled.button<ButtonProps>`
  padding-bottom: 10px;
  padding-left: 20px;
  padding-right: 20px;
  padding-top: 15px;
  background-color: ${props => (props.active ? "red" : "green")};
  &:active {
    outline: 0;
    color: #fff;
    top: 1px;
  }
`;
export const Button = StyledButton;