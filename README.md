# IoT Dashboard

This project is a full-stack IoT telemetry dashboard. It collects, stores, and visualizes telemetry data from simulated devices using Kafka, Couchbase, and Next.js UI.

## Project Structure & Services

The system is composed of several services, orchestrated via Docker Compose:

- **sensor, sensor_2**: Simulated IoT devices that generate and publish telemetry data to Kafka.
- **kafka**: Message broker for ingesting telemetry data.
- **zookeeper**: Required by Kafka for cluster management.
- **couchbase**: NoSQL database for storing telemetry data.
- **couchbase-init**: Initializes Couchbase with required buckets/collections.
- **iot-manager**: Consumes telemetry messages from Kafka and stores them in Couchbase.
- **api**: Node.js/Express service that exposes a REST API for querying telemetry data from Couchbase.
- **ui**: Next.js frontend for visualizing telemetry data.

## Running the Project with Docker Compose

1. **Clone the repository** and ensure Docker and Docker Compose are installed.

2. **Start all services:**
   ```bash
   make up
   ```

3. **Access the UI:**
   - Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **API Endpoint:**
   - The API is available at [http://localhost:4000/api/telemetry](http://localhost:4000/api/telemetry).

5. **Couchbase Web UI:**
   - Access Couchbase at [http://localhost:8091](http://localhost:8091)
   - Username: `admin`
   - Password: `password`

6. **Grafana Dashboard:**
   - Access Grafana at [http://localhost:3005](http://localhost:3005)
   - Username: `admin`
   - Password: `admin`
   - Add InfluxDB as a data source:
     - URL: `http://host.docker.internal:8086`
     - Database: `k6`

7. **Tests:**
   - Run load tests using:
   ```bash
   make test-load
   ```
   - Run unit tests using:
   ```bash
   make test-unit
   ```
   - Run integration tests using:
   ```bash
   make test-integration
   ```
    - Run Kafka integration test suite using:
   ```bash
   make test-kafka
   ```

## Development Notes

- The UI uses the environment variable `NEXT_PUBLIC_API_BASE_URL` to connect to the API.
- The API uses CORS to allow requests from the UI.
- All services communicate over the Docker Compose network using service names.

## Customization

- To add more simulated devices, duplicate and configure additional sensor services in `docker-compose.yml`.
- To change database or broker settings, update the respective service environment variables.

## Stopping the Project

To stop all services and remove containers, run:
```bash
make down
```

## Troubleshooting

If the UI is not working and the `api` container is down, check Couchbase at http://localhost:8091.  
If you see a "Setup New Cluster" button instead of the login screen, it means the Couchbase init script failed. You’ll need to initialize the database manually:

1. Click "Setup New Cluster"
2. Enter:
   - Cluster name: `default`
   - Admin username: `admin`
   - Password: `password`
3. Tick "I accept the terms & conditions"
4. Click "Finish With Defaults"
5. In the left panel, go to "Buckets"
6. Click "Add Bucket"
7. Enter:
   - Name: `telemetry`
8. Click "Add Bucket"

Now stop and restart the project:

```bash
```bash
make down
make up
