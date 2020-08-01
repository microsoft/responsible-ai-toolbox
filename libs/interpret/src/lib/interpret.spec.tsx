import React from 'react';
import { render } from '@testing-library/react';

import Interpret from './interpret';

describe(' Interpret', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Interpret />);
    expect(baseElement).toBeTruthy();
  });
});
