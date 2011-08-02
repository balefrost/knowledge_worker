KnowledgeWorker = (function() {
	var sentinel_name = "KnowledgeWorker sentinel value";
	var sentinel_value = 8675309;

	function is_sentinel(data) {
		return data.constructor === Object && data[sentinel_name] === sentinel_value;
	}

	return function KnowledgeWorker(script) {
		var knowledgeWorker = this;
		var worker = new Worker(script);
		var default_behavior = true;
		
		this.postMessage = function postMessage(message) {
			worker.postMessage.apply(worker, Array.prototype.slice.call(arguments, 0));
		};
		
		this.terminate = function terminate() {
			worker.terminate.apply(worker, Array.prototype.slice.call(arguments, 0));
		}

		function default_onmessage(e) {
			if (is_sentinel(e.data)) {
				default_behavior = false;
			} else {
				if (knowledgeWorker.onmessage) {
					knowledgeWorker.onmessage(e);
				}
			}
		}
		
		function kw_onmessage(e) {
			if (e.data["command"]) {
				var consoleMatches = /console\.([^.]*)/.exec(e.data.command);
				if (consoleMatches) {
					var method = consoleMatches[1];
					console[method].apply(console, e.data.arguments);
				} else if (e.data.command === "message") {
					if (knowledgeWorker.onmessage) {
						knowledgeWorker.onmessage({"data": e.data.data});
					}
				}
			} else {
				console.error(e.data);
				throw new Error("malformed KnowledgeWorker message");
			}
		}

		worker.onmessage = function(e) {
			if (default_behavior) {
				default_onmessage(e);
			} else {
				kw_onmessage(e);
			}
		}
	};
})();
