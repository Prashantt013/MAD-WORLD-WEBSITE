import 'server-only';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URL;
if (!uri) throw new Error('MONGO_URL is required');

const options = { maxPoolSize: 10, maxConnecting: 2, maxIdleTimeMS: 60000, waitQueueTimeoutMS: 10000, serverSelectionTimeoutMS: 10000 };
const globalMongo = globalThis;
const client = globalMongo.__madWorldMongo?.client || new MongoClient(uri, options);
const promise = globalMongo.__madWorldMongo?.promise || client.connect();

if (process.env.NODE_ENV !== 'production') globalMongo.__madWorldMongo = { client, promise };

export async function getDatabase() {
  return (await promise).db();
}