# FzDFyzNI-U_nK9rCXJY4Sw-I4axHP7MiEKk7SL7VkfH5A-4JjeLLLZoUmkcPLNXGSBew-KIb9zY5W6kukDQL1DX9ImQ-atCMzeVd

## Goal
----
Code a currency exchagne rate `worker`

1. Input currency `FROM` and `TO`, say USD to HKD, one currency conversation per job.
2. Get `FROM` and `TO` currency every 1 min, save 10 successful rate results to mongodb include the timestamp, then that currency converstaion job is done.
3. If any problem during the get rate attempt, retry it delay with 3s
4. If failed more than 3 times in total (not consecutive), bury the job.

## Requirement
- Beanstalkd Message Queue
- MongoDB
- Node.js with ES6 support
- npm

## Design and Architecture
(/architecture.png)

## Installation
Download the project and install all dependencies with the following command:
```
npm install
```
## Quick Start Guide
####1. put seed into beanstalkd server using producer worker

I have re-designed the payload format as following:
```  
{
	"from": "HKD",
	"to": "USD",
	"success_count": 0,
	"failure_count": 0,
	"priority": 0,
	"ttr": 60
}
```
You may modify the payload in [start_producer_worker.js](/example/start_producer_worker.js) as you want, then run the following command to put seed into beanstalkd server:
```
node example/start_producer_worker.js
```

###2. start the consumer worker to execute the job
Execute the job with the payload by running the following command:
```
node example/start_consumer_worker.js
```
