import React from 'react';
import spin from './styles/spin.svg';
import bars from './styles/bars.svg';
import puff from './styles/puff.svg';
import dots from './styles/dots.svg';
import {IMAGES} from '../../config/variable';

export default function Loader({ small, type }) {
  let loaderType;

  const size = small ? 'small' : '';

  if (type === 'spin') {
    loaderType = IMAGES.spin;
  } else if (type === 'bars') {
    loaderType = IMAGES.bars;
  } else if (type === 'puff') {
    loaderType = IMAGES.puff;
  } else if (type === 'dots') {
    loaderType = IMAGES.dots;
  } else {
    loaderType = IMAGES.spin;
  }

  return (
    <div className={`loader ${size}`} style={{ backgroundImage: `url(${loaderType})` }}>
      Loading...
    </div>
  );
}
