'use strict';

(function () {
	/* Seed constructor
	 *
	 * @property {string} type - type of seed
	 * @param {string} from - currency from which country
	 * @param {string} to - currency to which country
	 * @param {string} success_count - success count of job, default is 0
	 * @param {string} failure_count - failure count of job, default is 0
	 * @param {Number} priority - priority of job, higher priority, smaller value
	 * @param {Number} ttr - time to run in second, default is 30s
	 * @constructor
	 */
	function Seed(from, to, success_count, failure_count, priority, ttr) {
		this.type = 'exchange_rate';
		this.payload = {
			'from': from,
			'to': to,
			'success_count': success_count || 0,
			'failure_count': failure_count || 0,
			'priority': priority || 0,
			'ttr': ttr || 30
		};
	}

	module.exports = Seed;
}());
