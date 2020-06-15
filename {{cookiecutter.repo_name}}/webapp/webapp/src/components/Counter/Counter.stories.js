import React from 'react';
import Counter from './Counter';

export default { title: 'Counter' };

export const with0 = () => <Counter initialCount={0} />;

export const with1 = () => <Counter initialCount={1} />;
