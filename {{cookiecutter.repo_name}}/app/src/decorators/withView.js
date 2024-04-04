import { connectView } from "@thorgate/spa-view";

import { onComponentError } from "@/src/services/sentry";

export default (props = {}) =>
    (target) =>
        connectView({ ...props, onComponentError })(target);
