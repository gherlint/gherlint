module.exports = class Node {
    constructor(props) {
        for (const key in props) {
            this[key] = props[key];
        }
    }
};
