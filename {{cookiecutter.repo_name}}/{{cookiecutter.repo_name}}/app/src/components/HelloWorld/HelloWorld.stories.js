import React from 'react';
import { HelloWorld } from './HelloWorld';

export default { title: 'HelloWorld' };

export const withExample = () => (
    <HelloWorld title="Story Book Example" setTitle={() => {}} />
);
