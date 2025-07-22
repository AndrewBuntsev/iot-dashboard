#!/bin/bash

apk add --no-cache curl

# Wait for Couchbase server
echo "Waiting for Couchbase to be ready..."
until curl -s http://$COUCHBASE_HOST:8091/pools > /dev/null; do
  sleep 2
done

echo "Couchbase is up."

# Cluster initialization (only once)
if ! curl -s http://$COUCHBASE_HOST:8091/pools/default | grep -q '"clusterName"'; then
  echo "Setting cluster memory quotas..."
  curl -s -X POST http://$COUCHBASE_HOST:8091/pools/default \
    -d memoryQuota=256 \
    -d indexMemoryQuota=256

  echo "Configuring services and admin credentials..."
  curl -s -X POST http://$COUCHBASE_HOST:8091/node/controller/setupServices \
    -d services=kv%2Cn1ql%2Cindex

  curl -s -X POST http://$COUCHBASE_HOST:8091/settings/web \
    -d port=8091 \
    -d username=$COUCHBASE_USER \
    -d password=$COUCHBASE_PASSWORD

  echo "Cluster initialized."
else
  echo "Cluster already initialized."
fi

# Create telemetry bucket (if doesn't exist)
if curl -s -u $COUCHBASE_USER:$COUCHBASE_PASSWORD http://$COUCHBASE_HOST:8091/pools/default/buckets/telemetry | grep -q '"name":"$COUCHBASE_BUCKET"'; then
  echo "Bucket '$COUCHBASE_BUCKET' already exists"
else
  echo "Creating bucket '$COUCHBASE_BUCKET'..."
  curl -s -u $COUCHBASE_USER:$COUCHBASE_PASSWORD -X POST http://$COUCHBASE_HOST:8091/pools/default/buckets \
    -d name=$COUCHBASE_BUCKET \
    -d ramQuotaMB=128 \
    -d bucketType=couchbase \
    -d flushEnabled=1
  sleep 5
fi

# Create primary index (if not exists)
INDEX_EXISTS=$(curl -s -u $COUCHBASE_USER:$COUCHBASE_PASSWORD \
  http://$COUCHBASE_HOST:8093/query/service \
  -d 'statement=SELECT name FROM system:indexes WHERE name="#primary" AND keyspace_id="$COUCHBASE_BUCKET"')
if echo "$INDEX_EXISTS" | grep -q "#primary"; then
  echo "Primary index exists"
else
  echo "Setting indexer storage mode..."
  curl -s -u $COUCHBASE_USER:$COUCHBASE_PASSWORD -X POST http://$COUCHBASE_HOST:8091/settings/indexes \
    -d 'storageMode=forestdb'
    sleep 2
  echo "Creating primary index..."
  curl -s -u $COUCHBASE_USER:$COUCHBASE_PASSWORD \
    http://$COUCHBASE_HOST:8093/query/service \
    -d 'statement=CREATE PRIMARY INDEX ON `$COUCHBASE_BUCKET`'
fi

echo "Couchbase init completed!"
