.PHONY: build up down ci test-unit test-integration wait-for-start wait-before-down test


build:
	docker compose build

up:
	docker compose up --build --force-recreate -d

down:
	docker compose down

ci:
	docker compose run api npm ci
	docker compose run sensor npm ci
	docker compose run iot-manager npm ci
	docker compose run ui npm ci

test-unit:
	echo "Running Unit Tests"; \
	docker exec api npm run test::unit
	docker exec sensor npm run test::unit
	docker exec iot-manager npm run test::unit

test-integration:
	echo "Running Integration Tests"; \
	docker exec test npx playwright test

test-load:
	docker run --rm -i \
		-v $(PWD)/test/load-tests:/load-tests \
  		grafana/k6 run \
  		--out influxdb=http://host.docker.internal:8086/k6 \
  		/load-tests/telemetry.test.js	

wait-for-start:
	@(echo "Waiting for containers to be ready..."; sleep 20)

wait-before-down:
	@(echo "Waiting before down..."; sleep 5)

test:
	$(MAKE) down
	$(MAKE) up
	$(MAKE) wait-for-start
	$(MAKE) test-unit
	$(MAKE) test-integration
	$(MAKE) wait-before-down
	$(MAKE) down


