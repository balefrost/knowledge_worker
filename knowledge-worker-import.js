var knowledge_worker = (function() {

	var oldPostMessage = postMessage;

	var sentinel = {"KnowledgeWorker sentinel value": 8675309};

	var newConsole = {};
	var consoleCommands = ["log", "debug", "info", "warn", "error", "assert", "clear", "dir", "dirxml", "trace", "group", "groupCollapsed", "groupEnd", "time", "timeEnd", "profile", "profileEnd", "count", "exception", "table"]
	consoleCommands.forEach(function(c) {
		newConsole[c] = function(varargs) {
			oldPostMessage({command:"console." + c, arguments:Array.prototype.slice.call(arguments, 0)});
		};
	})

	var newPostMessage = function postMessage(data) {
		oldPostMessage({command:"message", data:data});
	};
	
	oldPostMessage(sentinel);

	console = newConsole;
	postMessage = newPostMessage;

	return function knowledge_worker(f) {
		f(newConsole, newPostMessage);
	}
})();