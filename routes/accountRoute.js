const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const utilities = require("../utilities/")
const regValidate = require("../utilities/account-validation")


router.get("/login/", utilities.handleErrors(accountController.buildLogin));

router.get("/register/", utilities.handleErrors(accountController.buildRegister));

router.post("/register/",
    regValidate.registrationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount));


// Process the login attempt
router.post(
    "/login",
    regValidate.loginRules(),
    regValidate.checkLogInData,
    utilities.handleErrors(accountController.processLogin));



router.get(
    "/management", 
    // utilities.checkLogin,
    utilities.handleErrors(accountController.buildAccountManagement));


router.get("/edit/:account_id", utilities.handleErrors(accountController.buildUpdateAccount))

router.post("/update/", 
    regValidate.editRules(),
    regValidate.checkEditData,
    utilities.handleErrors(accountController.processUpdateAccount))


router.get("/logout/", utilities.handleErrors(accountController.processLogout))


module.exports = router;