import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    // Attempt to connect using the URI from our .env file
    const conn = await mongoose.connect(process.env.MONGO_URI || "");
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // If it fails, log the error and stop the server
    console.error(`❌ Error: ${(error as Error).message}`);
    process.exit(1);
  }
};
