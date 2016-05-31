// These are the paths we don't want to modify
const mediaPaths = [
    /^\/media/,
    /^\/assets/,
    /^\/static/,
    /^\/public/,
    /favicon.*/
];

export default (path) => {
    return mediaPaths.filter(x => x.test(path)).length > 0;
};
