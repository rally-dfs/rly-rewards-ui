import React from 'react';

import ButtonStyles from '../styles/button.module.css';

type StyledLinkProps = {
  href: string;
  text: string;
};

const StyledLink = ({ text, ...linkProps }: StyledLinkProps) => {
  return (
    <a className={ButtonStyles.rly_link_button} {...linkProps}>
      {text}
    </a>
  );
};

export default StyledLink;
