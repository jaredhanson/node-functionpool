var functionpool = require('functionpool');

var startedAt = Date.now();

var pool = new functionpool.Pool({ size: 3 }, function(delay, done) {
  console.log('Working for ' + delay + ' milliseconds...');
  setTimeout(done, delay);
});

pool.on('idle', function() {
  console.log('Finished (' + (Date.now() - startedAt) + ' ms)');
});

pool.task(1000);
pool.task(2000);
pool.task(3000);
pool.task(1000);
