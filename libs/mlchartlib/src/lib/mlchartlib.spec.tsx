import React from 'react';
import { render } from '@testing-library/react';

import Mlchartlib from './mlchartlib';

describe(' Mlchartlib', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Mlchartlib />);
    expect(baseElement).toBeTruthy();
  });
});
