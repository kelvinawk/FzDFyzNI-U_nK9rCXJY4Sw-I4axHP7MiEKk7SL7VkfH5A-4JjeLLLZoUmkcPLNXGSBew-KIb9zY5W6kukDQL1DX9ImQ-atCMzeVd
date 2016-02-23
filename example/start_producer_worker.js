'use strict';

// import declaration
let beanstalkd_config = require('../lib/config/beanstalkd_config');
let ProducerWorker = require('../lib/producer_worker');
let Seed = require('../lib/seed');

// create seed and initialize producer worker
let seed = new Seed('USD', 'HKD', 0, 0, 0, 60);
let producer_worker = new ProducerWorker(beanstalkd_config);

// put seed into tube
producer_worker.put(seed, 0).then(function (jobid) {
	console.log(`[${producer_worker.constructor.name}] job is put into tube: ${beanstalkd_config.tube_name}, jobid: ${jobid}`);
	console.log(`[${producer_worker.constructor.name}] seed in job: ${JSON.stringify(seed)}`);
});
