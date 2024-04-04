import React from "react";

import NotFound from "@/src/components/NotFound";
import withView from "@/src/decorators/withView";

const PageNotFound = () => <NotFound />;

const PageNotFoundView = withView()(PageNotFound);

export default PageNotFoundView;
