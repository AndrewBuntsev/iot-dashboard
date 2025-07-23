up:
	docker-compose up --build --force-recreate -d

down:
	docker-compose down

ci:
	docker-compose run api npm ci
	docker-compose run thermostat npm ci
	docker-compose run iot-manager npm ci
	docker-compose run ui npm ci
