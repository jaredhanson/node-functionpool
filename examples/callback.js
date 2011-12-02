var functionpool = require('functionpool');

var pool = new functionpool.Pool(function(delay, done) {
  if (delay < 0) {
    done(new Error('delay must be greater than zero'));
    return;
  }
  
  console.log('Working for ' + delay + ' milliseconds...');
  setTimeout(function() { done(null, delay) }, delay);
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
