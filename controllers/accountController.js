const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()


/**
 * Deliver login view
 */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    res.render("./account/login", {
        title: "Login",
        nav,
        errors: null,
    })
}


/**
 * Deliver registration view
 */
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/register", {
        title: "Register",
        nav,
        errors: null,
    })
}


/**
 * Process registration
 */
async function registerAccount(req, res) {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password } = req.body

    // Hash the password before registering/storing
    let hashedPassword

    try {
        // regular password and cost (salt is generated automatically)
        hashedPassword = bcrypt.hashSync(account_password, 10)
    } catch (error) {
        req.flash(
            "notice", 
            "Sorry, there was an error processing the registration."
        )
        res.status(500).render("account/register", {
            title: "Register",
            nav,
            errors: null,
        })

    }

    const regResult = await accountModel.registerAccount(
        account_firstname, account_lastname, account_email, hashedPassword
    )

    if (regResult) {
        req.flash(
            "notice",
            `Congratulations, you\'re registered ${account_firstname}. Please log in.`   
        )
        res.status(201).render("account/login", {
            title: "Login",
            nav,
            errors: null,
        })
    } else {
        req.flash(
            "notice", "Sorry, the registration failed."
        )
        res.status(501).render("account/register", {
            title: "Register",
            nav,
        })
    }
}


/**
 * Process login
 */
// async function processLogin(req, res) {
//     let nav = await utilities.getNav()
//     const { account_email, account_password } = req.body

//     const loginResult = await accountModel.checkAccountPassword(account_email, account_password)

//     if (loginResult) {

//         const userData = await accountModel.getUserInfo(account_email)

//         req.flash(
//             "notice", `Welcome Back, ${userData[0].account_firstname}! Login was successful!`
//         )
//         res.status(201).render("index", {
//             title: "Home",
//             nav,
//         })
//     } else {
//         req.flash(
//             "notice", "Unauthorized access. Wrong email or password"
//         )
//         res.status(401).render("account/login", {
//             title: "Login",
//             nav,
//             errors: null,
//         })
//     }
// }


async function processLogin(req, res) {
    let nav = await utilities.getNav()
    const { account_email, account_password } = req.body

    const accountData = await accountModel.getAccountByEmail(account_email)

    // req.session.account_email = req.body.account_email

    if (!accountData) {
        req.flash("notice", "Please check your credentials and try again.")

        res.status(400).render("account/login", {
            title: "Login",
            nav,
            errors: null,
            account_email,
        })

        return
    }

    try {

        if (await bcrypt.compare(account_password, accountData.account_password)) {

            delete accountData.account_password

            const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })

            if (process.env.NODE_ENV === "development") {
                
                res.cookie(
                    "jwt",
                    accessToken,
                    { httpOnly: true, secure: true, maxAge: 3600 * 1000 }
                )
            }

            return res.redirect("/account/management")
            
        } else {

            req.flash(
                "message notice",
                "Please check your credentials and try again."
            )

            res.status(400).render("account/login", {
                title: "Login",
                nav,
                errors: null,
                account_email,
            })
        }
    } catch (error) {
        throw new Error("Access Forbidden.")
    }
    
}



/**
 * Deliver account management view
 */
async function buildAccountManagement(req, res, next) {
    
    let nav = await utilities.getNav()

    // const account_email = req.session.account_email
    // let userName = await utilities.buildAccountManagementView(account_email)

    const token = req.cookies.jwt

    try {
        const userData = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        
        res.render("account/management", {
            title: "Account Management",
            nav,
            errors: null,
            // userName,
        })
    } catch (error) {
        console.error("Build Account Management Error: " + error)
    }
   
}


/**
 * Build Update Account View
 */
async function buildUpdateAccount(req, res, next) {

    const token = req.cookies.jwt
    let nav = await utilities.getNav()

    try {

        const userData = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const account_id = userData.account_id

        const dataForUserID = await accountModel.getAccountByAccountID(account_id)
        console.log("Data for User ID in Build Update Form Account Controller")
        console.log(dataForUserID)
        const updateAccountForm = await utilities.buildUpdateAccountForm(dataForUserID)


        res.render("account/update", {
            title: "Update Account",
            nav,
            errors: null,
            updateAccountForm,
        })
    }  catch (error) {
        console.error("Build Update Account Error: " + error)
    }
}

/**
 * Process Update Account
 */
async function processUpdateAccount(req, res, next) {


    const token = req.cookies.jwt

    const userData = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

    const account_id = userData.account_id
    // const account_firstname = userData.account_firstname
    // const account_lastname = userData.account_lastname
    // const account_email = userData.account_email

    const { account_firstname, account_lastname, account_email, account_password } = req.body;

    console.log("ReQ Body before passing to account model update account -----------")
    console.log(req.body)

    res.locals.accountData.account_firstname = account_firstname
    res.locals.accountData.account_lastname = account_lastname 
    res.locals.accountData.account_email = account_email 

    let newUserData = req.body
    delete newUserData.account_password
    newUserData.account_id = userData.account_id

    // res.locals.accountData = newUserData


    const hashedPassword = bcrypt.hashSync(account_password, 10)

    const updateAccount = await accountModel.updateAccount(
        account_id, account_firstname, account_lastname, account_email, hashedPassword
    )

    console.log("\n\nInse Process Update Account in account controller")
    console.log(updateAccount)

    if (updateAccount) {

        const updatedToken = jwt.sign(newUserData,
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: 3600 * 1000 }
        )    
        
        if (process.env.NODE_ENV === "development") {
            res.cookie("jwt", updatedToken, {
                httpOnly: true,
                secure: true, 
                maxAge: 3600 * 1000,
            });
        }
        
        res.locals.accountData = newUserData;

        req.flash("notice", "Your account was updated")
        return res.redirect("/account/management")

    } else {

        const token = req.cookies.jwt
        let nav = await utilities.getNav()

        try {

            const userData = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

            console.log("\n\nInside process Update Account in account controller")
            console.log(userData)

            delete userData.account_password

            res.locals.accountData = userData

            const account_id = userData.account_id

            const dataForUserID = await accountModel.getAccountByAccountID(account_id)
        
            const updateAccountForm = await utilities.buildUpdateAccountForm(parseInt(dataForUserID))


            res.render("account/update", {
                title: "Update Account",
                nav,
                errors: null,
                updateAccountForm,
            })

        }  catch (error) {
            console.error("Build Update Account Error: " + error)
        }

    }
}



module.exports = { buildLogin, buildRegister, registerAccount, processLogin, buildAccountManagement, buildUpdateAccount, processUpdateAccount }