const childrenMatches = (elem, selector) => (
    Array.prototype.filter.call(elem.children, child => child.matches(selector))
);

export default childrenMatches;
