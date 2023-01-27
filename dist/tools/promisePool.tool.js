"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.promisePool = void 0;
const promisePool = async (arr = [], worker, concurrency = 1, options = { stopOnErr: false }) => {
    const { stopOnErr } = options;
    const end = arr.length;
    const result = [];
    let ind = 0;
    async function runner() {
        if (ind < end) {
            const _ind = ind;
            const item = arr[ind++];
            try {
                result[_ind] = await worker(item, _ind);
            }
            catch (err) {
                if (stopOnErr)
                    throw new Error(err);
                result[_ind] = err;
            }
            return runner();
        }
    }
    const runners = [];
    for (let i = 0; i < concurrency; i++) {
        if (i >= end)
            break;
        runners.push(runner());
    }
    await Promise.all(runners);
    return result;
};
exports.promisePool = promisePool;
