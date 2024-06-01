const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listing.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });
// const upload = multer({ dest: "uploads/"});
//through this multer was uploading files in upload file

router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.addListing)
  );

router.get("/new", isLoggedIn, listingController.newForm);

router.get("/trending", listingController.trend);
router.get("/mountain", listingController.mountain);
router.get("/castle", listingController.castle);
router.get("/city", listingController.city);
router.get("/camp", listingController.camp);
router.get("/arctic", listingController.arctic);
router.get("/farm", listingController.farm);
router.get("/rooms", listingController.room);
router.get("/pool", listingController.pool);

router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  .delete(isLoggedIn, isOwner, listingController.destroyListing);

router.get("/:id/edit", isOwner, wrapAsync(listingController.editForm));

module.exports = router;
