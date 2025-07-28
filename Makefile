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

# test-unit:
# 	docker-compose run --rm api npm run test::unit
# 	docker-compose run --rm thermostat npm run test::unit
# 	docker-compose run --rm iot-manager npm run test::unit

test-unit:
	echo "Running Unit Tests"; \
	docker exec api npm run test::unit
	docker exec thermostat npm run test::unit
	docker exec iot-manager npm run test::unit	

test-integration:
	echo "Running Integration Tests"; \
	@set -e; \
	trap 'docker-compose down' EXIT; \
	docker exec api npx playwright test
	

wait-for-start:
	@echo "Waiting for containers to be ready..."
	sleep 20

wait-before-down:
	@echo "Waiting for containers to be terminated..."
	sleep 5

test: \
	down \
	up \
	wait-for-start \
	test-unit \
	test-integration \
	wait-before-down \
	down

