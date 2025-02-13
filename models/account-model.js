const pool = require("../database/")
const bcrypt = require("bcryptjs")


/**
 * Register new account
 */
async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
    try {
        const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
        return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
    } catch (error) {
        return error.message
    }
}


/**
 * Check for existing email
 */
async function checkExistingEmail(account_email) {
    try {
        const sql = "SELECT * FROM account WHERE account_email = $1"
        const email = await pool.query(sql, [account_email])
        return email.rowCount
    } catch (error) {
        return error.message
    }
}

async function checkAccountPassword(account_email, account_password)  {
    try {
        const sql = "SELECT * FROM account WHERE account_email = $1"
        const password = await pool.query(sql, [account_email])
        return bcrypt.compareSync(account_password, password.rows[0].account_password)
    } catch (error) {
        return error.message
    }
}


async function getUserInfo(account_email) {
    try {
        const sql = "SELECT * FROM account WHERE account_email = $1"
        const userInfo = await pool.query(sql, [account_email])
        return userInfo.rows
    } catch (error) {
        return error.message
    }
}


/**
 * Return account data using email address
 */
async function getAccountByEmail(account_email) {

    try {

        const result = await pool.query(
            "SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1",
            [account_email]
        )

        return result.rows[0]

    } catch (error) {
        return new Error("No matching email found.")
    }
}

/**
 * 
 */
async function getAccountByAccountID(account_id) {
    try {

        const result = await pool.query(
            "SELECT * FROM account WHERE account_id = $1",
            [account_id]
        )

        return result.rows[0]

    } catch (error) {
        return new Error("No matching email user found.")
    }
}

/**
 * Update Account
 */

async function updateAccount(
    account_id, 
    account_firstname, 
    account_lastname, 
    account_email,
    account_password
) {

        try {

            console.log("\n\n\nInse update account in account model before update\n\n")
            const sql = "UPDATE public.account SET account_firstname = $2, account_lastname = $3, account_email = $4, account_password = $5 WHERE account_id = $1 RETURNING *"

            
            const data = await pool.query(sql, [account_id, account_firstname, account_lastname, account_email, account_password])

            console.log("Inside Account Model returning update")
            console.log(data.rows[0])

            return data.rows[0]
        } catch (error) {
            console.error("Accout Model Error" + error)
        }

}



module.exports = { registerAccount, checkExistingEmail, checkAccountPassword, getUserInfo, getAccountByEmail, getAccountByAccountID, updateAccount }