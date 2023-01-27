"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncCompose = exports.compose = void 0;
const compose = (...fns) => x => fns.reduce((y, f) => f(y), x);
exports.compose = compose;
const asyncCompose = (...fns) => x => {
    return new Promise(async (resolve, reject) => {
        let res = x;
        for (const fn of fns) {
            res = await fn(res);
        }
        resolve(res);
    });
};
exports.asyncCompose = asyncCompose;
