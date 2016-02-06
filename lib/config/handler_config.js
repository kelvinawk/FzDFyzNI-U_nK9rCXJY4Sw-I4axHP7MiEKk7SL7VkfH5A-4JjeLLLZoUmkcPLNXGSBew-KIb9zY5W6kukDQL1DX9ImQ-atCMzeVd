'use strict';

/*
 * ExchangeRateHandler configuration
 * 
 * @property {Number} SUCCESS_ATTEMPT - Maximum number of successful job putting
 * @property {Number} FAIL_ATTEMPT - Maximum number of failure job putting
 * @property {Number} SUCCESS_DELAY - time delay of job putting after the previous successful attempt
 * @property {Number} FAIL_DELAY - time delay of job putting after the previous fail attempt
 */
module.exports = {
	SUCCESS_ATTEMPT: 10,
	FAIL_ATTEMPT: 3,
	SUCCESS_DELAY: 60,
	FAIL_DELAY: 3
}