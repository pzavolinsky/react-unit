"use strict";
var R = require('ramda');
var notText = ['object', 'function'];
exports.isText = function (v) { return !R.contains(typeof v, notText); };
