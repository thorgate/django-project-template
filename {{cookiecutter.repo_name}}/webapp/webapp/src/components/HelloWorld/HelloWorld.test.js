import React from 'react';
import { render, fireEvent, screen } from '../../test-utils';

import HelloWorld from './HelloWorld';

describe('HelloWorld', () => {
    it('should have an initial count of zero', () => {
        render(<HelloWorld />);

        const element = screen.getByText(/count: 0/i);
        expect(element).toBeInTheDocument();
    });

    it('should increment the count when the increment button is pressed', () => {
        render(<HelloWorld />);

        const button = screen.getByText(/increment/i);

        fireEvent.click(button);
        expect(screen.getByText(/count: 1/i)).toBeInTheDocument();

        fireEvent.click(button);
        expect(screen.getByText(/count: 2/i)).toBeInTheDocument();
    });
});
