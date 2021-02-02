import React from 'react';
import { render, screen } from '../../test-utils';

import { NavigationBar } from './NavigationBar';

describe('NavigationBar', () => {
    it('should have an initial count of zero', () => {
        render(<NavigationBar />);

        const element = screen.getByText(/Home/i);
        expect(element).toBeInTheDocument();
    });
});
