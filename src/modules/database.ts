import { MongoClient, ServerApiVersion } from 'mongodb';

export const db_init = async () => {
  const uri = process.env.DB_URI;
  if (!uri) {
    console.error('DB_URI is not defined in the environment variables');
    throw new Error('DB_URI is not defined in the environment variables');
  }

  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    await client.db('admin').command({ ping: 1 });
    console.log('Pinged your deployment. You successfully connected to MongoDB!');
  } finally {
    await client.close();
  }
};