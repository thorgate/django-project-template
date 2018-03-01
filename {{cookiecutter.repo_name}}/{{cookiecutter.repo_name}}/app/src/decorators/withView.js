import React from 'react';

import View from 'containers/View';

const withView = (Component, title, authRequired = false, decoratorProps = {}) => {
    const WrappedComponent = props => (
        <View title={title} authRequired={authRequired} {...decoratorProps} {...props}>
            <Component {...props} />
        </View>
    );
    WrappedComponent.displayName = `withView(${Component.displayName || Component.name})`;
    return WrappedComponent;
};


export default (title, authRequired = false, displayLoading = false, props = {}) => target => (
    withView(target, title, authRequired, displayLoading, props)
);
