'use strict';

(function () {
	// import declaration
	let Promise = require('bluebird');
	let co = require('co');
	let jsdom = require('jsdom');
	let request = require('request');
	let ExchangeRate = require('./exchange_rate');
	let mongodb_config = require('./config/mongodb_config');
	let beanstalkd_config = require('./config/beanstalkd_config');
	let ProducerWorker = require('./producer_worker');
	let MongodbConnection = require('./mongodb_connection');
	let Seed = require('./seed');
	let handler_config = require('./config/handler_config');

	// api URL for getting exchange rate
	let api_url = 'http://www.xe.com/currencyconverter/convert';

	/*
	 * ExchangeRateHandler constructor
	 *
	 * @property {string} type - specify which type of seed the handle work on, in this case is exchange_rate.
	 * @constructor
	 */
	function ExchangeRateHandler() {
		this.type = 'exchange_rate';
	}

	/*
	 * Function: logic of the job during execution
	 *
	 * @param {payload} payload - job payload
	 * @param {callback} callback - callback of consumer worker
	 */
	ExchangeRateHandler.prototype.work = function (payload, callback) {
		// declare mongo connection
		let mongodb_connection = new MongodbConnection(mongodb_config);
		// create seed from payload
		let seed = new Seed(payload.from, payload.to, payload.success_count, payload.failure_count, payload.priority, payload.ttr);
		// declare producer worker for putting job to tube
		let producer_worker = new ProducerWorker(beanstalkd_config);

		co(function*() {
			// get exchange rate in xe.com
			let exchange_rate = yield getExchangeRate(payload.from, payload.to);
			console.log(`[${ExchangeRateHandler.name}] get exchange_rate success: ${exchange_rate}`);
			// open db connection
			yield mongodb_connection.openConnection();
			// save exchange rate to db
			let data = yield new ExchangeRate({
				from: payload.from,
				to: payload.to,
				rate: exchange_rate}).save();
			console.log(`[${ExchangeRateHandler.name}] Exchange rate is saved to db: ${data}`);
			// close db connection
			yield mongodb_connection.closeConnection();

			if (++seed.payload.success_count < handler_config.SUCCESS_ATTEMPT) {
				// put job into tube again and update the success count of seed
				producer_worker.put(seed, handler_config.SUCCESS_DELAY).then(function (jobid) {
					console.log(`[${ExchangeRateHandler.name}] job is reput into tube: ${beanstalkd_config.tube_name}, jobid: ${jobid}`);
					console.log(`[${ExchangeRateHandler.name}] seed in job: ${JSON.stringify(seed)}`);
				}).catch(function (err) {
					console.log(`[${ExchangeRateHandler.name}] Error when reputting job, ${err}`);
				});
			} else {
				// all jobs are done
				console.log(`[${ExchangeRateHandler.name}] All jobs are successfully done, ${JSON.stringify(seed)}`);
			}

			callback('success', 0);
		}).catch(function (err) {
			// close db connection
			mongodb_connection.closeConnection();

			// if failure count is no more than the maximum fail attempts, reput the job into tube
			if (++seed.payload.failure_count < handler_config.FAIL_ATTEMPT) {
				console.log(`[${ExchangeRateHandler.name}] Fail to get exchange rate, ${err}`);
				// put job into tube again and update the failure count of seed
				producer_worker.put(seed, handler_config.FAIL_DELAY).then(function (jobid) {
					console.log(`[${ExchangeRateHandler.name}] job is reput into tube: ${beanstalkd_config.tube_name}, reput jobid: ${jobid}`);
					console.log(`[${ExchangeRateHandler.name}] seed in job: ${JSON.stringify(seed)}`);
				});
			} else {
				// Fail to get exchange rate more than maximum fail attempts, job will be given up.
				console.log(`[${ExchangeRateHandler.name}] Fail to get exchange rate more than ${handler_config.FAIL_ATTEMPT} attempts, job will be given up, Error: ${err}`);
				callback('bury', 0);
			}
		});
	};

	/*
	 * Function: get exchange rate from xe.com
	 *
	 * @param {string} from - currency from which country
	 * @param {string} to - currency to which country
	 * @return {Promise} - either return {Number} exchange rate if success or {string} if failure
	 */
	function getExchangeRate(from, to) {
		return new Promise(function (resolve, reject) {
			request({
				url: api_url,
				qs: {
					Amount: 1,
					From: from,
					To: to
				},
				method: 'GET'
			}, function (error, response, body) {
				jsdom.env(
					body, ['http://code.jquery.com/jquery.js'], function (err, window) {
						let $ = window.$;
						let exchange_rate_text = $('.uccResUnit > .leftCol').text();
						let exchange_rate = exchange_rate_text.match(`1\\s${from}\\s=\\s(.*)\\s${to}`);
						if (exchange_rate !== null) {
							exchange_rate = Number(exchange_rate[1]).toFixed(2).toString();
							resolve(exchange_rate);
						} else {
							reject('Cannot get exchange rate.');
						}
					}
				);}
			);
		});
	}

	module.exports = ExchangeRateHandler;
}());
