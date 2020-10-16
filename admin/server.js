const express = require("express");
const { pool } = require("./dbConfig");
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
require("dotenv").config();
const app = express();
const nodemailer = require('nodemailer');

const ROLES = {
    admin: 'admin',
    users: 'users'
  }

const PORT = process.env.PORT || 5000;

const initializePassport = require("./passportConfig");

initializePassport(passport);

app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.static("static"));

app.use(
    session({
        secret: 'secret',
        resave: false,
        saveUninitialized: false
    })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.get("/", (req, res) => {
    res.render("landingpage");
});

app.get("/users/register", checkAuthenticated, (req, res) => {
    res.render("register.ejs");
});

app.get("/users/login", checkAuthenticated, (req, res) => {
    res.render("login.ejs");
});

app.get("/student",  (req, res) => {
    res.render("studentpage.ejs");
});

app.get("/adminpage", checkNotAuthenticatedAsAdmin, (req, res) => {
    res.render("adminpage.ejs");
});

app.get("/admin/login", checkAuthenticated, (req, res) => {
    res.render("adminlogin.ejs");
});

app.get("/users/dashboard", checkNotAuthenticated, (req, res) => {
    res.render("dashboard", { user: req.user.name });
});

app.get("/users/logout", (req, res) => {
    req.logOut();
    res.render("landingpage", { message: "You have logged out successfully" });
});

app.get("/admin/logout", (req, res) => {
    req.logOut();
    res.render("landingpage", { message: "You have logged out successfully" });
});

app.get("/admin/mail", checkNotAuthenticatedAsAdmin, (req, res) => {
    res.render("mail");
})

app.post("/users/register", async (req, res) => {
    let { name, email, password, password2 } = req.body;

    let errors = [];

    console.log({
        name,
        email,
        password,
        password2
    });

    if (!name || !email || !password || !password2) {
        errors.push({ message: "Please enter all fields" });
    }

    if (password.length < 6) {
        errors.push({ message: "Password must be a least 6 characters long" });
    }

    if (password !== password2) {
        errors.push({ message: "Passwords do not match" });
    }

    if (errors.length > 0) {
        res.render("register", { errors, name, email, password, password2 });
    } else {
        hashedPassword = await bcrypt.hash(password, 10);
        console.log(hashedPassword);
        pool.query(
            `SELECT * FROM users
            WHERE email = $1`,
            [email],
            (err, results) => {
                if (err) {
                    console.log(err);
                }
                console.log(results.rows);

                if (results.rows.length > 0) {
                    errors.push({ message: "Email already registered" });
                    return res.render("register", { errors, name, email, password, password2 });
                } else {
                    pool.query(
                        `INSERT INTO users (name, email, password, isadmin)
                        VALUES ($1, $2, $3, $4)
                        RETURNING id, password`,
                        [name, email, hashedPassword, '0'],
                        (err, results) => {
                            if (err) {
                                throw err;
                            }
                            console.log(results.rows);
                            req.flash("success_msg", "You are now registered. Please log in.");
                            res.redirect("/users/login");
                        }
                    );
                }
            }
        );
    }
});


app.post("/admin/mail", async (req, res) => {
    let { subject, mailbody} = req.body;

    let errors = [];

    console.log({
        subject, mailbody
    });

    if (!subject || !mailbody) {
        errors.push({ message: "Please enter all fields" });
    }

    if (errors.length > 0) {
        res.render("mail", { errors, subject, mailbody });
    } else {
        pool.query(
            `SELECT email FROM users WHERE isadmin = FALSE`,
            [],
            (err, results) => {
                if (err) {
                    console.log(err);
                }
                if (results.rows.length == 0) {
                    errors.push({ message: "No student registered" });
                    return res.render("mail", { errors, subject, mailbody });
                } else {
                    console.log(results.rows);

                    let emails = [];

                    for (x of results.rows) {
                        emails.push(x['email']);
                    }

                    console.log(emails.join(', '));

                    var transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: 'tpodept@gmail.com',
                            pass: 'tpodept@2020'
                        }
                    });

                    var mailOptions = {
                        from: 'tpodept@gmail.com',
                        to: emails.join(', '), //Tanvee get the receiver's email ids here
                        subject: subject,
                        text: mailbody
                    };

                    transporter.sendMail(mailOptions, function(error, info){
                        if (error) {
                            console.log(error);
                        } else {
                            console.log('Email sent: ' + info.response);
                        }
                    });

                    req.flash("success_msg", "Emails have been sent.");
                    res.redirect("/admin/mail");
                }
            }
        );
    }
});

app.post("/users/login", passport.authenticate('users', {
    successRedirect: "/student",
    failureRedirect: "/users/login",
    failureFlash: true
  })
);

app.post("/admin/login", passport.authenticate('admin', {
    successRedirect: "/adminpage",
    failureRedirect: "/admin/login",
    failureFlash: true
  })
);

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        if (req.user.isadmin)
            return res.redirect("/adminpage");
        else
            return res.redirect("/student");
    }
    next();
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/users/login");
}

// function checkAuthenticatedAsAdmin(req, res, next) {
//     if (req.isAuthenticated()) {
//         return res.redirect
//     }
//     next();
// }

function checkNotAuthenticatedAsAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.isadmin ) {
        return next();
    }
    if (req.isAuthenticated())
        req.logOut();
    res.redirect("/admin/login");
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});