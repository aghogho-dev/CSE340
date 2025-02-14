const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/**
 * Build inventory by classification view
 */

invCont.buildByClassificationId = async function(req, res, next) {
    const classification_id = req.params.classificationId 
    const data = await invModel.getInventoryByClassificationId(classification_id)
    const grid = await utilities.buildClassificationGrid(data)
    let nav = await utilities.getNav()
    const className = data[0].classification_name
    
    res.render("./inventory/classification", {
        title: className + " vehicles",
        nav,
        grid
    })
}



invCont.buildByDetailInventoryId = async function(req, res, next) {
    const inv_id = req.params.inventoryId
    const data = await invModel.getInventoryByInventoryId(inv_id)
    console.log(data)
    const detail = await utilities.buildDetail(data)
    let nav = await utilities.getNav();
    const titleDetail = `${data[0].inv_year} ${data[0].inv_make} ${data[0].inv_model}`

    res.render("./inventory/detail", {
        title: titleDetail,
        nav,
        detail
    })
}

invCont.buildManagement = async function(req, res, next) {
    let nav = await utilities.getNav()

    console.log("Inside Build Management")

    const classificationSelect = await utilities.buildClassificationList()

    res.render("./inventory/", {
        title: "Management",
        nav,
        classificationSelect,
    })
}

invCont.buildAddClassification = async function(req, res, next) {
    let nav = await utilities.getNav()

    console.log("Inside Build Add Classification")

    res.render("./inventory/add-classification", {
        title: "Add Classification",
        nav,
        errors: null,
    })
}


invCont.processAddClassification = async function(req, res) {
    const { classification_name } = req.body 
    console.log("Classification Name: " + classification_name)

    

    try {

        const classObj = await invModel.getClassifications()
        const getClasses = classObj.rows.map((x) => x.classification_name)
        console.log(getClasses)
        console.log(getClasses.includes(classification_name))

        if (!getClasses.includes(classification_name)) {

            const insertClass = invModel.insertClassificationName(classification_name)
            console.log("INSIDE GET CLASS OK OK")
            console.log("iNSERTED CLASS", insertClass)
            console.log("INSIDE GET CLASSES OK OK")

            let nav = await utilities.getNav()

            req.flash(
                "notice", `The ${classification_name} Classification Name was added.`
            )
        
            // res.render("./inventory/management",  {
            //     title: "Management",
            //     nav,
            // })

            res.redirect("/inv/")

        } else {

            let nav = await utilities.getNav()  

            req.flash(
                "notice", 
                "The classification name is already present. Try another name."
            )
            res.render("./inventory/add-classification", {
                title: "Add Classification",
                nav,
                errors: null,
            })
    
        }

    } catch (error) {

        req.flash(
            "notice", 
            "The classification name wasn't registered. Try another name."
        )
        res.render("./inventory/add-classification", {
            title: "Add Classification",
            nav,
            errors: null,
        })

    }
}

/**
 * 
 */
invCont.buildInventoryForm = async function(req, res, next) {
    
    const nav = await utilities.getNav()
    const addInvForm = await utilities.buildAddInvForm()

    console.log("AddInvForm", addInvForm)

    res.render("./inventory/add-inventory", {
        title: "Add Inventory",
        nav,
        addInvForm,
        errors: null,
    })
}


/**
 * Process Add Inventory
 */
invCont.processAddInventory = async function(req, res) {

    console.log("Req body in process Add Inventory")
    console.log(req.body)
    console.log("\n\n")

    const { inv_make, inv_model, inv_year, inv_description, inv_image, 
        inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body

    
    console.log("Classification id inside processAddInventory: " + classification_id)

    let nav = await utilities.getNav()

    try {

        console.log("WAS HERE")
        const insertIntoInv = invModel.insertInvFormData(
            inv_make, inv_model, inv_year, inv_description, inv_image, 
            inv_thumbnail, inv_price, inv_miles, inv_color, classification_id
        )

        console.log("WASN'T HERE")

        console.log("INSERTED INTO INV TABLE OK OK")
        console.log(insertIntoInv)

        req.flash(
            "notice", "The form was successfully processed"
        )

        res.render("./inventory/", {
            title: "Management",
            nav,
        })

    } catch(error) {
        req.flash(
            "notice", "The form processing was unsuccessful"
        )

        const addInvForm = await utilities.buildAddInvForm()

        res.render("./inventory/add-inventory", {
            title: "Add Inventory",
            nav,
            addInvForm,
            errors: null,
        })
    }  
    
}


/**
 * Return Inventory by Classification as JSON
 */
invCont.getInventoryJSON = async (req, res, next) => {
    console.log("\n\nInside GET Inventory JSON\n\n")
    const classification_id = parseInt(req.params.classification_id)
    const invData = await invModel.getInventoryByClassificationId(classification_id)

    if (invData[0].inv_id) {
        return res.json(invData)
    } else {
        next(new Error("No data returned"))
    }
}


/**
 * 
 */
invCont.buildEditInventory = async (req, res, next) => {

    const inv_id = parseInt(req.params.inv_id)
    const nav = await utilities.getNav()
    const itemData = await invModel.getInventoryByInventoryId(inv_id)
    const editInvForm = await utilities.buildEditInvForm(itemData[0])

    const itemName = `${itemData[0].inv_make} ${itemData[0].inv_model}`

    res.render("./inventory/edit-inventory", {
        title: "Edit " + itemName,
        nav,
        editInvForm: editInvForm,
        errors: null,
        inv_id: itemData.inv_id,
        inv_make: itemData.inv_make,
        inv_model: itemData.inv_model,
        inv_year: itemData.inv_year,
        inv_description: itemData.inv_description,
        inv_image: itemData.inv_image,
        inv_thumbnail: itemData.inv_thumbnail,
        inv_price: itemData.inv_price,
        inv_miles: itemData.inv_miles,
        inv_color: itemData.inv_color,
        classification_id: itemData.classification_id
    })
}


/**
 * Update Inventory Data
 */
invCont.updateInventory = async function (req, res, next) {

    req.body.inv_id = req.body.inv_id.replace("<label", "").replace("<label", "")

    const {
        inv_id, inv_make, inv_model, inv_description, inv_image,
        inv_thumbnail, inv_price, inv_year, inv_miles, inv_color,
        classification_id } = req.body

    

    console.log("Inventory Controller: Update iNVENTORY")
    console.log(req.body)

    const updateResult = await invModel.updateInventory(
        inv_id, inv_make, inv_model, inv_description, inv_image,
        inv_thumbnail, inv_price, inv_year, inv_miles, inv_color,
        classification_id
    )
    console.log("Update result")
    console.log(updateResult)

    if (updateResult) {
        const itemName = updateResult.inv_make + " " + updateResult.inv_model

        req.flash("notice", `The ${itemName} was successfully updated.`)
        res.redirect("/inv/")
    } else {
        
        const nav = await utilities.getNav()
        const editInvForm = await utilities.buildEditInvForm(req.body)

        const itemName = `${inv_make} ${inv_model}`

        res.render("./inventory/edit-inventory", {
            title: "Edit " + itemName,
            nav,
            editInvForm: editInvForm,
            errors: null,
            inv_id,
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color,
            classification_id
        })
    }
}

/**
 * 
 */
invCont.buildDeleteInventory = async (req, res, next) => {

    const inv_id = parseInt(req.params.inv_id)
    const nav = await utilities.getNav()
    const itemData = await invModel.getInventoryByInventoryId(inv_id)
    const deleteInvForm = await utilities.buildDeleteInvForm(itemData[0])

    const itemName = `${itemData[0].inv_make} ${itemData[0].inv_model}`

    res.render("./inventory/delete-confirm", {
        title: "Edit " + itemName,
        nav,
        deleteInvForm: deleteInvForm,
        errors: null,
        inv_id: itemData.inv_id,
        inv_make: itemData.inv_make,
        inv_model: itemData.inv_model,
        inv_year: itemData.inv_year,
        inv_price: itemData.inv_price
    })
}


/**
 * 
 */
invCont.deleteInventory = async function (req, res, next) {

    req.body.inv_id = req.body.inv_id.replace("<label", "").replace("<label", "")

    const {
        inv_id, inv_make, inv_model, inv_year, inv_price} = req.body

    

    console.log("Inventory Controller: Delete iNVENTORY")
    console.log(req.body)

    const updateResult = await invModel.deleteInventory(inv_id)
    
    console.log(updateResult)

    if (updateResult) {
        const itemName = updateResult.inv_make + " " + updateResult.inv_model

        req.flash("notice", `The ${itemName} was successfully deleted.`)
        res.redirect("/inv/")
    } else {
        
        const nav = await utilities.getNav()
        const editInvForm = await utilities.buildDeleteInvForm(req.body)

        const itemName = `${inv_make} ${inv_model}`

        res.render("./inventory/delete-confirm", {
            title: "Edit " + itemName,
            nav,
            editInvForm: editInvForm,
            errors: null,
            inv_id,
            inv_make,
            inv_model,
            inv_year,
            inv_price,
        })
    }
}



invCont.getInventoryByInvIdJSON = async (req, res, next) => {
    console.log("Inside GET INventory by inv id json")
    const inv_id = parseInt(req.params.inv_id)
    const invData = await invModel.getInventoryByInventoryId(inv_id)

    console.log("Get Inventory by Inventory ID")
    console.log(invData)

    if (invData[0].inv_id) {
        return res.json(invData)
    } else {
        next(new Error("No data returned"))
    }
}

invCont.buildCart = async (req, res, next) => {

    console.log("\n\nInside Build Cart\n\n")
    
    const nav = await utilities.getNav()

    const cart = req.session.cart || [];

    console.log("\n\n\nCart inside build carty")
    console.log(cart)
    console.log("\n\n\n")
   
    
    res.render("./inventory/cart", {
        title: "Your Cart",
        nav,
        addCart: cart,
    })
}

invCont.processCartData = (req, res, next) => {

    console.log("\n\n\nInside Process Cart Data\n\n\n")

    if (req.body.cart) {
        req.session.cart = req.body.cart;
    }

    next();
};

module.exports = invCont