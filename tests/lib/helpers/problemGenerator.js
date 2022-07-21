module.exports = function (Rule, location, message, fixProps = {}) {
    return {
        ...Rule.meta,
        location,
        message,
        ...fixProps,
    };
};
