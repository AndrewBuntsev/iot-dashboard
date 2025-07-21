# TODO



## CONFIG

- add .env files to any service that expects environment variables
*DONE* (only local .env files are supposed to be committed, the rest are ignored)

- replace `npm install` in your Dockerfile(s) with `npm ci`, for environment consistency

- add a simple Makefile that runs `npm ci`
   

## CODE

- convert services to use typescript (you don't have to type everything)
*DONE*
 

## TESTING

- add one load-test to the API `.get('/:device_ids)` endpoint using k6

- **THIS IS THE MOST IMPORTANT PART OF THIS SHOPPING LIST**

- once you've done that, generate a profile and a flame chart

- follow the steps here: https://code.visualstudio.com/docs/nodejs/profiling

- add one unit-test per repo (use Jest)

- add one integration test to the API

    - you can use Playwright if you want a full-fat solution

    - alternatively, just use Jest to trigger a second test suite where nothing is mocked

    - i.e. it really calls a running API
 

## COUCHBASE

- use a parameterised query?

- use a prepared statement?
 

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

 