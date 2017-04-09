"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var exclude_1 = require("./exclude");
var mock_1 = require("./mock");
var with_context_1 = require("./with-context");
var debug_1 = require("./debug");
var addOns = {
    exclude: exclude_1.default,
    mock: mock_1.default,
    withContext: with_context_1.default,
    debug: debug_1.default
};
exports.default = addOns;
