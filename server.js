/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const utilities = require("./utilities/")
const session = require("express-session")
const pool = require("./database/")
const accountRoute = require("./routes/accountRoute")
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
const jwt = require("jsonwebtoken")



/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout")


/***********************
 * Middleware
 ***********************/
app.use(session({
  store: new (require("connect-pg-simple")(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: "sessionId",
}))

// Express Message MiddleWare
app.use(require("connect-flash")())
app.use(function(req, res, next){
  res.locals.messages = require("express-messages")(req, res)
  next()
})

// Body Parser MiddleWare
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Cookie Parser
app.use(cookieParser())

// Middleware to check authentication and pass user info to views
app.use((req, res, next) => {
  const token = req.cookies.jwt;

  if (token) {
      try {
          const userData = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

          console.log("Print User Data")
          console.log(userData)
          
          res.locals.clientLoggedIn = true;
          res.locals.yourName = userData.account_firstname || "Basic";
          res.locals.accountType = userData.account_type
          res.locals.accountId = userData.account_id
      } catch (err) {
          res.locals.clientLoggedIn = false;
          res.locals.yourName = "Guest";
          res.locals.accountType = "Client"
      }
  } else {
      res.locals.clientLoggedIn = false;
      res.locals.yourName = "Guest";
      res.locals.accountType = "Client"
  }

  console.log(`clientLoggedIn: ${res.locals.clientLoggedIn}, userName: ${res.locals.yourName},
    accountType: ${res.locals.accontType}`);
  next();
});


// JWT MiddleWare
app.use(utilities.checkJWTToken)




/* ***********************
 * Routes
 *************************/
app.use(static)


// Index route
app.get("/", utilities.handleErrors(baseController.buildHome))
// app.get("/", function(req, res) {
//   res.render("index", {title: "Home"})
// })

// Inventory route
app.use("/inv", inventoryRoute)

// Account route
app.use("/account", accountRoute)







// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({status: 404, message: "Sorry, we appear to have lost that page."})
})


/*************************
 * Express Error Handler
 * Placed after all other middleware
 *************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  
  if (err.status == 404) message = err.message
  else message = "Oh no! There was a crash. Maybe try a different route?"
  
  res.render("errors/error", {
    title: err.status || 'Server Error',
    message,
    nav
  })
})


/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
