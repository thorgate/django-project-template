import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';

import Counter from './Counter';

describe('Counter', () => {
    it('should have an initial count of zero', () => {
        render(<Counter />);

        const element = screen.getByText(/count: 0/i);
        expect(element).toBeInTheDocument();
    });

    it('should increment the count when the increment button is pressed', () => {
        render(<Counter />);

        const button = screen.getByText(/increment/i);

        fireEvent.click(button);
        expect(screen.getByText(/count: 1/i)).toBeInTheDocument();

        fireEvent.click(button);
        expect(screen.getByText(/count: 2/i)).toBeInTheDocument();
    });

    it('should accept an initial count', () => {
        render(<Counter initialCount={5} />);

        const element = screen.getByText(/count: 5/i);
        expect(element).toBeInTheDocument();
    });
});
