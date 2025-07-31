// import express from "express";

const express = require("express");
const Razorpay= require("razorpay")
const dotenv = require("dotenv");
const cors = require("cors");
const crypto = require("crypto");
dotenv.config({ path: __dirname + '/.env' });
console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID);
console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET);

const app = express();
const PORT = process.env.PORT || 10000;

// CORS middleware configuration
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Razorpay-Signature, Accept, Origin');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});
app.use(express.json());
app.use(express.raw({ type: 'application/json' })); // For webhook

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Validate environment variables
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error("❌ Missing Razorpay credentials in environment variables");
  process.exit(1);
}

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// -------- ROUTES -------- //

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "🔗 Razorpay Node.js Backend is Running!",
    timestamp: new Date().toISOString(),
    razorpayKeyId: process.env.RAZORPAY_KEY_ID ? "✅ Present" : "❌ Missing",
    version: "1.0.1",
    endpoints: ["/", "/health", "/create-order", "/verify-payment", "/webhook"]
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// CREATE ORDER
app.post("/create-order", async (req, res) => {
  try {
    console.log("📝 Create order request received");
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);
    console.log("URL:", req.originalUrl);
    
    const { amount, currency = "INR", bookingData } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid amount provided" 
      });
    }

    // Create order with Razorpay
    const orderOptions = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paisa
      currency,
      receipt: `receipt_${bookingData?.bookingId || Date.now()}`,
      notes: {
        booking_id: bookingData?.bookingId,
        guest_name: `${bookingData?.firstName || ''} ${bookingData?.lastName || ''}`.trim(),
        check_in: bookingData?.checkIn,
        check_out: bookingData?.checkOut,
        guests: bookingData?.guests ? `${bookingData.guests.adults} adults` : '',
      }
    };

    console.log("🔄 Creating Razorpay order with options:", orderOptions);
    
    const order = await razorpay.orders.create(orderOptions);
    
    console.log("✅ Razorpay order created:", order);

    res.status(200).json({
      success: true,
      key: process.env.RAZORPAY_KEY_ID,
      orderId: order.id,
      order_id: order.id, // Adding this as Razorpay sometimes expects order_id
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      notes: order.notes
    });
    
  } catch (error) {
    console.error("❌ Error in /create-order:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to create Razorpay order",
      error: error.message 
    });
  }
});

// VERIFY PAYMENT
app.post("/verify-payment", (req, res) => {
  try {
    console.log("🔍 Payment verification request:", req.body);
    
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      bookingData 
    } = req.body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required payment verification parameters" 
      });
    }

    // Generate signature for verification
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    console.log("🔐 Signature comparison:", {
      received: razorpay_signature,
      generated: generatedSignature,
      match: generatedSignature === razorpay_signature
    });

    if (generatedSignature === razorpay_signature) {
      // Payment verified successfully
      console.log("✅ Payment verified successfully for booking:", bookingData?.bookingId);
      
      // Here you can save the booking to database
      // await saveBookingToDatabase(bookingData, razorpay_payment_id);
      
      res.status(200).json({ 
        success: true, 
        message: "Payment verified successfully",
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id
      });
    } else {
      console.warn("❌ Payment verification failed - signature mismatch");
      res.status(400).json({ 
        success: false, 
        message: "Payment verification failed - invalid signature" 
      });
    }
  } catch (error) {
    console.error("❌ Error in payment verification:", error);
    res.status(500).json({ 
      success: false, 
      message: "Payment verification error",
      error: error.message 
    });
  }
});

// GET PAYMENT DETAILS
app.get("/payment/:paymentId", async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await razorpay.payments.fetch(paymentId);
    
    res.status(200).json({
      success: true,
      payment: {
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        created_at: payment.created_at
      }
    });
  } catch (error) {
    console.error("❌ Error fetching payment details:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch payment details" 
    });
  }
});

// RAZORPAY WEBHOOK
app.post("/webhook", (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.warn("⚠️ Webhook secret not configured");
      return res.status(200).send("Webhook received but not verified");
    }

    const signature = req.headers["x-razorpay-signature"];
    const body = JSON.stringify(req.body);

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(body)
      .digest("hex");

    if (signature === expectedSignature) {
      console.log("✅ Webhook verified");
      console.log("📦 Webhook Payload:", req.body);

      const event = req.body.event;
      const payloadData = req.body.payload;

      // Handle different event types
      switch (event) {
        case 'payment.captured':
          console.log("💰 Payment captured:", payloadData.payment.entity.id);
          // Update booking status to confirmed
          break;
        case 'payment.failed':
          console.log("❌ Payment failed:", payloadData.payment.entity.id);
          // Handle failed payment
          break;
        case 'order.paid':
          console.log("✅ Order paid:", payloadData.order.entity.id);
          // Order completed successfully
          break;
        default:
          console.log("📨 Unhandled webhook event:", event);
      }

      res.status(200).send("Webhook processed");
    } else {
      console.warn("❌ Webhook verification failed");
      res.status(400).send("Invalid signature");
    }
  } catch (error) {
    console.error("❌ Webhook error:", error);
    res.status(500).send("Webhook processing error");
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("💥 Unhandled error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found"
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running at http://0.0.0.0:${PORT}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   GET  http://0.0.0.0:${PORT}/`);
  console.log(`   GET  http://0.0.0.0:${PORT}/health`);
  console.log(`   POST http://0.0.0.0:${PORT}/create-order`);
  console.log(`   POST http://0.0.0.0:${PORT}/verify-payment`);
  console.log(`   POST http://0.0.0.0:${PORT}/webhook`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
