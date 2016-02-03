'use strict';

(function(){

	/*
	 *
	 */
	function Seed(from, to, success_count, failure_count, priority){
		this.payload = {
			"from": from,
			"to": to,
			"success_count": success_count || 0,
			"failure_count": failure_count || 0,
			"priority": priority || 0
		};
	}

	module.exports = Seed;
})();