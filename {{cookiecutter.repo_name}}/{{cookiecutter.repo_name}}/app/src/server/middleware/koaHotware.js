/* eslint-disable no-param-reassign */
import {PassThrough} from 'stream';


export default function koaHotware(hot) {
    return async (context, next) => {
        const stream = new PassThrough();

        await hot(context.req, {
            write: stream.write.bind(stream),
            writeHead: (status, headers) => {
                context.body = stream;
                context.status = status;
                context.set(headers);
            },
        }, next);
    };
}
