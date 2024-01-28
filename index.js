import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import Jwt from "jsonwebtoken";
import bcrypt from "bcrypt"

const app = express();
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser());

const isAuthanticate = async (req, res, next) => {
    const { token } = req.cookies;
    console.log(token)
    if (token) {
        const decode = Jwt.verify(token, "asdfghjklasd")
        req.user = await User.findById(decode._id)
        console.log(req.user)
        next();
    }
    else {
        console.log("this is running")
        res.render("login.ejs")

    }
}

mongoose.connect("mongodb://127.0.0.1:27017", { dbName: "Backend", })
    .then(() => { console.log("Connected DB") })
    .catch(e => console.log(e))

// const user = [];

const UserSchema = mongoose.Schema({
    name: String,
    email: String,
    password: String
})

const User = mongoose.model("User", UserSchema)


app.get("/", isAuthanticate, (req, res) => {
    res.render("logout.ejs", { name: req.user.name })
})

app.get("/logout", (req, res) => {

    res.cookie("token", null, { expires: new Date(Date.now()) })
    res.redirect("/")

})

app.get("/register", (req, res) => {
    res.render("register.ejs")
})
app.post("/register", async (req, res) => {

    const { name, email, password } = req.body
    let user = await User.findOne({ email })
    if (user) {
        return res.redirect("/login")
    }

    const EncryptedPassword = await bcrypt.hash(password, 10)
    console.log(EncryptedPassword, "password")
    user = await User.create({
        name,
        email,
        password: EncryptedPassword
    })
    console.log(user)
    res.redirect("/")


    // const token = Jwt.sign({_id: user._id},"asdfghjklasd")


    // console.log(req.body)
    // res.cookie("token", token, { httpOnly: true, expires: new Date(Date.now() + 60 * 1000) })
    // console.log(req.cookies)

})

app.get("/login", (req, res) => {
    res.render("login.ejs")
})
app.post("/login", async (req, res) => {
    const { email, password } = req.body
    let user = await User.findOne({ email })

    if (!user) {
        return res.redirect("/register")
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if (isMatch) {
        console.log("USER exist")
        const token = Jwt.sign({ _id: user._id }, "asdfghjklasd")


        console.log(req.body)
        res.cookie("token", token, { httpOnly: true, expires: new Date(Date.now() + 60 * 1000) })
        res.redirect("/")
        console.log(req.cookies)
    }
    else {
        res.render("login.ejs", { message: "Incorrect Password" })
    }
})

// app.get("/contact", (req, res) => {
//     res.send("Number Lega kya ")
// })
// app.get('/success', (req, res) => {
//     res.render("success.ejs")
// })

// app.get("/add", (req, res) => {

//     Messge.create({ name: "RamPrakesh", email: "Ramjilal@gmail.com" }).then(res.send("nice"))
// })

// app.post("/", (req, res) => {
//     console.log(req.body)
//     Messge.create({ name: req.body.name, email: req.body.email }).then(res.redirect("/success"))
// })
// app.get('/user', (req, res) => {
//     res.json(user)
// })


app.listen(5000, () => {
    console.log("Server is running")
})






