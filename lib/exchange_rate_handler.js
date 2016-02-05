'use strict';

(function(){
	var Promise = require("bluebird");
	var co = require("co");
	var jsdom = require("jsdom");
	var request = require("request");
	var ExchangeRate = require("./exchange_rate");
	var mongodb_config = require("./config/mongodb_config");
	var beanstalkd_config = require("./config/beanstalkd_config");
	var ProducerWorker = require("./producer_worker"); 
	var MongodbConnection = require("./mongodb_connection");
	var Seed = require("./seed");

	var api_url = "http://www.xe.com/currencyconverter/convert";
	let producer_worker = new ProducerWorker(beanstalkd_config);

	const SUCCESS_ATTEMPT = 10;
	const FAIL_ATTEMPT = 3;
	const SUCCESS_DELAY = 60;
	const FAIL_DELAY = 3;

	function ExchangeRateHandler() {
		this.type = 'exchange_rate';
	}

	ExchangeRateHandler.prototype.work = function (payload, callback) {
		//declare mongo connection
		let mongodb_connection = new MongodbConnection(mongodb_config);
		//create seed from payload
		let seed = new Seed(payload.from, payload.to, payload.success_count, payload.failure_count, payload.priority);
		//declare producer worker for putting job to tube
		let producer_worker = new ProducerWorker(beanstalkd_config);

		co(function*(){
			//open db connection
			yield mongodb_connection.openConnection();
			//get exchange rate in xe.com
			let exchange_rate = yield getExchangeRate(payload.from, payload.to);
			console.log(`[${ExchangeRateHandler.name}] get exchange_rate success: ${exchange_rate}`);
			//save exchange rate to db
			let data = yield new ExchangeRate({
				from: payload.from, 
				to: payload.to, 
				rate: exchange_rate}).save();
			console.log(`[${ExchangeRateHandler.name}] Exchange rate is saved to db: ${data}`);
			//close db connection
			yield mongodb_connection.closeConnection();

			if(++seed.payload.success_count < SUCCESS_ATTEMPT){
				//put job into tube again and update the success count of seed
				producer_worker.put(seed, SUCCESS_DELAY).then(function(jobid){
					console.log(`[${ExchangeRateHandler.name}] job is reput into tube: ${beanstalkd_config.tube_name}, jobid: ${jobid}`);
					console.log(`[${ExchangeRateHandler.name}] seed in job: ${JSON.stringify(seed)}`);
				}).catch(function(err){
					console.log(`[${ExchangeRateHandler.name}] Error when reputting job, ${err}`);
				});
			} else {
				//all jobs are done
				console.log(`[${ExchangeRateHandler.name}] All jobs are successfully done, ${JSON.stringify(seed)}`)
			}

			callback('success');
		}).catch(function(err) {
			//close db connection
			mongodb_connection.closeConnection();

			if(++seed.payload.failure_count < FAIL_ATTEMPT){
				console.log(`[${ExchangeRateHandler.name}] Fail to get exchange rate, ${err}`);
				//put job into tube again and update the failure count of seed
				producer_worker.put(seed, FAIL_DELAY).then(function(jobid){
					console.log(`[${ExchangeRateHandler.name}] job is reput into tube: ${beanstalkd_config.tube_name}, reput jobid: ${jobid}`);
					console.log(`[${ExchangeRateHandler.name}] seed in job: ${JSON.stringify(seed)}`);
				});
			} else{
				//Fail to get exchange rate more than 3 attempts, job will be given up.
				console.log(`[${ExchangeRateHandler.name}] Fail to get exchange rate more than ${FAIL_ATTEMPT} attempts, job will be given up, ${err}`);
			}
			callback('success');
		});
	}

	/*
	 *
	 *
	 *
	 */
	function getExchangeRate(from, to){
		return new Promise(function(resolve, reject){
			request({
			url: api_url,
			qs: {
				Amount: 1,
				From: from,
				To: to
			}, 
			method: "GET"
			}, function (error, response, body){
					jsdom.env(
						body,["http://code.jquery.com/jquery.js"],function(err, window){
							var $ = window.$;
							let exchange_rate_text = $(".uccResUnit > .leftCol").text();
							let exchange_rate = exchange_rate_text.match(`1\\s${from}\\s=\\s(.*)\\s${to}`);
							if (exchange_rate !== null) {
								exchange_rate = Number(exchange_rate[1]).toFixed(2).toString();
								resolve(exchange_rate);
							} else {
								reject("Cannot get exchange rate.");
							}
						}
					);
				}
			);
		});
	}

	module.exports = ExchangeRateHandler;
})();