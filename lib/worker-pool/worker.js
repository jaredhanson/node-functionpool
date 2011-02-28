function Worker (pool, workFunc) {
  this.pool = pool;
  this.workFunc = workFunc;
  this.working = false;
};

Worker.prototype.work = function() {
  if (this.working) { return; }
  
  var job = this.pool.shift();
  if (!job) { return; }
  
  var self = this;
  var args = job.args || [];
  var callback = job.callback;
  
  function finish(res) {
    if (callback) {
      if (res instanceof Error) {
        callback.call(self, res);
      } else {
        callback.call(self, null, res);
      }
    }
    
    self.pool.report();
    self.working = false;
    self.work();
  }
  args.push(finish);
  
  this.working = true;
  try {
    return this.workFunc.apply(this, args);
  } catch (err) {
    return finish(err);
  }
};


module.exports = Worker;
