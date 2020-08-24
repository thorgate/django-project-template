import loadable from '@loadable/component';
import { RenderChildren } from 'tg-named-routes';

import obtainTokenWatcher from 'sagas/auth/obtainTokenSaga';
import logoutWorker from 'sagas/auth/logoutSaga';
import signupWatcher from 'sagas/auth/signupSaga';
import forgotPasswordWatcher from 'sagas/auth/forgotPasswordSaga';
import resetPasswordWatcher from 'sagas/auth/resetPasswordSaga';

const LoginView = loadable(() => import('views/auth/Login'));
const SignupView = loadable(() => import('views/auth/Signup'));
const ForgotPasswordView = loadable(() => import('views/auth/ForgotPassword'));
const ResetPasswordView = loadable(() => import('views/auth/ResetPassword'));

export const createAuthenticationRoutes = PageNotFoundRoute => ({
    path: '/auth',
    name: 'auth',
    component: RenderChildren,
    routes: [
        {
            path: '/auth/login',
            exact: true,
            name: 'login',
            component: LoginView,
            watcher: obtainTokenWatcher,
        },
        {
            path: '/auth/signup',
            exact: true,
            name: 'signup',
            component: SignupView,
            watcher: signupWatcher,
        },
        {
            path: '/auth/forgot-password',
            exact: true,
            name: 'forgot-password',
            component: ForgotPasswordView,
            watcher: forgotPasswordWatcher,
        },
        {
            path: '/auth/reset-password/:token',
            exact: true,
            name: 'reset-password',
            component: ResetPasswordView,
            watcher: resetPasswordWatcher,
        },
        {
            path: '/auth/logout',
            exact: true,
            name: 'logout',
            component: () => null,
            initial: logoutWorker,
        },
        PageNotFoundRoute,
    ],
});
