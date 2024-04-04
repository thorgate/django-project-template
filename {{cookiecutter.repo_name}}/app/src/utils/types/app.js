import PropTypes from "prop-types";

export const RouterLocationShape = PropTypes.shape({
    key: PropTypes.string,
    pathname: PropTypes.string.isRequired,
    search: PropTypes.string.isRequired,
    hash: PropTypes.string.isRequired,

    state: PropTypes.object, // eslint-disable-line
});

export const RouterMatchShape = PropTypes.shape({
    isExact: PropTypes.bool.isRequired,
    params: PropTypes.object.isRequired, // eslint-disable-line
    path: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
});

export const RouterRouteShapeObject = {
    exact: PropTypes.bool,
    location: RouterLocationShape,
    path: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.string),
    ]),
    render: PropTypes.func,
    sensitive: PropTypes.bool,
    strict: PropTypes.bool,
    component: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.element,
        PropTypes.func,
        // ForwardRef's are currently not supported
        // See issue: https://github.com/facebook/prop-types/issues/200
        PropTypes.shape({ render: PropTypes.func }),
    ]),
    children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
};

export const RouterRouteShape = PropTypes.shape({
    ...RouterRouteShapeObject,
    routes: PropTypes.arrayOf(PropTypes.shape(RouterRouteShapeObject)),
});

export const RouterHistoryShape = PropTypes.shape({
    action: PropTypes.string,
});

export const ErrorShape = PropTypes.shape({
    statusCode: PropTypes.number,
    message: PropTypes.string,
    stack: PropTypes.any, // eslint-disable-line react/forbid-prop-types
});
