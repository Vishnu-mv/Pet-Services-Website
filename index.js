require('dotenv').config()
const express = require('express');
const app = express();
const bcrypt = require('bcryptjs')
const path = require('path');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const alert = require('alert')
const cookieParser = require('cookie-parser');


const authenticate = require('./middleware/authenticate');
const Signupmodel = require("./model/signup")
const bookingModel = require('./model/Bookings')
const contactmodel = require('./model/contact');

app.use(express.json());    //middleware for json
app.use(express.urlencoded({ extended: false }));   //middleware to handle urlencoded from data
app.use(cookieParser());    //middleware to use cookie-parser

mongoose.connect('mongodb://127.0.0.1:27017/vishnu', { useNewUrlParser: true, useUnifiedTopology: true });

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('Connection to mongoDB successful!');
})


const { homedir } = require('os');
const Bookings = require('./model/Bookings');


// //serving static files
app.use(express.static(__dirname + '/Home'));
app.use(express.static(__dirname + '/About'));
app.use(express.static(__dirname + '/signIn'));
app.use(express.static(__dirname + '/signUp'));




app.get('^/$|/signUp/signUp.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'view', 'signUp.html'))
})

app.get('/home/home.html', authenticate, (req, res) => {
    res.header('Cache-Control', 'private,no-cache,no-store,must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    res.sendFile(path.join(__dirname, 'view', 'Home.html'))
})

app.get('/about/about.html', authenticate, (req, res) => {
    res.sendFile(path.join(__dirname, 'view', 'About.html'))

})

app.get('/services', authenticate, (req, res) => {
    res.sendFile(path.join(__dirname, 'view', 'service.html'))
})

app.get('/booking', authenticate, (req, res) => {
    res.sendFile(path.join(__dirname, 'view', 'Bookings.html'));
})


app.get('/signin', (req, res) => {
    res.sendFile(path.join(__dirname, 'view', 'signIn.html'));

})


app.get('/contactus', authenticate, (req, res) => {
    res.sendFile(path.join(__dirname, 'view', 'contact.html'));

})

app.get('/logout', authenticate, async (req, res) => {
    res.clearCookie("jwtoken");
    alert("Logged out Successfully");
    await req.rootUser.save();
    res.sendFile(path.join(__dirname, 'view', 'signUp.html'));
})

app.get("/mybookings(.html)?", authenticate, async (req, res) => {
    const userdet = await Signupmodel.findOne({ "tokens.token": req.cookies.jwtoken });
    const Mobile = userdet.Mobile;
    console.log(Mobile)
    const allbookings = await bookingModel.find({ mobile: Mobile });
    if (allbookings === null) {
        alert("no bookings");
    } else {
        console.log(allbookings);
        res.setHeader("Content-type", "text/html");
        res.write('<h1 style="text-align: center;">My bookings</h1>');
        allbookings.forEach(element => {
            res.write('<html>' + '<head> <style>' + 'body{background-color: gainsboro;font-size:1.5rem;min-width: 100vh;display: flex;justify-content: center;align-items: center;flex-flow: column nowrap;}.card{border: 3px solid black;border-radius: 1rem;width:50%;padding:2rem;margin:1rem;text-align:center;}' + '</style></head>' + '<body>' + '<section class="card">' + '<span>User-name : </span>' + element.userName + '<br>' + '<span>Pet-name : </span>' + element.petName + '<br>' + '<span>Service : </span>' + element.service + '<br>' + '<span>Time-slot : </span>' + element.time + '<br>' + '</section>' + '</body>' + '</html>');
        });
    }
});

app.post("/login", async (req, res) => {

    try {
        const { Mobile, Password } = req.body;

        if (!Mobile || !Password) {
            return res.status(422).json({ error: "Pls Fill The Fields Properly" });
        }
        const userMobile = await Signupmodel.findOne({ Mobile: Mobile })    //1st is db and 2nd is user entered
        if (userMobile) {

            const hashpwd = await bcrypt.compare(Password, userMobile.Password)
            if (hashpwd) {
                // Generate Tokens
                const token = await userMobile.generateAuthToken();
                console.log(token);
                // Store Tokens In Cookies
                res.cookie("jwtoken", token, {
                    expires: new Date(Date.now() + 25892000000),
                    httpOnly: true
                });
                // const accessToken=jwt.sign(
                //     {"Mobile":userMobile.Mobile},
                //     process.env.ACCESS_TOKEN_SECRET,
                //     {expiresIn:'30s'}
                // );

                // const refreshTokens=jwt.sign(
                //     {"Mobile":userMobile.Mobile},
                //     process.env.REFRESH_TOKEN_SECRET,
                //     {expiresIn:'1d'}
                // );
                res.status(201).sendFile('./Home/Home.html', { root: __dirname });
                res.redirect('/Home/Home.html')
            } else {
                alert('Invalid credentials');
                res.sendStatus(401);
            }
        } else {
            return res.status(422).json({ error: "Invalid credentials" })
        }
    } catch (err) {
        console.log(err)
        res.status(400).json({ error: "error" });
    }
})

app.post("/register", async (req, res) => {
    const { UserName, email, Mobile, Password } = req.body
    if (!UserName || !email || !Mobile || !Password) {
        return res.status(422).json({ error: "Pls Fill The Fields Properly" });
    }
    try {
        const userExist = await Signupmodel.findOne({ Mobile: Mobile });
        if (userExist) {
            alert("User Already Exists")
        }
        else {
            const saveUser = new Signupmodel({ UserName, email, Mobile, Password });
            // Bcrypt middleware
            const saved = await saveUser.save();
            res.status(201).sendFile(path.join(__dirname, 'view', 'signIn.html'));

        }
    } catch (error) {
        res.status(400).send(error);
    }

})

app.post('/booking', async (req, res) => {
    const { petName, date, time, service } = req.body
    try {
        const timeslot = await bookingModel.findOne({ date: date, time: time, service: service });
        if (timeslot) {
            return res.status(422).json({ error: "Sorry this slot is already Booked" })
        } else {
            const userdet = await Signupmodel.findOne({ "tokens.token": req.cookies.jwtoken });
            console.log(userdet)
            const mobile = userdet.Mobile;
            const userName = userdet.UserName;

            const saveBooking = new bookingModel({ petName, mobile, userName, date, time, service });
            saveBooking.save();
            alert('Slot Booked');
            res.redirect(301, './Home/Home.html')
        }
    } catch (error) {
        console.log(error)
    }
})


app.post('/contactus', async (req, res) => {
    const { email, message } = req.body;
    const userdet = await Signupmodel.findOne({ "tokens.token": req.cookies.jwtoken });
    const mobile = userdet.Mobile;
    const name = userdet.UserName;
    try {
        const saveMessage = new contactmodel({ name, mobile, email, message });
        saveMessage.save();
        alert('Your Response Received');
        res.redirect(301, './Home/Home.html')
    } catch (error) {
        console.log(error)
    }
})


app.listen(3000, () => {
    console.log("listening to port 3500")
}
);
