module.exports = {
    elapsedTime: (startTime) => {
        return Date.now() - startTime;
    },
    formatSeconds: (milliseconds) => {
        if (milliseconds < 1000) return `${milliseconds}ms`;

        const seconds = milliseconds / 1000;
        if (seconds < 60) return `${seconds}s`;

        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = (seconds % 60).toFixed(3);
        if (remainingSeconds === 0) return `${minutes}m`;
        return `${minutes}m${remainingSeconds}s`;
    },
};
