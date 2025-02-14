const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const classValidate = require("../utilities/management-validation")

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route by delivery detail and classification id
router.get("/detail/:inventoryId", utilities.handleErrors(invController.buildByDetailInventoryId));

// Route to get inventory management view
router.get("/", 
    utilities.checkAdmin,
    utilities.handleErrors(invController.buildManagement))

router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

// Router to get add-inventory view
router.get("/add-classification", 
    utilities.checkAdmin,
    utilities.handleErrors(invController.buildAddClassification))

router.post("/add-classification", 
    utilities.checkAdmin,
    classValidate.addClassRules(),
    classValidate.checkClassData,
    utilities.handleErrors(invController.processAddClassification)
)

router.get("/add-inventory", 
    utilities.checkAdmin,
    utilities.handleErrors(invController.buildInventoryForm))

router.post("/add-inventory", 
    utilities.checkAdmin,
    classValidate.insertDataRules(),
    classValidate.checkInsertData,
    utilities.handleErrors(invController.processAddInventory))



router.get("/edit/:inv_id", 
    utilities.checkAdmin,
    utilities.handleErrors(invController.buildEditInventory))

router.post("/update/", 
    utilities.checkAdmin,
    classValidate.insertDataRules(),
    classValidate.checkUpdateData,
    utilities.handleErrors(invController.updateInventory))


router.get("/delete/:inv_id", 
    utilities.checkAdmin,
    utilities.handleErrors(invController.buildDeleteInventory))

router.post("/delete/", 
    utilities.checkAdmin,
    utilities.handleErrors(invController.deleteInventory))



router.get("/cart/:inv_id", utilities.handleErrors(invController.getInventoryByInvIdJSON))

router.post("/cart", utilities.handleErrors(invController.processCartData));

router.get("/cart", utilities.handleErrors(invController.buildCart))





module.exports = router;