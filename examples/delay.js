var workerpool = require('../lib/worker-pool');

var pool = new workerpool.Pool(function(delay, finish) {
  console.log('Working for ' + delay + ' milliseconds...');
  setTimeout(finish, delay);
});


pool.add(1000);
pool.add(2000);
pool.add(3000);
pool.add(1000);
