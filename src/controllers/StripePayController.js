const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create a payment intent
const createPaymentIntent = async (req, res) => {
  const { amount, currency, metadata } = req.body;
  
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe expects amount in cents
      currency: currency || 'inr',
      metadata: metadata || {}
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Stripe payment intent error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Confirm payment completion
const confirmPayment = async (req, res) => {
  const { paymentIntentId } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status === 'succeeded') {
      res.json({ 
        status: 'success',
        paymentDetails: {
          id: paymentIntent.id,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          createdAt: new Date(paymentIntent.created * 1000)
        }
      });
    } else {
      res.status(400).json({ 
        status: 'failed',
        message: 'Payment not completed'
      });
    }
  } catch (error) {
    console.error('Stripe payment confirmation error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createPaymentIntent,
  confirmPayment
};