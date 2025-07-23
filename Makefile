build:
	docker-compose build

up:
	docker-compose up --build --force-recreate -d

down:
	docker-compose down

ci:
	docker-compose run api npm ci
	docker-compose run thermostat npm ci
	docker-compose run iot-manager npm ci
	docker-compose run ui npm ci

test-unit:
	docker-compose run --rm api npm test
	docker-compose run --rm thermostat npm test
	docker-compose run --rm iot-manager npm test
