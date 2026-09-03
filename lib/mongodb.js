import 'server-only';
import { MongoClient } from 'mongodb';

// Lazy, pooled MongoDB connection. Never throws at import time so `next build`
// and Vercel previews without MONGO_URL still compile; callers must handle
// hasMongo() === false and fall back to the local JSON store.
const options = { maxPoolSize: 10, maxConnecting: 2, maxIdleTimeMS: 60000, waitQueueTimeoutMS: 8000, serverSelectionTimeoutMS: 6000 };

export function hasMongo() {
  return Boolean(process.env.MONGO_URL);
}

export async function getDatabase() {
  const uri = process.env.MONGO_URL;
  if (!uri) throw new Error('MONGO_URL is not configured');
  const store = globalThis;
  if (!store.__madWorldMongo) {
    const client = new MongoClient(uri, options);
    store.__madWorldMongo = { client, promise: client.connect().catch((error) => { store.__madWorldMongo = null; throw error; }) };
  }
  const client = await store.__madWorldMongo.promise;
  return client.db(process.env.DB_NAME || 'madworld');
}
