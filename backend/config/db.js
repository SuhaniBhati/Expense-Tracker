const mongoose = require("mongoose");

let connectionPromise = null;

// If the connection drops, allow the next request to reconnect.
mongoose.connection.on("disconnected", () => {
  connectionPromise = null;
});

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not set");
  }

  // Reuse the in-flight/cached promise so concurrent requests in the same
  // serverless instance share ONE connection attempt.
  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 8000, // fail fast instead of hanging
        maxPoolSize: 5,
      })
      .then(() => {
        console.log("MongoDB connected");
        return mongoose.connection;
      })
      .catch((error) => {
        connectionPromise = null;
        console.error("MongoDB connection error:", error.message);
        throw error;
      });
  }

  return connectionPromise;
};

module.exports = connectDB;