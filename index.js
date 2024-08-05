const express = require("express");
const app = express();
const cors = require("cors");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

dotenv.config();

const User = require("./models/User"); // Ensure this path is correct

app.use(cors()); // Enable CORS
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Test route
app.get("/test", (req, res) => {
    res.send("Back-end link is worked");
});

app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const existingUser = await User.findOne({ name: username });
        if (existingUser) {
            return res.status(400).send({ message: "User already exists. Please choose a different username" });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUser = new User({ name: username, password: hashedPassword });
        await newUser.save();
        res.status(201).send({ message: "User registered successfully" });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).send({ message: "Server error" });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ name: username });
        if (!user) {
            return res.status(400).send({ message: "Username not found" });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).send({ message: "Wrong password" });
        }

        res.status(200).send({ message: "Login successful" });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).send({ message: "Server error" });
    }
});

app.post('/create-payment-intent', async (req, res) => {
    try {
        const { amount, paymentMethodId } = req.body;
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'usd',
            payment_method: paymentMethodId,
            confirm: true,
        });
        res.status(200).send({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error("Error creating payment intent:", error);
        res.status(500).send({ message: "Server error" });
    }
});

// Contact form submission route
app.post('/contact', (req, res) => {
    const { name, email, message } = req.body;

    // Here you would normally save the data to a database or send it via email
    console.log("Received contact form submission:", { name, email, message });

    res.status(200).send({ message: "Form submitted successfully" });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Database connection
mongoose.connect(process.env.MONGODB)
    .then(() => {
        console.log("Database connected successfully");
    })
    .catch((err) => {
        console.error("DB connection error:", err);
    });
