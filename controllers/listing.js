const Listing = require("../models/listing.js");

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

module.exports.newForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner"); // [populate so that only review id is not shown but full object]
  if (!listing) {
    req.flash("error", "Listing you requested does not exist");
    res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
};

module.exports.addListing = async (req, res, next) => {
  let url = req.file.path;
  let filename = req.file.filename;

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };
  await newListing.save();
  req.flash("success", "New Listing Added");
  res.redirect("/listings");
};

module.exports.editForm = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  let orgImgUrl = listing.image.url;
  orgImgUrl = orgImgUrl.replace("/upload", "/upload/h_300,w_250");
  res.render("listings/edit.ejs", { listing, orgImgUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if (typeof req.file != "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }
  req.flash("success", "Listing Updated");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted");
  res.redirect("/listings");
};

module.exports.trend = async (req, res) => {
  const allListings = await Listing.find({ category: "trending" });
  res.render("listings/index.ejs", { allListings });
};

module.exports.mountain = async (req, res) => {
  const allListings = await Listing.find({ category: "mountain" });
  res.render("listings/index.ejs", { allListings });
};

module.exports.castle = async (req, res) => {
  const allListings = await Listing.find({ category: "castles" });
  res.render("listings/index.ejs", { allListings });
};

module.exports.room = async (req, res) => {
  const allListings = await Listing.find({ category: "rooms" });
  res.render("listings/index.ejs", { allListings });
};

module.exports.city = async (req, res) => {
  const allListings = await Listing.find({ category: "iconic city" });
  res.render("listings/index.ejs", { allListings });
};

module.exports.pool = async (req, res) => {
  const allListings = await Listing.find({ category: "pool" });
  res.render("listings/index.ejs", { allListings });
};

module.exports.camp = async (req, res) => {
  const allListings = await Listing.find({ category: "camping" });
  res.render("listings/index.ejs", { allListings });
};

module.exports.farm = async (req, res) => {
  const allListings = await Listing.find({ category: "farm" });
  res.render("listings/index.ejs", { allListings });
};

module.exports.arctic = async (req, res) => {
  const allListings = await Listing.find({ category: "arctic" });
  res.render("listings/index.ejs", { allListings });
};
