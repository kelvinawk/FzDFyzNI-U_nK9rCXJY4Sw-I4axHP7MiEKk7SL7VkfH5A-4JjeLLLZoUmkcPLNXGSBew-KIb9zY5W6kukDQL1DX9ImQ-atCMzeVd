'use strict';

(function(){
	//import declaration
	var Promise = require("bluebird");
	var Fivebeans = Promise.promisifyAll(require("fivebeans"));
	var ExchangeRateHandler = require("./exchange_rate_handler");

	/*
	 * ConsumerWorker constructor
	 *
     * @param {beanstalkd_config} config - configuration of ProducerWorker, see beanstalkd_config.js
     * @constructor
     */
	function ConsumerWorker(config){
		this.config = config;
	}

	/*
	 * Function: start the worker with beanstalkd configuration
	 */
	ConsumerWorker.prototype.start = function() {
		let options = {
			id: this.config.worker_id,
    		host: this.config.host,
    		port: this.config.port,
    		handlers:{
    			exchange_rate: new ExchangeRateHandler()
    		},
    		ignoreDefault: true
		}

		//initialize Fivebeans worker
		let worker = new Fivebeans.worker(options);
		//start the worker with dedicated tube name
		worker.start([this.config.tube_name]);

		console.log(`[${ConsumerWorker.name}] ${options.id} start working on ${this.config.tube_name}`);
	};

	module.exports = ConsumerWorker;
})();