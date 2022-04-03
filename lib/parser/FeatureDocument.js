module.exports = class FeatureDocument {
    constructor() {
        this.type = "FeatureDocument";
        this.start = null;
        this.end = null;
        this.comments = [];
        this.feature = {};
        this.path = null;
    }
};
