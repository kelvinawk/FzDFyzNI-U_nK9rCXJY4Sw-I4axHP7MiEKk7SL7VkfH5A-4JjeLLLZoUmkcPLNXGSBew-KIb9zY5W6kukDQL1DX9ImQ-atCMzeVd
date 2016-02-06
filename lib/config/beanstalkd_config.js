'use strict';

/*
 * beanstalkd configuration
 *
 * @property {string} host - host of beanstalkd server
 * @property {Number} port - port of beanstalkd server
 * @property {string} tube_name - name of tube in beanstalkd
 * @property {string} worker_id - id of consumer worker
 */
module.exports = {
	"host": "challenge.aftership.net",
    "port": 11300,
    "tube_name": "kelvinkwan4",
    "worker_id": "worker2"
}