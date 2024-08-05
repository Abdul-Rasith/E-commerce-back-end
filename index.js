const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcrypt");
const collection = require("./Schema");
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.use(cors()); // Enable CORS
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


//checking process
app.get("/test",(req,res)=>{
    res.send("Back-end link is worked")
})

app.post('/register', async (req, res) => {
    const data = { name: req.body.username, password: req.body.password };
    const existingUser = await collection.findOne({ name: data.name });
    if (existingUser) {
        res.send("User already exists. Please choose a different username");
    } else {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);
        data.password = hashedPassword;
        await collection.insertMany(data);
        res.send({ message: "User registered successfully" });
    }
});

app.post('/login', async (req, res) => {
    try {
        const check = await collection.findOne({ name: req.body.username });
        if (!check) {
            res.send("Username not found");
        } else {
            const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
            if (isPasswordMatch) {
                res.send({ message: "Login successful" });
            } else {
                res.send("Wrong password");
            }
        }
    } catch (err) {
        console.log(err);
    }
});

app.post('/create-payment-intent', async (req, res) => {
    const { amount, paymentMethodId } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        payment_method: paymentMethodId,
        confirm: true,
    });
    res.send({ clientSecret: paymentIntent.client_secret });
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
