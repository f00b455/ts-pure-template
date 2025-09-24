"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fooFilter = exports.fooTransform = exports.createFooProcessor = exports.fooGreet = exports.fooProcess = void 0;
const shared_1 = require("@ts-template/shared");
// Pure functional approach instead of class
const fooProcess = (config) => (input) => {
    return `${config.prefix}${input}${config.suffix || ''}`;
};
exports.fooProcess = fooProcess;
const fooGreet = (config) => (name) => {
    const greeting = (0, shared_1.greet)(name);
    return (0, exports.fooProcess)(config)(greeting);
};
exports.fooGreet = fooGreet;
const createFooProcessor = (config) => {
    return {
        process: (0, exports.fooProcess)(config),
        greetWithFoo: (0, exports.fooGreet)(config),
    };
};
exports.createFooProcessor = createFooProcessor;
const fooTransform = (data, transformer) => {
    return data.map(transformer);
};
exports.fooTransform = fooTransform;
const fooFilter = (items, predicate) => {
    return items.filter(predicate);
};
exports.fooFilter = fooFilter;
