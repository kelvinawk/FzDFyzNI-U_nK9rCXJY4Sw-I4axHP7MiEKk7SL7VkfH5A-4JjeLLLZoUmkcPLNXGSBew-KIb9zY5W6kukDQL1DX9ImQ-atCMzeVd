'use strict';

(function(){
	var Promise = require("bluebird");
	var Fivebeans = Promise.promisifyAll(require("fivebeans"));
	var ExchangeRateHandler = require("./exchange_rate_handler");

	function ConsumerWorker(config){
		this.config = config;
	}

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

		let worker = new Fivebeans.worker(options);
		worker.start([this.config.tube_name]);

		console.log(`[${ConsumerWorker.name}] ${options.id} start working on ${this.config.tube_name}`);
	};

	module.exports = ConsumerWorker;
})();