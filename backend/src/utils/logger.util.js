const logger = {
    info: (message) => {
        console.log(`\x1b[36m[INFO]\x1b[0m ${new Date().toLocaleTimeString()} - ${message}`);
    },
    error: (message, error) => {
        console.error(`\x1b[31m[ERROR]\x1b[0m ${new Date().toLocaleTimeString()} - ${message}`, error || '');
    },
    warn: (message) => {
        console.warn(`\x1b[33m[WARN]\x1b[0m ${new Date().toLocaleTimeString()} - ${message}`);
    }
};

export default logger;
