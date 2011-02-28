var sys = require('sys');
var EventEmitter = require('events').EventEmitter;
var Worker = require('./worker');

function Pool (options, workerFunc) {
  if (typeof options == 'function') {
    workerFunc = options;
    options = {};
  }
  
  if (!workerFunc) { throw new Error('Pool requires a worker function') };
  if (workerFunc.length < 1) { throw new Error('Worker function must take finish function as an argument') };
  
  options = options || {};
  
  this.workerFunc = workerFunc;
  this.queue = [];
  this.workers = this._createWorkers(options.size || 3);
  EventEmitter.call(this);
};

sys.inherits(Pool, EventEmitter);


Pool.prototype.add = function() {
  var args = Array.prototype.slice.call(arguments);
  var callback;
  if (args && args.length) {
    if (typeof args[args.length - 1] == 'function') {
      callback = args.pop();
    }
  }
  
  this.queue.push({args: args, callback: callback});
  this.emit('add');
  this.work();

  // Allow chaining.
  return this;
}

Pool.prototype.work = function() {
  var i;
  for (i = 0; i < this.workers.length; i++) {
    var worker = this.workers[i];
    if (!worker.working) {
      return worker.work();
    }
  }
};

Pool.prototype.shift = function() {
  return this.queue.shift();
};

Pool.prototype.report = function() {
  if (this.queue.length == 0) {
    this.emit('idle');
  }
};

Pool.prototype._createWorkers = function(count) {
  var array = [];
  var i;
  for (i = 0; i < count; i++) {
    array.push(new Worker(this, this.workerFunc));
  }
  return array;
};


module.exports = Pool;
