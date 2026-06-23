// server.js
const stripe = require('stripe')('sk_live_...');

app.post('/create-checkout-session', async (req, res) => {
  const { items, total } = req.body;
  
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: items.map(item => ({
      price_data: {
        currency: 'brl',
        product_data: { name: item.name },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.qty,
    })),
    mode: 'payment',
    success_url: 'https://seusite.com/success',
    cancel_url: 'https://seusite.com/cancel',
  });

  res.json({ url: session.url });
});
