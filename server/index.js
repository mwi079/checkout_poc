const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config({ path: ".env.local" });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

app.post("/api/create-payment", async (req, res) => {
  const { amount, currency, billing } = req.body;
  try {
    const response = await axios.post(
      "https://api.sandbox.checkout.com/payment-sessions",
      {
        amount,
        currency,
        billing,
        success_url: "http://localhost:5173/success", // not required for card payments but valid URL still required in request
        failure_url: "http://localhost:5173/woops", // not required for card payments but valid URL still required in request
        processing_channel_id: "pc_v7qijqm475oerphf2cmp2ho27y", // from dashboard
        enabled_payment_methods: ["card"], //assuming only card payments on day 1
        reference: "sausage123", // orderNumber?
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.CHECKOUT_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.log(error.response.data);
    res.status(500).json({ error: "Payment processing failed" });
  }
});

app.get("/api/paymentDetails/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const response = await axios.get(
      `https://api.sandbox.checkout.com/payments/${id}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CHECKOUT_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    res.status(200).json(response.data);
  } catch (error) {
    console.log(error.response.data);
    res.status(500).json({ error: "Getting payment details failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
