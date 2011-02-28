var workerpool = require('../lib/worker-pool');

var pool = new workerpool.Pool(function(delay, finish) {
  if (delay < 0) {
    finish(new Error('delay must be greater than zero'));
    return;
  }
  
  console.log('Working for ' + delay + ' milliseconds...');
  setTimeout(function() { finish(delay) }, delay);
});

function callback(err, result) {
  if (err) { 
    console.log('ERROR: ' + err.name + ' ' + err.message);
    return;
  }
  console.log('Worked for ' + result + ' milliseconds.');
}

pool.add(1000, callback);
pool.add(-1, callback);
