import React from 'react';
import { render } from '@testing-library/react';

import CoreUi from './core-ui';

describe(' CoreUi', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CoreUi />);
    expect(baseElement).toBeTruthy();
  });
});
