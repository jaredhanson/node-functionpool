var util = require('util')
  , EventEmitter = require('events').EventEmitter
  , Worker = require('./worker');

function Pool(options, fn) {
  if (typeof options == 'function') {
    fn = options;
    options = {};
  }
  options = options || {};
  
  if (!fn) { throw new Error('Pool requires a worker function') };
  if (fn.length < 1) { throw new Error('Pool worker function must accept done callback as an argument') };
  
  EventEmitter.call(this);
  this._fn = fn;
  this._workers = this._createWorkers(options.size || 5);
  this._working = 0;
  this._queue = [];
  
  var self = this;
  this.on('task', function() {
    if (self._workers.length == self._working) { return; }
    self._dispatch();
  });
  this.on('done', function() {
    // TODO: emit a `drain` event if the pool was previously queuing, and now
    //       has slots available
    if (self._working == 0) { self.emit('idle'); }
    if (self._queue.length == 0) { return; }
    self._dispatch();
  })
};

util.inherits(Pool, EventEmitter);


Pool.prototype.add =
Pool.prototype.task = function() {
  var args = Array.prototype.slice.call(arguments);
  var callback;
  if (args && args.length) {
    if (typeof args[args.length - 1] == 'function') {
      callback = args.pop();
    }
  }
  
  this._queue.push({args: args, callback: callback});
  var size = this._queue.length;
  this.emit('task');
  
  // If the queue length is zero, a worker was available to accept the task.
  // Otherwise, all workers are busy, and the task remains in the queue.
  return (this._queue.length == 0) ? true : false;
}

Pool.prototype._dispatch = function() {
  var self = this;
  
  // Find an available worker to give the next task to.
  var worker;
  for (var i = 0, len = this._workers.length; i < len; i++) {
    var w = this._workers[i];
    if (!w.busy) {
      worker = w;
      break;
    }
  }
  
  if (worker) {
    var task = this._queue.shift();
    worker.once('done', function(err, res) {
      task.callback && task.callback(err, res);
      self._working--;
      self.emit('done');
    });
    
    this._working++;
    worker.work(task.args);
  }
}

Pool.prototype._createWorkers = function(count) {
  var array = [];
  for (var i = 0; i < count; i++) {
    array.push(new Worker(this._fn));
  }
  return array;
};


module.exports = Pool;
