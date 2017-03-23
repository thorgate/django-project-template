import React from 'react';


function HelloWorld({title}) {
    return (
        <strong>{title || "Hello world!"}</strong>
    );
}

HelloWorld.propTypes = {
    title: React.PropTypes.string,
};

export default HelloWorld;
