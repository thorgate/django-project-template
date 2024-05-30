import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { detailPageFactory } from "@lib/factories/DetailPageFactory";
import { queriesApi } from "@lib/queries";
import { wrapper } from "@lib/store";
import { prepareSession } from "@lib/session";
import { UserDetailView } from "@components/User";

const [UserDetail, getExtraProps] = detailPageFactory({
    queryEndpoint: queriesApi.endpoints.userRetrieve,
    queryParameters: [
        { queryArg: "email", routeQueryArg: "queryPath", type: "hidden" },
    ],
    DetailView: UserDetailView,
});

export const getServerSideProps = wrapper.getServerSideProps(
    (store) => async (context) => {
        const session = await prepareSession(store, context);

        return {
            props: {
                ...(await serverSideTranslations(context.locale!, [
                    "common",
                    "user",
                ])),
                ...(await getExtraProps(store, context)),
                session,
            },
        };
    }
);

export default UserDetail;
