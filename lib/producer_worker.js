'use strict';

(function () {
	// import declaration
	let Fivebeans = Promise.promisifyAll(require('fivebeans'));

	/*
	 * ProducerWorker constructor
	 *
	 * @param {beanstalkd_config} config - configuration of ProducerWorker, see beanstalkd_config.js
	 * @constructor
	 */
	function ProducerWorker(config) {
		this.config = config;
	}

	/*
	 * Function: put job into tube using Fivebeans client
	 * @param {Seed} seed - seed of the job
	 * @param {Number} delay - time delay of putting job
	 * @return {Promise} either return {Number} jobid if success or {string} error if failure
	 */
	ProducerWorker.prototype.put = function (seed, delay) {
		// initialize fivebeans client
		let client = new Fivebeans.client(this.config.host, this.config.port);
		// declare tube name from beanstalkd config
		let tube_name = this.config.tube_name;

		return new Promise(function (resolve, reject) {
			client.on('connect', function () {
			// client can now be used
				console.log(`[${ProducerWorker.name}] client is connected to beanstalkd server.`);
				// use tube
				client.use(tube_name, function (err, tube) {
					if (!err) {
						// put job into tube
						client.put(seed.payload.priority, delay, seed.payload.ttr, JSON.stringify([tube, seed]), function (put_job_err, jobid) {
							client.end();
							resolve(jobid);
						});
					} else {
						reject(err);
					}
				});
			}).on('error', function (err) {
				// connection failure
				reject(err);
			}).connect();
		});
	};

	module.exports = ProducerWorker;
}());
