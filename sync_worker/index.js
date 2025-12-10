const { MongoClient } = require('mongodb');
const { Client } = require('@elastic/elasticsearch');

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/chat?replicaSet=rs0';
const elasticsearchNode = process.env.ELASTICSEARCH_NODE || 'http://localhost:9200';

const client = new Client({ node: elasticsearchNode });

async function main() {
  try {
    const mongoClient = new MongoClient(mongoUri);
    await mongoClient.connect();
    console.log('Connected to MongoDB');
    const db = mongoClient.db();

    const changeStream = db.watch();

    changeStream.on('change', async (change) => {
      console.log('Change detected:', change);

      const { collection: collectionName, documentKey, fullDocument, operationType } = change;
      const { _id } = documentKey;

      if (operationType === 'insert' || operationType === 'update' || operationType === 'replace') {
        try {
          await client.index({
            index: collectionName,
            id: _id.toString(),
            body: fullDocument,
          });
          console.log(`Indexed document with id: ${_id}`);
        } catch (error) {
          console.error(`Failed to index document with id: ${_id}`, error);
        }
      } else if (operationType === 'delete') {
        try {
          await client.delete({
            index: collectionName,
            id: _id.toString(),
          });
          console.log(`Deleted document with id: ${_id}`);
        } catch (error) {
          console.error(`Failed to delete document with id: ${_id}`, error);
        }
      }
    });

    console.log('Listening for changes...');
  } catch (error) {
    console.error('An error occurred:', error);
    process.exit(1);
  }
}

main();