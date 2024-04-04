import loadable from "@loadable/component";
import { RenderChildren } from "tg-named-routes";

import obtainTokenWatcher from "@/src/sagas/auth/obtainTokenSaga";
import logoutWorker from "@/src/sagas/auth/logoutSaga";
import signupWatcher from "@/src/sagas/auth/signupSaga";
import forgotPasswordWatcher from "@/src/sagas/auth/forgotPasswordSaga";
import resetPasswordWatcher from "@/src/sagas/auth/resetPasswordSaga";

const LoginView = loadable(() => import("@/src/views/auth/Login"));
const SignupView = loadable(() => import("@/src/views/auth/Signup"));
const ForgotPasswordView = loadable(() =>
    import("@/src/views/auth/ForgotPassword")
);
const ResetPasswordView = loadable(() =>
    import("@/src/views/auth/ResetPassword")
);

export const createAuthenticationRoutes = (PageNotFoundRoute) => ({
    path: "/auth",
    name: "auth",
    component: RenderChildren,
    routes: [
        {
            path: {
                en: "/en/auth-old/login",
                et: "/et/auth-old/login",
            },
            exact: true,
            name: "login",
            component: LoginView,
            watcher: obtainTokenWatcher,
        },
        {
            path: {
                en: "/en/auth-old/signup",
                et: "/et/auth-old/signup",
            },
            exact: true,
            name: "signup",
            component: SignupView,
            watcher: signupWatcher,
        },
        {
            path: {
                en: "/en/auth-old/forgot-password",
                et: "/et/auth-old/forgot-password",
            },
            exact: true,
            name: "forgot-password",
            component: ForgotPasswordView,
            watcher: forgotPasswordWatcher,
        },
        {
            path: {
                en: "/en/auth-old/reset-password",
                et: "/et/auth-old/reset-password",
            },
            exact: true,
            name: "reset-password",
            component: ResetPasswordView,
            watcher: resetPasswordWatcher,
        },
        {
            path: {
                en: "/en/auth-old/logout",
                et: "/et/auth-old/logout",
            },
            exact: true,
            name: "logout",
            component: () => null,
            initial: logoutWorker,
        },
        PageNotFoundRoute,
    ],
});
