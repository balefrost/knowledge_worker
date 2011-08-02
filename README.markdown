Introduction
============

KnowledgeWorker is a library to facilitate the development of web workers.

At the time that this library was created, no major browser with worker support exposes the console object to the worker's script. Coupled with poor debugging support, this makes the development of any worker quite difficult. KnowledgeWorker establishes a new messaging protocol from the worker to the caller. This protocol allows normal messages and console messages to flow through the same pipe. The protocol can be easily extended, allowing for more types of messages to flow from the worker. This is all accomplished with virtually no changes to the caller's script, and only minor changes to the worker's script.

How to Use
==========

In the caller's script, replace instances of Worker with KnowledgeWorker. 

In the worker's script, wrap the script body in some boilerplate:

    importScripts("knowledge-worker-import.js");
    
    knowledge_worker(function(console, postMessage) {
        //script body goes here
    });


Limitations
===========

KnowledgeWorker was designed specifically for dedicated workers. It could probably be adapted for use with shared workers, but it doesn't support them out-of-the-box.

Some worker methods and properties are not yet implemented.

Design
======

A KnowledgeWorker object starts in a state that does no extra processing on incoming messages. This makes it a drop-in replacement for Worker in the caller's script. A KnowledgeWorker-compatible worker script will initially post a sentinel message to the KnowledgeWorker. Once the KnowledgeWorker receives the sentinel, it expects further messages to conform to the KnowledgeWorker protocol.

The sentinel value is an object with a single property "KnowledgeWorker sentinel value". Its value is the numeric constant 8675309. Initially, I had tried using an array with an extra non-array property (assuming that people generally do set properties on objects but do not set properties on arrays). This worked in Chrome 13.0.782.107 beta and in Firefox 5.0.1, but not in Safari 5.1 (7534.48.3). I think it is generally assumed that worker messages must be JSON serializable (and an array with a non-array property is not JSON serializable), but I see nothing in the spec to indicate this, so I assume that Safari is buggy here.

Every message that conforms to the KnowledgeWorker protocol must be an object with the "command" field set to a string. Currently, two command patterns are recognized:

* `message`: This message should be treated as a normal postMessage. The contents of the message's `data` property should be used as the `data` property of the object sent to the `onmessage` handler. (That is to say, the message is unwrapped one level before being passed on.)

* `console.{method}`: The specified console method should be executed. Its arguments are in the message's `arguments` property.

I had initially planned for knowledge-worker-import.js to overwrite the `console` and `postMessage` globals. However, a bug in Firefox (5.0.1, possibly later) prevents postMessage from being overwritten - it seems to be read-only. We can work around that by using a new function scope to create local bindings for those variables, and that is what the `knowledge_worker` shim does. The import script does attempt to overwrite these values, though, so it is possible to omit the shim if the script only needs to work in Chrome or Safari.

To Do
=====

* Support multiple message ports.
* Support shared workers.
* Support onerror.

Crazy Thoughts
==============

* Support shimless execution by including a stock worker script that is used by all KnowledgeWorker scripts. The actual script is then fetched via XMLHttpRequest, and `eval()`d inside a scope with console and postMessage defined.