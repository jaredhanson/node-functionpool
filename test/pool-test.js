var vows = require('vows');
var assert = require('assert');
var util = require('util');
var Pool = require('functionpool/pool');


vows.describe('Pool').addBatch({

  'pool with default options': {
    topic: function() {
      return new Pool(function(done) {
        // never call done, so tasks accumulate
      });
    },
    
    'should have 5 workers': function (pool) {
      assert.equal(pool._workers.length, 5);
    },
    'should have empty queue': function (pool) {
      assert.equal(pool._queue.length, 0);
    },
    'should add 5 tasks': function (pool) {
      assert.isTrue(pool.task());
      assert.isTrue(pool.task());
      assert.isTrue(pool.task());
      assert.isTrue(pool.task());
      assert.isTrue(pool.task());
    },
    'should queue a 6th task': function (pool) {
      assert.isFalse(pool.task());
      assert.equal(pool._queue.length, 1);
    },
    'should queue a 7th task': function (pool) {
      assert.isFalse(pool.task());
      assert.equal(pool._queue.length, 2);
    },
  },
  
  'pool with specific size option': {
    topic: function() {
      return new Pool({ size: 3 }, function(done) {
        // never call done, so tasks accumulate
      });
    },
    
    'should have 3 workers': function (pool) {
      assert.equal(pool._workers.length, 3);
    },
    'should have empty queue': function (pool) {
      assert.equal(pool._queue.length, 0);
    },
    'should add 3 tasks': function (pool) {
      assert.isTrue(pool.task());
      assert.isTrue(pool.task());
      assert.isTrue(pool.task());
    },
    'should queue a 4th task': function (pool) {
      assert.isFalse(pool.task());
      assert.equal(pool._queue.length, 1);
    },
  },
  
  'pool that works and then idles': {
    topic: function() {
      var self = this;
      var count = 0;
      var pool = new Pool({ size: 3 }, function(done) {
        count++;
        setTimeout(done, 100);
      });
      pool.on('idle', function() {
        self.callback(null, pool, count);
      });
      pool.task();
      pool.task();
      pool.task();
      pool.task();
      pool.task();
    },
    
    'should work 5 times': function (err, pool, count) {
      assert.equal(count, 5);
    },
  },
  
  'pool should pass arguments to worker': {
    topic: function() {
      var self = this;
      var argx, argy;
      var pool = new Pool({ size: 3 }, function(x, y, done) {
        argx = x;
        argy = y;
        setTimeout(done, 100);
      });
      pool.on('idle', function() {
        self.callback(null, pool, argx, argy);
      });
      pool.task(3, 14);
    },
    
    'should pass correct arguments': function (err, pool, x, y) {
      assert.equal(x, 3);
      assert.equal(y, 14);
    },
  },
  
  'pool should invoke task callback with result': {
    topic: function() {
      var self = this;
      var pool = new Pool({ size: 3 }, function(x, y, done) {
        setTimeout(function() { done(null, 'pi'); }, 100);
      });
      pool.task(3, 14, function(err, res) {
        self.callback(null, err, res);
      });
    },
    
    'should not have error': function (err, e, res) {
      assert.isNull(e);
    },
    'should have correct result': function (err, e, res) {
      assert.equal(res, 'pi');
    },
  },
  
  'pool should invoke task callback with error': {
    topic: function() {
      var self = this;
      var pool = new Pool({ size: 3 }, function(x, y, done) {
        setTimeout(function() { done(new Error('something went wrong')); }, 100);
      });
      pool.task(3, 14, function(err, res) {
        self.callback(null, err, res);
      });
    },
    
    'should have error': function (err, e, res) {
      assert.instanceOf(e, Error);
    },
    'should have undefined result': function (err, e, res) {
      assert.isUndefined(res);
    },
  },
  
  'pool should catch exceptions from worker functions': {
    topic: function() {
      var self = this;
      var pool = new Pool({ size: 3 }, function(x, y, done) {
        wtfiswrongwithme
      });
      pool.task(3, 14, function(err, res) {
        self.callback(null, err, res);
      });
    },
    
    'should have error': function (err, e, res) {
      assert.instanceOf(e, ReferenceError);
    },
    'should have undefined result': function (err, e, res) {
      assert.isUndefined(res);
    },
  },
  
  'pool constructed without a worker function': {
    'should throw an error': function (strategy) {
      assert.throws(function() {
        new Pool();
      });
    },
    
    'should throw an error if only options given as argument': function (strategy) {
      assert.throws(function() {
        new Pool({ size: 3 });
      });
    },
  },
  
  'pool constructed with a worker function that does not have a done callback argument': {
    'should throw an error': function (strategy) {
      assert.throws(function() {
        new Pool(function() {});
      });
    },
  },

}).export(module);
