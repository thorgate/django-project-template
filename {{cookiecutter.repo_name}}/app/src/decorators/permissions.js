import { permissionCheck } from '@thorgate/spa-permissions';


const defaultDecoratorProps = { redirectRouteName: 'auth:login' };


/**
 * Check if user is authenticated, if not then user is returned to login screen.
 *
 * @function
 * @param {Object} decoratorProps Props that will be forward to `PermissionCheck` Component.
 * @returns {React.Component|Function} Wrapped component
 */
export const loginRequired = (decoratorProps = {}) => permissionCheck(
    ({ isAuthenticated }) => isAuthenticated, 'loginRequired', {
        ...defaultDecoratorProps,
        PermissionDeniedComponent: null, // Login works as redirect
        ...decoratorProps,
    },
);

/**
 * Check if `user.is_superuser` is true, if not then user is returned to login screen.
 *
 * @function
 * @param {Object} decoratorProps Props that will be forward to `PermissionCheck` Component.
 * @returns {function} HoC function to wrap component e.g superUserRequired(Component)
 */
export const superUserRequired = (decoratorProps = {}) => permissionCheck(({ user, isAuthenticated }) => (
    isAuthenticated && !!user && user.is_superuser
), 'superUserRequired', {
    ...defaultDecoratorProps,
    redirectRouteName: null, // superUserRequired works as permission denied
    ...decoratorProps,
});
