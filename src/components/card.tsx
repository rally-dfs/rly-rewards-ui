import React from 'react';
import styles from '../styles/card.module.css';

type Props = {
  children: React.ReactNode;
  style?: React.CSSProperties;
  variant?: 'regular' | 'small';
};
const Card = ({ children, style, variant }: Props) => {
  let styleClassNames = styles.card;
  if (variant === 'small') {
    styleClassNames += ' ' + styles.card_small;
  }
  return (
    <div style={style} className={styleClassNames}>
      {children}
    </div>
  );
};

export default Card;
