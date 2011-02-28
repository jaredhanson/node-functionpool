var Pool = require('worker-pool').Pool;
var assert = require('assert');


module.exports = {
  
  'test default options': function() {
    var pool = new Pool(function(finish) {});
    assert.equal(pool.workers.length, 3);
    assert.equal(pool.queue.length, 0);
  },
  
  'test creates correct number of workers': function() {
    var pool = new Pool({ size: 5 }, function(finish) {});
    assert.equal(pool.workers.length, 5);
  },
  
  'test passes zero arguments to worker function': function() {
    var fini;
    var pool = new Pool(function(finish) {
      fini = finish;
    });
    
    pool.add();
    assert.type(fini, 'function');
  },
  
  'test passes single argument to worker function': function() {
    var a1;
    var fini;
    var pool = new Pool(function(x, finish) {
      a1 = x;
      fini = finish;
    });
    
    pool.add(1);
    assert.equal(a1, 1);
    assert.type(fini, 'function');
  },
  
  'test passes multiple arguments to worker function': function() {
    var a1;
    var a2;
    var fini;
    var pool = new Pool(function(x, y, finish) {
      a1 = x;
      a2 = y;
      fini = finish;
    });
    
    pool.add(1, 2);
    assert.equal(a1, 1);
    assert.equal(a2, 2);
    assert.type(fini, 'function');
  },
  
  'test accumulates work in queue': function() {
    var args = [];
    var addCount = 0;
    var pool = new Pool(function(x, finish) { args.push(x) });
    
    
    pool.on('add', function() { addCount++ });
    pool.add(1);
    pool.add(2);
    pool.add(3);
    pool.add(4);
    pool.add(5);
    
    assert.deepEqual(args, [1, 2, 3]);
    assert.equal(addCount, 5);
    assert.equal(pool.queue.length, 2);
  },
  
  'test throws without worker function': function() {
    assert.throws(
      function() {
        var pool = new Pool();
      },
      Error
    );
    
    assert.throws(
      function() {
        var pool = new Pool({});
      },
      Error
    );
  }
};
