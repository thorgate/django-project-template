import PropTypes from 'prop-types';

export const UserShape = PropTypes.shape({
    id: PropTypes.number,
    email: PropTypes.string,
    name: PropTypes.string,
    is_superuser: PropTypes.bool,
    is_staff: PropTypes.bool,
    is_active: PropTypes.bool,
    last_login: PropTypes.string,
    date_joined: PropTypes.string,
});

export const UsersShape = PropTypes.shape({
    isAuthenticated: PropTypes.bool.isRequired,
    user: UserShape,
});
