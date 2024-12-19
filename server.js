require('dotenv').config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const stripe = require("stripe")('sk_test_51QWcqiSHszh1D4vFLQE0bThUZ9OAiOsR5RmICKY7ug63tYnsYxbJR6dGtWQGS7IeqyxYqSFD4fr2eyr6krrZXCSI00x2uNnQ3Y'); // Use test key

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

// Helper function to calculate the total amount
const calculateTotalOrderAmount = (items) => {
    return items[0].amount * 100;  // Convert to paise (INR minor units)
};

app.post("/create-payment-intent", async (req, res) => {
    const { items, customerDetails } = req.body;

    try {
        // Create a payment intent in INR for domestic payments
        const paymentIntent = await stripe.paymentIntents.create({
            amount: calculateTotalOrderAmount(items),  // Amount in paise (100 = 1 INR)
            currency: "inr",  // Set currency to INR for domestic payments
            description: "Payment for your order",
            automatic_payment_methods: {
                enabled: true,  // Enable support for various payment methods (cards, UPI)
            },
            shipping: {
                name: customerDetails.name,
                address: {
                    line1: customerDetails.address,
                    city: customerDetails.city,
                    postal_code: customerDetails.pin_code,
                    state: customerDetails.state,
                    country: customerDetails.country,
                },
            },
        });

        res.send({
            clientSecret: paymentIntent.client_secret,  // Send the client secret to the frontend
        });
    } catch (error) {
        console.error("Error creating payment intent:", error);
        res.status(500).send({ error: error.message });  // Send error message to frontend
    }
});

app.listen(PORT, () => {
    console.log(`Server started on PORT ${PORT}`);
});
