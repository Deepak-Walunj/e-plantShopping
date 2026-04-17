import { AsyncLocalStorage } from "async_hooks";

const asyncLocalStorage = new AsyncLocalStorage()

export function runWithRequestContext(context, fn) {
    asyncLocalStorage.run(context, fn)
}

export function getRequestContext() {
    return asyncLocalStorage.getStore();
}