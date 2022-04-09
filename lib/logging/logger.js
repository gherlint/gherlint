module.exports = {
    error: (message) => {
        throw `ERROR: ${message}`;
    },
    warn: (message) => console.warn(`WARN: ${message}`),
};
