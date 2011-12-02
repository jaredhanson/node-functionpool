/**
 * Module dependencies.
 */
var util = require('util')
  , EventEmitter = require('events').EventEmitter
  , Worker = require('./worker');


/**
 * `Pool` constructor.
 *
 * Assigns `fn` to a pool used to execute (potentially expensive) tasks.  The
 * pool has a limited size (defaulting to 5), which controls the maximum number
 * of tasks that will be allowed to execute concurrently.  After the limit has
 * been reached, tasks will be queued and executed when prior tasks complete.
 *
 * `fn` must accept a `done` callback, which it must invoke with a result (or
 * error) upon completion.
 *
 * Options:
 *   - `size`  maximum number of tasks allowed to execute concurrently (default: 5)
 *
 * Examples:
 *
 *     new Pool(function(name, done) {
 *       setTimeout(function() { done(null, 'Hello ' + name) }, 1000);
 *     });
 *
 *     new Pool({ size: 3 }, function(x, y, done) {
 *       setTimeout(function() { done(null, x + y) }, 5000);
 *     });
 *
 * @param {Object} options
 * @param {Function} fn
 * @api public
 */
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

/**
 * Inherit from `EventEmitter`.
 */
util.inherits(Pool, EventEmitter);


/**
 * Add a task to the pool.
 *
 * If the last argument to this method is a function, it will be called with a
 * result (or error) when the task completes.
 *
 * Examples:
 *
 *     pool.task('World');
 *
 *     pool.task(3, 14, function(err, res) {
 *       console.log('3 + 14 = ' + res);
 *     });
 *
 * @param {Mixed} arguments
 * @api public
 */
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

/**
 * Dispatch next task to an available worker.
 *
 * @api private
 */
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

/**
 * Create `count` number of workers.
 *
 * @api private
 */
Pool.prototype._createWorkers = function(count) {
  var array = [];
  for (var i = 0; i < count; i++) {
    array.push(new Worker(this._fn));
  }
  return array;
};


/**
 * Expose `Pool`.
 */
module.exports = Pool;
