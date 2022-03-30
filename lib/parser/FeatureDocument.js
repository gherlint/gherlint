module.exports = class FeatureDocument {
    constructor(props) {
        for (const key in props) {
            this[key] = props[key];
        }
    }
};
