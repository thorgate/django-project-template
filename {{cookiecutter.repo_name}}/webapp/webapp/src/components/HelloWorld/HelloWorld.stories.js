import React from 'react';
import { HelloWorldBase } from './HelloWorld';

export default { title: 'HelloWorld' };

export const withExample = () => (
    <HelloWorldBase title="Story Book Example" onSetTitle={() => {}} />
);
