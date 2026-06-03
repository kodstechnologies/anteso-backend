import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv'
dotenv.config();
const MONGODB_URL = process.env.MONGODB_URL
// console.log("🚀 ~ MONGODB_URI:", MONGODB_URI)
const connectToDb = async () => {
    try {
      if (mongoose.connection.readyState === 1) {
        console.log("Already connected");
        return;
      }
  
      await mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
  
      console.log("MongoDB connected");
    } catch (err) {
      console.error("DB Error:", err.message);
      process.exit(1);
    }
  };
export default connectToDb