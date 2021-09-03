import React from 'react';

interface HelloWorldProps {
    name: string;
}

const WelcomeTest = ({ name }: HelloWorldProps) => <p>Hello, {name}</p>;

export default WelcomeTest;
