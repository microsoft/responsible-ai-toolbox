import React from 'react';
import { render } from '@testing-library/react';

import Fairlearn from './fairlearn';

describe(' Fairlearn', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Fairlearn />);
    expect(baseElement).toBeTruthy();
  });
});
