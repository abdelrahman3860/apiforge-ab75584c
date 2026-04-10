```javascript
// Import required packages
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Initialize the Express app
const app = express();

// Enable CORS for all origins
app.use(cors());

// Parse JSON request bodies
app.use(bodyParser.json());

// API key auth middleware
const apiKeyAuth = (req, res, next) => {
  if (req.header('X-API-Key') !== process.env.API_KEY) {
    return res.status(401).json({ success: false, error: 'Unauthorized', message: 'Invalid API key' });
  }
  next();
};

// Shopify webhook endpoint
app.post('/shopify-webhook', apiKeyAuth, (req, res) => {
  // Validate the request body
  if (!req.body || !req.body.id || !req.body.customer) {
    return res.status(400).json({ success: false, error: 'Invalid request', message: 'Missing required fields' });
  }

  // Extract relevant order information
  const orderId = req.body.id;
  const customerName = req.body.customer.name;
  const orderTotal = req.body.total_price;

  // Format the Slack notification message
  const slackMessage = {
    text: `New order created: #${orderId} - ${customerName} - $${orderTotal}`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `New order created: #${orderId} - ${customerName} - $${orderTotal}`,
        },
      },
    ],
  };

  // Return the formatted Slack notification message
  res.json({ success: true, data: slackMessage });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Not found', message: 'The requested endpoint was not found' });
});

// Global error handler
app.use((err, req, res) => {
  console.error(err);
  res.status(500).json({ success: false, error: 'Internal server error', message: 'An unexpected error occurred' });
});

// Listen on the specified port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});