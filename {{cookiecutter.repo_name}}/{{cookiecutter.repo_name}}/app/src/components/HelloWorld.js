import React from 'react';


function HelloWorld({title}) {
    return (
        <strong>{title}</strong>
    );
}

HelloWorld.propTypes = {
    title: React.PropTypes.string,
};

HelloWorld.defaultProps = {
    title: 'Hello world!',
};

export default HelloWorld;
