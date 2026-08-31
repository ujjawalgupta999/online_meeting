import { neon } from '@neondatabase/serverless';

// Connect to Neon using the URL from .env
export const sql = neon(process.env.DATABASE_URL);

// Function to initialize tables
export async function initDB() {
  try {
    // 1. Create Users Table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE,
        image TEXT,
        plan VARCHAR(50) DEFAULT 'free',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 2. Create Meetings Table
    await sql`
      CREATE TABLE IF NOT EXISTS meetings (
        id SERIAL PRIMARY KEY,
        meeting_id VARCHAR(50) UNIQUE,
        title VARCHAR(255),
        host_id VARCHAR(255) REFERENCES users(id),
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ended_at TIMESTAMP
      );
    `;

    // 3. Create Participants Table
    await sql`
      CREATE TABLE IF NOT EXISTS meeting_participants (
        id SERIAL PRIMARY KEY,
        meeting_id INT REFERENCES meetings(id),
        user_id VARCHAR(255) REFERENCES users(id),
        name VARCHAR(255),
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        left_at TIMESTAMP
      );
    `;

    // 4. Create Messages Table
    await sql`
      CREATE TABLE IF NOT EXISTS meeting_messages (
        id SERIAL PRIMARY KEY,
        meeting_id INT REFERENCES meetings(id),
        sender_id VARCHAR(255) REFERENCES users(id),
        sender_name VARCHAR(255),
        text TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    console.log("Neon Database connected and tables initialized successfully.");
  } catch (err) {
    console.error("Failed to initialize database:", err);
    throw err;
  }
}