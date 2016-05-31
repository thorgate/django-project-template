import React from 'react';


class HelloWorld extends React.Component {
    render() {
        const title = this.props.title || "Hello world!";
        return (
            <strong>{title}</strong>
        );
    }
}

export default HelloWorld;
