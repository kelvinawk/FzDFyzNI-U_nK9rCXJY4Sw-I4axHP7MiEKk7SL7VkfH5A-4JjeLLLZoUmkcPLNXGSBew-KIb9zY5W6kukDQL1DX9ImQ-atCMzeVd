'use strict';

// import declaration
var chai = require("chai");
var expect = require("chai").expect;
var ProducerWorker = require("../lib/producer_worker.js");
var beanstalkd_config = require("../lib/config/beanstalkd_config.js");
var Seed = require("../lib/seed");

describe("ProducerWorker", function(){
	describe("#put(seed, delay)", function(){
		it("return jobid if the seed is put into tube", function(){

			//create seed and initialize producer worker
			let seed = new Seed("USD", "HKD", 0, 0, 0, 60);
			let producer_worker = new ProducerWorker(beanstalkd_config);
			
			//put seed into tube
			producer_worker.put(seed,0).then(function(jobid){
				expect(jobid).to.be.a('Number');
			});
		})
	})
});