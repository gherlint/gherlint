module.exports = function traverse(obj) {
    Object.keys(obj).forEach((key) => {
        console.log(key);
        traverse(obj[key]);
    });
};
