var util = require('util')
  , EventEmitter = require('events').EventEmitter;

function Worker(fn) {
  EventEmitter.call(this);
  this.busy = false;
  this._fn = fn;
};

util.inherits(Worker, EventEmitter);

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


module.exports = Worker;
