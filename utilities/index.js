const invModel = require("../models/inventory-model")
const accountModel = require("../models/account-model")
const jwt = require("jsonwebtoken")
require("dotenv").config()


const Util = {}

/**
 * Construct the nav HTML unordered list
 */

Util.getNav = async function(req, res, next) {
    let data = await invModel.getClassifications()
    let list = "<ul>"
    list += '<li><a href="/" title="Home page">Home</a></li>'
    data.rows.forEach((row) => {
        list += "<li>"
        list += 
            '<a href="/inv/type/' +
            row.classification_id +
            '" title="See our inventory of ' +
            row.classification_name + 
            ' vehichles">' +
            row.classification_name +
            "</a>"
        list += "</li>"
    })
    list += "</ul>"
    return list
}

/**
 * Build the classification view HTML
 */

Util.buildClassificationGrid = async function(data) {
    let grid
    if (data.length > 0) {
        grid = '<ul id="inv-display">'
        data.forEach(vehicle => {
            grid += '<li>'
            grid += '<a href="../../inv/detail/' + vehicle.inv_id
            + '" title="View ' + vehicle.inv_make + ' ' + vehicle.inv_model
            + 'details"><img src="' + vehicle.inv_thumbnail
            + '"alt="Image of ' + vehicle.inv_make + ' ' + vehicle.inv_model 
            + ' on CSE Motors" /></a>'
            grid += '<div class="namePrice">'
            grid += '<hr />'
            grid += '<h2>'
            grid += '<a href="../../inv/detail/' + vehicle.inv_id + '" title="View '
            + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">'
            + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
            grid += '</h2>'
            grid += '<span>$'
            + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
            grid += '</div>'
            grid += '</li>'
        })
        grid += '</ul>'
    } else {
        grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
    }
    return grid
}

/**
 * Middleware for Handling Errors
 * Wrap other function in this for General Error Handling
 */

Util.handleErrors = fn => (req, res, next) => 
    Promise.resolve(fn(req, res, next))
        .catch(next)



/**
 * Build Detail
 */

Util.buildDetail = async function(data) {

    let grid;
    const vehicle = data[0]


    if (data.length != 0) {
        grid = '<div class="deliver-display">'
        grid += '<div>'
        grid += '<img src="' + vehicle.inv_image
            + '"alt="Image of ' + vehicle.inv_make + ' ' + vehicle.inv_model 
            + ' on CSE Motors" />'
        grid += '</div>'
        grid += '<div>'
        grid += '<h2>' + vehicle.inv_make + ' ' + vehicle.inv_model + ' Details</h2>'
        grid += '<p class="deliver-bold">Price: $' + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</p>'
        grid += '<p><span class="deliver-bold">Description:</span> ' + vehicle.inv_description + '</p>'
        grid += '<p><span class="deliver-bold">Color:</span> ' + vehicle.inv_color + '</p>'
        grid += '<p><span class="deliver-bold">Miles:</span> ' + vehicle.inv_miles.toLocaleString('en-US') + '</p>'
        grid += `<button class="add-to-cart" data-id=${vehicle.inv_id}>Add to Cart</button>`
        grid += '</div>'
        grid += '</div>'
    } else {
        grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
    }

    return grid
}


/**
 * Create add inventory form
 */
Util.buildAddInvForm = async function() {

    let addInvForm;
    let data = await invModel.getClassifications()
    console.log("buildAddInvForm data")
    console.log("Data length", data.rows.length)
    console.log(data)
    
    if (data.rows.length > 0) {

        addInvForm = '<section id="inv-class">'

        addInvForm += '<form id="inv-class-form" action="/inv/add-inventory" method="post">'

        addInvForm += '<label for="inv_make"><span class="form-element">Inventory Make:</span></label>'
        addInvForm += '<input type="text" id="inv_make" name="inv_make" required>'

        addInvForm += '<label for="inv_model"><span class="form-element">Inventory Model:</span></label>'
        addInvForm += '<input type="text" id="inv_model" name="inv_model" required>'

        addInvForm += '<label for="inv_year"><span class="form-element">Inventory Year:</span></label>'
        addInvForm += '<input type="text" id="inv_year" name="inv_year" minlength="4" maxlength="4" placeholder="2008" required>'

        addInvForm += '<label for="inv_description"><span class="form-element">Inventory Decription:</span></label>'
        addInvForm += '<textarea id="inv_description" name="inv_description" rows="5" cols="40" required></textarea>'

        addInvForm += '<label for="inv_image"><span class="form-element">Inventory Image:</span></label>'
        addInvForm += '<input type="text" id="inv_image" name="inv_image" value="/images/vehicles/no-image.png" required>'

        addInvForm += '<label for="inv_thumbnail"><span class="form-element">Inventory Thumbnail:</span></label>'
        addInvForm += '<input type="text" id="inv_thumbnail" name="inv_thumbnail" value="/images/vehicles/no-image-tn.png" required>'

        addInvForm += '<label for="inv_price"><span class="form-element">Inventory Price:</span></label>'
        addInvForm += '<input type="number" id="inv_price" name="inv_price" required>'
        
        addInvForm += '<label for="inv_miles"><span class="form-element">Inventory Miles:</span></label>'
        addInvForm += '<input type="number" id="inv_miles" name="inv_miles" required>'

        addInvForm += '<label for="inv_color"><span class="form-element">Inventory Color:</span></label>'
        addInvForm += '<input type="text" id="inv_color" name="inv_color" required>'

        addInvForm += '<label for="classification_id"><span class="form-element">Classification Type:</span></label>'
        addInvForm += '<select id="classification_id" name="classification_id" required>'
        data.rows.forEach((row) => {
            addInvForm += '<option value=' + row.classification_id + '>' + row.classification_name + '</option>'  
        })
        addInvForm += '</select>'

        addInvForm += '<button type="submit" id="inv-class-button">Add Inventory</button>'

        addInvForm += '</form>'

        addInvForm += '</section>'

        return addInvForm


    }


}




/**
 * Middleware to check token validity
 */
Util.checkJWTToken = (req, res, next) => {
    if (req.cookies.jwt) {
        jwt.verify(
            req.cookies.jwt,
            process.env.ACCESS_TOKEN_SECRET,
            function (err, accountData) {
                if (err) {
                    console.log("ERROR DURING LOGIN", err)
                    req.flash("Please log in (Inside checkJWTToken) " + err.message)
                    res.clearCookie("jwt")
                    return res.redirect("/account/login")
                }

                console.log("LOGGGIN IN USER")
                res.locals.accountData = accountData 
                res.locals.loggedin = 1

                next()
            }
        )
    } else {
        next()
    }
}


/**
 * Check Login
 */
Util.checkLogin = (req, res, next) => {
    if (res.locals.loggedin) {
        console.log("LOGGEDIN IS " + res.locals.loggedin)
        next()
    } else {
        req.flash("notice", "Please log in (Inside checkLogin) " + res.locals.loggedin)
        return res.redirect("/account/login")
    }
}


/**
 * Build Account Management View
 */
Util.buildAccountManagementView = async function(userData) {

    // const userData = await accountModel.getUserInfo(account_email)
    // return '<p>You are logged in, ' + userData[0].account_firstname + '!</p>'


}


/**
 * 
 */
Util.buildClassificationList = async function () {
    
    let addInvForm
    let data = await invModel.getClassifications()

    if (data.rows.length > 0) {

        addInvForm = '<section id="select-class">'

        addInvForm += '<form id="select-class-form" action="" method="">'

        addInvForm += '<label for="select_classification_id"><span class="form-element">Select Classification Type:</span></label>'
        addInvForm += '<select id="select_classification_id" name="select_classification_id" required>'
        data.rows.forEach((row) => {
            addInvForm += '<option value=' + row.classification_id + '>' + row.classification_name + '</option>'  
        })
        addInvForm += '</select>'

        addInvForm += '</form>'

        addInvForm += '</section>'

        return addInvForm
    }

}



/**
 * Create add inventory form
 */
Util.buildEditInvForm = async function(itemData) {

    console.log("\n\nEdit Inv Form")
    console.log(itemData)
    console.log("\n\n")

    let data = await invModel.getClassifications()
    let addInvForm;
    
    if (itemData && data.rows.length > 0) {

        addInvForm = '<section id="inv-class">'

        addInvForm += '<form id="inv-class-form" class="updateForm" action="/inv/update" method="post">'

        addInvForm += '<label for="inv_id" class="hidden-label"><span class="form-element">Inventory Make:</span></label>'
        addInvForm += `<input type="hidden" name="inv_id" value=${itemData.inv_id}>`

        addInvForm += '<label for="inv_make"><span class="form-element">Inventory Make:</span></label>'
        addInvForm += `<input type="text" id="inv_make" name="inv_make" required value=${itemData.inv_make}>`

        addInvForm += '<label for="inv_model"><span class="form-element">Inventory Model:</span></label>'
        addInvForm += `<input type="text" id="inv_model" name="inv_model" required value=${itemData.inv_model}>`

        addInvForm += '<label for="inv_year"><span class="form-element">Inventory Year:</span></label>'
        addInvForm += `<input type="text" id="inv_year" name="inv_year" minlength="4" maxlength="4" required value=${itemData.inv_year}>`

        addInvForm += '<label for="inv_description"><span class="form-element">Inventory Decription:</span></label>'
        addInvForm += `<textarea id="inv_description" name="inv_description" rows="5" cols="40" required>${itemData.inv_description}</textarea>`

        addInvForm += '<label for="inv_image"><span class="form-element">Inventory Image:</span></label>'
        addInvForm += '<input type="text" id="inv_image" name="inv_image" value="/images/vehicles/no-image.png" required>'

        addInvForm += '<label for="inv_thumbnail"><span class="form-element">Inventory Thumbnail:</span></label>'
        addInvForm += '<input type="text" id="inv_thumbnail" name="inv_thumbnail" value="/images/vehicles/no-image-tn.png" required>'

        addInvForm += '<label for="inv_price"><span class="form-element">Inventory Price:</span></label>'
        addInvForm += `<input type="number" id="inv_price" name="inv_price" required value=${itemData.inv_price}>`
        
        addInvForm += '<label for="inv_miles"><span class="form-element">Inventory Miles:</span></label>'
        addInvForm += `<input type="number" id="inv_miles" name="inv_miles" required value=${itemData.inv_miles}>`

        addInvForm += '<label for="inv_color"><span class="form-element">Inventory Color:</span></label>'
        addInvForm += `<input type="text" id="inv_color" name="inv_color" required value=${itemData.inv_color}>`

        addInvForm += '<label for="classification_id"><span class="form-element">Classification Type:</span></label>'
        addInvForm += '<select id="classification_id" name="classification_id" required>'
        data.rows.forEach((row) => {
            let isSelected = row.classification_id === itemData.classification_id ? "selected" : "";
            addInvForm += `<option value="${row.classification_id}" ${isSelected}>${row.classification_name}</option>` 
        })
        addInvForm += '</select>'

        addInvForm += '<button type="submit" id="inv-class-button">Update Vehicle</button>'

        addInvForm += '</form>'

        addInvForm += '</section>'

        return addInvForm


    }
}




Util.buildDeleteInvForm = async function(itemData) {

    console.log("\n\nEdit Inv Form")
    console.log(itemData)
    console.log("\n\n")

    let data = await invModel.getClassifications()
    let addInvForm;
    
    if (itemData && data.rows.length > 0) {

        addInvForm = '<section id="inv-class">'

        addInvForm += '<form id="inv-class-form" class="updateForm" action="/inv/delete" method="post">'

        addInvForm += '<label for="inv_id" class="hidden-label"><span class="form-element">Inventory Make:</span></label>'
        addInvForm += `<input type="hidden" name="inv_id" value=${itemData.inv_id} readonly>`

        addInvForm += '<label for="inv_make"><span class="form-element">Inventory Make:</span></label>'
        addInvForm += `<input type="text" id="inv_make" name="inv_make" required value=${itemData.inv_make} readonly>`

        addInvForm += '<label for="inv_model"><span class="form-element">Inventory Model:</span></label>'
        addInvForm += `<input type="text" id="inv_model" name="inv_model" required value=${itemData.inv_model} readonly>`

        addInvForm += '<label for="inv_year"><span class="form-element">Inventory Year:</span></label>'
        addInvForm += `<input type="text" id="inv_year" name="inv_year" minlength="4" maxlength="4" required value=${itemData.inv_year} readonly>`

        addInvForm += '<label for="inv_price"><span class="form-element">Inventory Price:</span></label>'
        addInvForm += `<input type="number" id="inv_price" name="inv_price" required value=${itemData.inv_price} readonly>`       

        addInvForm += '<button type="submit" id="inv-class-button">Delete Vehicle</button>'

        addInvForm += '</form>'

        addInvForm += '</section>'

        return addInvForm


    }
}

/**
 * Check for Admin or Employee
 */
Util.checkAdmin = (req, res, next) => {
    const token = req.cookies.jwt

    if (!token) {
        req.flash("notice", "You must be logged in to access this page")
        return res.redirect("/account/login")
    }

    try {
        const accountData = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        if (accountData.account_type === "Employee" || accountData.account_type === "Admin") {
            next()
        } else {
            req.flash("notice", "You do not have permission to access this page.")
            return res.redirect("/account/management")
        }
    } catch {
        req.flash("notice", "Invalid session. Please log in again")
        return res.redirect("/account/login")
    }
}


// Util.buildUpdateAccountForm = async function (data) {

//     let addInvForm;

//     if (data) {

//         addInvForm = '<section id="login-signup">'
//         addInvForm += `<form action="/account/update" id="login-signup-form" method="post">`
//         addInvForm += `<label for="account_firstname"><span class="form-element">First Name:</span></label>`
//         addInvForm += ` <input type="text" name="account_firstname" id="account_firstname" required value="${data.account_firstname}">`
//         addInvForm += `<label for="account_lastname"><span class="form-element">Last Name:</span></label>`
//         addInvForm += `<input type="text" name="account_lastname" id="account_lastname" required value="${data.account_lastname}">`
//         addInvForm += `<label for="account_email"><span class="form-element">Email:</span></label>`
//         addInvForm += `<input type="email" name="account_email" id="account_email" required value="${data.account_email}">`

//         addInvForm += `<div id="pswd-box">`
//         addInvForm += `<label for="account_password"><span class="form-element">Password:</span></label>`
//         addInvForm += `<span id="pswd-text">Password must be at least 12 characters, contain 1 uppercase letter, 1 number, and 1 special character</span>`
//         addInvForm += `<input type="password" name="account_password" id="account_password" minlength="12" pattern="^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{12,}$" title="Password must be at least 12 characters, contain 1 uppercase letter, 1 number, and 1 special character." required>`
//         addInvForm += `</div>`
    
//         addInvForm += `<button type="submit" id="register-button">Update</button>`
//         addInvForm += `<button id="show-hide" type="button">Show Password</button>`
//         addInvForm += `</form>`
//         addInvForm += `</section>`

//     }
//     return addInvForm
// }
    

Util.buildUpdateAccountForm = async function (data) {

    let addInvForm;

    if (data) {

        addInvForm = '<section id="login-signup">'
        addInvForm += `<form action="/account/update" id="login-signup-form" method="post">`
        addInvForm += `<label for="account_firstname"><span class="form-element">First Name:</span></label>`
        addInvForm += ` <input type="text" name="account_firstname" id="account_firstname" required value="${data.account_firstname}">`
        addInvForm += `<label for="account_lastname"><span class="form-element">Last Name:</span></label>`
        addInvForm += `<input type="text" name="account_lastname" id="account_lastname" required value="${data.account_lastname}">`
        addInvForm += `<label for="account_email"><span class="form-element">Email:</span></label>`
        addInvForm += `<input type="email" name="account_email" id="account_email" required value="${data.account_email}">`

        addInvForm += `<div id="pswd-box">`
        addInvForm += `<label for="account_password"><span class="form-element">Password:</span></label>`
        addInvForm += `<span id="pswd-text">Password must be at least 12 characters, contain 1 uppercase letter, 1 number, and 1 special character</span>`
        addInvForm += `<input type="password" name="account_password" id="account_password" pattern="^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{12,}$" title="Password must be at least 12 characters, contain 1 uppercase letter, 1 number, and 1 special character." required>`
        addInvForm += `</div>`

        addInvForm += `<button type="submit" id="register-button">Update</button>`
        addInvForm += `<button id="show-hide" type="button">Show Password</button>`
        addInvForm += `</form>`
        addInvForm += `</section>`

    }
    return addInvForm
}

    
    
    
    
        
        
        
       
          
       
    



module.exports = Util