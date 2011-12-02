/**
 * Module dependencies.
 */
var util = require('util')
  , EventEmitter = require('events').EventEmitter;

/**
 * `Worker` constructor.
 *
 * @param {Function} fn
 * @api private
 */
function Worker(fn) {
  EventEmitter.call(this);
  this.busy = false;
  this._fn = fn;
};

/**
 * Inherit from `EventEmitter`.
 */
util.inherits(Worker, EventEmitter);

/**
 * Instruct a worker to execute task with `args`.
 *
 * @param {Array} args
 * @api private
 */
Worker.prototype.work = function(args) {
  args = args || [];
  
  var self = this;
  function done(err, res) {
    self.busy = false;
    self.emit('done', err, res);
  }
  
  this.busy = true;
  args.push(done);
  try {
    this._fn.apply(this, args);
  } catch (err) {
    done(err);
  }
};


/**
 * Expose `Worker`.
 */
module.exports = Worker;
