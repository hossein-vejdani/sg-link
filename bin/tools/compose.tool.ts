export const compose =
    (...fns) =>
    x =>
        fns.reduce((y, f) => f(y), x)

export const asyncCompose =
    (...fns) =>
    x => {
        return new Promise(async (resolve, reject) => {
            let res = x
            for (const fn of fns) {
                res = await fn(res)
            }
            resolve(res)
        })
    }
