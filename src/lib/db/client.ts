import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI?.trim() || ''

interface CachedConnection {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

const globalWithMongo = global as typeof globalThis & {
  _mongooseConnection?: CachedConnection
}

const cached: CachedConnection = globalWithMongo._mongooseConnection || {
  conn: null,
  promise: null,
}

if (!globalWithMongo._mongooseConnection) {
  globalWithMongo._mongooseConnection = cached
}

export async function connectDB() {
  if (cached.conn) return cached.conn

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not defined')
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: 'ticketly',
      bufferCommands: false,
    })
  }

  cached.conn = await cached.promise
  return cached.conn
}
