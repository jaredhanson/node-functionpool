var functionpool = require('functionpool');

var startedAt = Date.now();

var pool = new functionpool.Pool({ size: 3 }, function(x, y, delay, done) {
  setTimeout(function() { done(null, x + y) }, delay);
});

pool.on('idle', function() {
  console.log('Finished (' + (Date.now() - startedAt) + ' ms)');
});

function finished(err, res) {
  console.log('Result: ' + res);
}

pool.task(1, 5, 4000, finished);  // 6
pool.task(3, 8, 2000, finished);  // 11
pool.task(4, 3, 3000, finished);  // 7
pool.task(1, 1, 1000, finished);  // 2
