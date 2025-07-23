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
	docker-compose run --rm api npm run test::unit
	docker-compose run --rm thermostat npm run test::unit
	docker-compose run --rm iot-manager npm run test::unit

test-integration:
	@set -e; \
	trap 'docker-compose down' EXIT; \
	docker-compose --env-file .env.test up -d --build; \
	echo "Waiting for containers to be ready..."; \
	sleep 20; \
	docker exec api-test npx playwright test
	echo "Waiting for containers to be terminated..."; \
	sleep 5; \

test: build test-unit down test-integration

