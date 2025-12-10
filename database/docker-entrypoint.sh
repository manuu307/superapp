#!/bin/bash
set -e

echo "Starting MongoDB with replica set..."
mongod --replSet rs0 --bind_ip_all &

echo "Waiting for MongoDB to be ready..."
until mongosh --host database --eval "print(\"waited for connection\")" > /dev/null 2>&1; do
  sleep 1
done
echo "MongoDB is ready."

echo "Checking replica set status..."
if mongosh --host database --eval "rs.status()" | grep "no repl set config has been received"; then
  echo "Initiating replica set..."
  mongosh --host database --eval "rs.initiate({_id: 'rs0', members: [{_id: 0, host: 'database:27017'}]})"
fi

echo "Waiting for replica set to be healthy..."
until mongosh --host database --eval "rs.status().ok" > /dev/null 2>&1; do
  sleep 1
done
echo "Replica set is healthy."

echo "MongoDB setup complete. Keeping container running."
tail -f /dev/null
