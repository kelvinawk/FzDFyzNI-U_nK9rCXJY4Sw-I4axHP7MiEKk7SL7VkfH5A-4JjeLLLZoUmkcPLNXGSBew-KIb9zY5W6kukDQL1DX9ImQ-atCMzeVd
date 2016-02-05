'use strict';

(function(){
	var Promise = require("bluebird");
	var co = require("co");
	var Fivebeans = Promise.promisifyAll(require("fivebeans"));

	function ProducerWorker(config){
		this.config = config;
	}

	ProducerWorker.prototype.put = function(seed, delay) {
		let client = new Fivebeans.client(this.config.host, this.config.port);
		let tube_name = this.config.tube_name;
		
		return new Promise(function(resolve, reject){
			client.on('connect', function(){
        		// client can now be used
        		console.log(`[${ProducerWorker.name}] client is connected to beanstalkd server.`);
                
        		client.use(tube_name, function(err, tube) {
        			if(!err){
        				client.put(seed.payload.priority, delay, 60, JSON.stringify([tube, seed]), function(err, jobid) {
        					client.end();
        					resolve(jobid);
        				});
        			} else{
        				reject(err);
        			}
        		});
    		}).on('error', function(err){
        		// connection failure
        		reject(err);
    		}).connect();
		});
	}

	module.exports = ProducerWorker;
})();