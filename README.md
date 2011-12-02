# Function Pool

Function Pool provides a fixed-size pool that can be used to execute potentially
expensive tasks in Node.js.

Conceptually similar to a [thread pool](http://en.wikipedia.org/wiki/Thread_pool_pattern),
but adapted to Node's single-threaded model, Function Pool organizes tasks into
a queue, which will be executed by a limited number of workers.  The number of
workers corresponds to the number of tasks that will be allowed to execute
concurrently.  After the limit has been reached, tasks will be queued and
executed when prior tasks complete.

## Installation

    $ npm install functionpool
    
## Usage

#### Allocate a Pool

Create a new pool, specifying the maximum number of workers in the `size`
option.  The worker function must accept a `done` callback, which it must
call with the result when it completes work (or error, if an exception occurs).

    var pool = new functionpool.Pool({ size: 4 }, function(x, y, done) {
      setTimeout(function() { done(null, x + y) }, 5000);
    });

#### Add Tasks to the Pool

Add tasks to the pool, which will be executed if workers are available and
queued for later execution otherwise.

    pool.task(3, 14, function(err, res) {
      console.log('3 + 14 = ' + res);
    });

## Credits

  - [Jared Hanson](http://github.com/jaredhanson)

## License

(The MIT License)

Copyright (c) 2011 Jared Hanson

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
