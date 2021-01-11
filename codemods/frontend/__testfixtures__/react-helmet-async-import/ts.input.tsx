import React from 'react';
import { Helmet } from 'react-helmet';

interface HelloWorldProps {
    name: string;
}

const HelloWorld = ({ name }: HelloWorldProps) => (
    <>
        <Helmet>
            <title>Hello World</title>
            <link rel="canonical" href="https://www.thorgate.eu/" />
        </Helmet>
        <h1>Hello World, {name}</h1>
    </>
);

export default HelloWorld;
