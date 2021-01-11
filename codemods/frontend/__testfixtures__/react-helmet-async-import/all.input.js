import React from 'react';
import { Helmet } from 'react-helmet';

const HelloWorld = () => (
    <>
        <Helmet>
            <title>Hello World</title>
            <link rel="canonical" href="https://www.thorgate.eu/" />
        </Helmet>
        <h1>Hello World</h1>
    </>
);

export default HelloWorld;
