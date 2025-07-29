# TODO



## CONFIG

- add .env files to any service that expects environment variables  
*DONE* (only local .env files are supposed to be committed, the rest are ignored)

- replace `npm install` in your Dockerfile(s) with `npm ci`, for environment consistency  
*DONE*

- add a simple Makefile that runs `npm ci`  
*DONE*
   

## CODE

- convert services to use typescript (you don't have to type everything)  
*DONE*
 

## TESTING

- add one load-test to the API `.get('/:device_ids)` endpoint using k6

- **THIS IS THE MOST IMPORTANT PART OF THIS SHOPPING LIST**

- once you've done that, generate a profile and a flame chart

- follow the steps here: https://code.visualstudio.com/docs/nodejs/profiling

- add one unit-test per repo (use Jest)  
*DONE* (added unit tests for `api`, `thermostat`, `iot-manager`, to run them use `make test-unit`)

- add one integration test to the API using Playwright  
*DONE* (to run them use `make test-integration`, to run all the tests (unit and integration) use `make test`)

- create a separate service for integration testing, move the integration tests there, and run them in a separate Docker container  
*DONE*
 

## COUCHBASE

- use a parameterised query?  
*DONE*

- use a prepared statement?  
*DONE* (Couchbase automatically prepares queries when using the SDK, so no need to do it manually)

## KAFKA

- deploy a Kafka UI (e.g. Kowl)  
*DONE*

- add a second partition (if you don't already have one)

- key messages on device id

- ☝️ these two points will allow you to process multiple device messages in parallel

- see if you can add message compression ( https://kafka.js.org/docs/producing#compression )
 

## BONUS POINTS

- once you've done the stuff above, you'll be a legend :)

- the next step is this: create a load test for the iot-manager

- one option is to have a little service that loads up the Kafka topic aggressively, and then you can track the Kafka lag until it becomes zero - that's the test finish

- if you're feeling spicy, do this before you make the Kafka and Couchbase changes above, then you can compare before/after performance

 