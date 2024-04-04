import React from "react";

interface HelloWorldProps {
    name: string;
}

const HelloWorld = ({ name }: HelloWorldProps) => <p>Hello, {name}</p>;

export default HelloWorld;
