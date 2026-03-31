import Stripe from "stripe";
import Booking from "../models/Booking.js";

export const stripeWebhook = async (req, res) => {
  const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    // Verify webhook signature
    event = stripeInstance.webhooks.constructEvent(
      req.body, 
      sig, 
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.log(`⚠️ Webhook signature verification failed:`, error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const bookingId = session.metadata?.bookingId;
        
        if (bookingId) {
          // Update booking to paid
          await Booking.findByIdAndUpdate(bookingId, { 
            isPaid: true,
            paymentLink: session.url
          });
          console.log(`✅ Booking ${bookingId} marked as paid`);
        }
        break;
      }
      
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        
        // Get session from payment intent
        const sessions = await stripeInstance.checkout.sessions.list({
          payment_intent: paymentIntent.id,
          limit: 1
        });
        
        const session = sessions.data[0];
        const bookingId = session?.metadata?.bookingId;
        
        if (bookingId) {
          await Booking.findByIdAndUpdate(bookingId, { 
            isPaid: true,
            paymentLink: session.url
          });
          console.log(`✅ Booking ${bookingId} marked as paid via payment_intent`);
        }
        break;
      }
      
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    
    res.json({ received: true });
    
  } catch (error) {
    console.error(" Stripe Webhook Error:", error.message);
    return res.status(500).send("Internal Server Error");
  }
};