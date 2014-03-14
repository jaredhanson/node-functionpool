// http://book.mixu.net/node/ch7.html

function pool(work, items, limit, cb) {
  if (typeof limit == 'function') {
    cb = limit;
    limit = undefined;
  }
  limit = limit || 4;
  
  var running = 0
    , results = [];
  
  function run() {   
    while(running < limit && items.length > 0) {
      function done(err, r) {
        running--;
        results.push(arguments);
        
        if (items.length > 0) {
          run();
        } else if(running == 0) {
          cb(results);
        }
      }
      
      var args = items.shift();
      if (!Array.isArray(args)) {
        args = [ args ];
      }
      args.push(done);
      
      running++;
      work.apply(undefined, args);
    }
  }
  run();
}


exports = module.exports = pool;
exports.pool = pool;
