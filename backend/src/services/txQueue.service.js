import logger from '../utils/logger.util.js';

class TransactionQueue {
    constructor() {
        this.queue = [];
        this.isProcessing = false;
    }

    /**
     * Add a transaction task to the queue.
     * @param {Function} task - A function that returns a promise (the tx execution)
     * @returns {Promise} - The result of the transaction
     */
    async enqueue(task) {
        return new Promise((resolve, reject) => {
            this.queue.push({ task, resolve, reject });
            this.process();
        });
    }

    async process() {
        if (this.isProcessing || this.queue.length === 0) return;

        this.isProcessing = true;
        const { task, resolve, reject } = this.queue.shift();

        try {
            logger.info(`Processing transaction... Queue depth: ${this.queue.length}`);
            const result = await task();
            resolve(result);
        } catch (error) {
            logger.error('Transaction Queue Error', error);
            reject(error);
        } finally {
            this.isProcessing = false;
            // Immediate tail-call would risk stack overflow for massive queues
            setImmediate(() => this.process());
        }
    }
}

export default new TransactionQueue();
