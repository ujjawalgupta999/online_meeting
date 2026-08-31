import { Webhook } from 'svix';
import { sql } from '../config/db.js';

export const handleClerkWebhook = async (req, res) => {
  try {
    const SIGNING_SECRET = process.env.SIGNING_SECRET;
    if (!SIGNING_SECRET) {
      throw new Error('Error: Please add SIGNING_SECRET from Clerk Dashboard to .env');
    }

const wh = new Webhook(SIGNING_SECRET);
    
    // Convert the raw Buffer into a string for Svix
    const payload = req.body.toString('utf8'); 
    const headers = req.headers;

    // Verify the payload using Svix
    const event = wh.verify(payload, {
      "svix-id": headers["svix-id"],
      "svix-timestamp": headers["svix-timestamp"],
      "svix-signature": headers["svix-signature"],
    });

    const eventType = event.type;
    const data = event.data;

    switch (eventType) {
      case 'user.created':
      case 'user.updated': {
        const userId = data.id;
        const primaryEmail = data.email_addresses?.[0]?.email_address || '';
        const name = `${data.first_name || 'User'} ${data.last_name || ''}`.trim();
        const image = data.image_url || '';
        
        // For new users, default to free. For updates, we don't override the plan.
        if (eventType === 'user.created') {
          await sql`
            INSERT INTO users (id, name, email, image, plan) 
            VALUES (${userId}, ${name}, ${primaryEmail}, ${image}, 'free')
            ON CONFLICT (id) DO UPDATE SET 
              name = EXCLUDED.name, 
              image = EXCLUDED.image,
              updated_at = CURRENT_TIMESTAMP
          `;
        } else {
          await sql`
            UPDATE users SET 
              name = ${name}, 
              email = ${primaryEmail}, 
              image = ${image}, 
              updated_at = CURRENT_TIMESTAMP
            WHERE id = ${userId}
          `;
        }
        break;
      }
      case 'user.deleted': {
        const userId = data.id;
        if (userId) {
          await sql`DELETE FROM users WHERE id = ${userId}`;
        }
        break;
      }
      default:
        console.log(`Unhandled Clerk Webhook event type: ${eventType}`);
    }

    return res.status(200).json({ success: true, type: eventType });
  } catch (error) {
    console.error('Webhook Error:', error.message);
    return res.status(400).json({ error: error.message });
  }
};