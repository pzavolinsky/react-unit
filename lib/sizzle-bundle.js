
var document = {
	createElement: function(tag) {
		return {
			appendChild: function() {},
			getElementsByTagName: function() { return []; },
			getAttribute: function() {}
		}
	},
	createComment: function(s) { return s; },
	getElementsByClassName: ' { [native code] }',
	nodeType: 9,
	documentElement: { nodeName: 'HTML' }
};
document.ownerDocument = document;
var window = { document: document };

if (!global.document) {
	global.document = document;
}

var _ = (function() {
	CONTENT;
})(window);