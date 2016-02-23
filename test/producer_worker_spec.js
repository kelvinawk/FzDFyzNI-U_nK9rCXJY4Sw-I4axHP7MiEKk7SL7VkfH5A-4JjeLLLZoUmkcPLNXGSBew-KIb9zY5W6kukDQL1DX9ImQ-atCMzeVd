'use strict';

// import declaration
let expect = require('chai').expect;
let ProducerWorker = require('../lib/producer_worker.js');
let beanstalkd_config = require('../lib/config/beanstalkd_config.js');
let Seed = require('../lib/seed');

describe('ProducerWorker', function () {
	describe('#put(seed, delay)', function () {
		it('return jobid if the seed is put into tube', function () {
			// create seed and initialize producer worker
			let seed = new Seed('USD', 'HKD', 0, 0, 0, 60);
			let producer_worker = new ProducerWorker(beanstalkd_config);

			// put seed into tube
			producer_worker.put(seed, 0).then(function (jobid) {
				expect(jobid).to.be.a('Number');
			});
		});
	});
});
