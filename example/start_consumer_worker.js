'use strict';

//import declaration
var beanstalkd_config = require("./lib/config/beanstalkd_config");
var ConsumerWorker = require("./lib/consumer_worker");

//create new consumer worker
let consumer_worker = new ConsumerWorker(beanstalkd_config);
//start worker
consumer_worker.start();