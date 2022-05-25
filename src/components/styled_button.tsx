import React from 'react';
import ButtonStyles from '../styles/button.module.css';

type StyledButtonProps = {
  text: string;
  onClick: () => void;
};

const StyledButton = (props: StyledButtonProps) => {
  return (
    <button className={ButtonStyles.rly_button} onClick={props.onClick}>
      {props.text}
    </button>
  );
};

export default StyledButton;
