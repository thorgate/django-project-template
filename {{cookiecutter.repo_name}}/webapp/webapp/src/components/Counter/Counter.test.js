import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import Counter from './Counter';

describe('Counter', () => {
    it('should have an initial count of zero', () => {
        const { getByText } = render(<Counter />);

        const element = getByText(/count: 0/i);

        expect(element).toBeInTheDocument();
    });

    it('should increment the count when the increment button is pressed', () => {
        const { getByText } = render(<Counter />);

        const button = getByText(/increment/i);

        fireEvent.click(button);
        expect(getByText(/count: 1/i)).toBeInTheDocument();

        fireEvent.click(button);
        expect(getByText(/count: 2/i)).toBeInTheDocument();
    });

    it('should accept an initial count', () => {
        const { getByText } = render(<Counter initialCount={5} />);

        const element = getByText(/count: 5/i);

        expect(element).toBeInTheDocument();
    });
});
