export default (fn) => new Promise((resolve) => fn(function() {
    resolve([].slice.call(arguments));
}));
