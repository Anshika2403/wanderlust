if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.ATLASDB_URL;

main()
  .then(() => {
    console.log("connected to db");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
  //if no change then update session after 1 day...this is passed in seconds
});

store.on("error", () => {
  console.log("Error in Mongo session store", err);
});

const sessionOptions = {
  store, // or  store: store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// app.get("/demouser", async(req, res) => {
//     let fakeUser = new User({
//         email: "anshika@gmail.com",
//         username: "anshika"
//     });

//     let newUser = await User.register(fakeUser,"hello");
//     res.send(newUser);
// })

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// const validateListing = (req, res, next) => {
//     let {error} =listingSchema.validate(req.body);
//     if(error){
//         let errMsg = error.details.map((el) => el.message).join(",");
//         throw new ExpressError(400,errMsg);
//     }else{
//         next();
//     }
// }

// const validateReview = (req,res,next) => {
//     let {error} =reviewSchema.validate(req.body);
//     if(error){
//         let errMsg = error.details.map((el) => el.message).join(",");
//         throw new ExpressError(400,errMsg);
//     }else{
//         next();
//     }
// }

//----------------------routes for listing-------------------------------------

// app.get("/listings", wrapAsync(async (req,res) => {
//     const allListings = await Listing.find({});//or remove curly braces i.e find()
//     res.render("listings/index.ejs",{allListings});
// }));

// [//if we keep this below id api then new will be considered an id hence will not work]
// app.get("/listings/new", (req,res) => {
//     res.render("listings/new.ejs");
// })

// app.get("/listings/:id", wrapAsync(async (req,res) => {
//     let {id} = req.params;
//     let listing = await Listing.findById(id).populate("reviews");// [populate so that only review id is not shown but full object]
//     res.render("listings/show.ejs",{listing});
// }));

// // app.post("/listings", async (req,res,next) => {
// //     // let {title, description, image, rice, location, country} = req.body;
// //    try{const newListing = new Listing(req.body.listing);
// //     await newListing.save();
// //     res.redirect("/listings");
// //    }catch(err){
// //     next(err);
// //    }
// // });

// app.post("/listings", validateListing , wrapAsync(async (req,res,next) => {
//     // let {title, description, image, rice, location, country} = req.body;
// //    if(!req.body.listing){
// //     throw new ExpressError(400,"Send valid data for listing");
// //    }
//     // let result =listingSchema.validate(req.body);
//     // if(result.error){
//     //     throw new ExpressError(400,result.error);
//     // }
//    const newListing = new Listing(req.body.listing);
//     await newListing.save();
//     res.redirect("/listings");
// })
// );

// app.get("/listings/:id/edit", wrapAsync(async (req,res) => {
//     let{id} = req.params;
//     let listing= await Listing.findById(id);
//     res.render("listings/edit.ejs" , {listing});
// }));

// app.put("/listings/:id" , validateListing, wrapAsync(async (req,res) => {
//     let {id} =req.params;
//     await Listing.findByIdAndUpdate(id,{...req.body.listing});
//     res.redirect(`/listings/${id}`);
// }));

// app.delete("/listings/:id",wrapAsync(async (req,res) => {
//     let {id} = req.params;
//     await Listing.findByIdAndDelete(id);
//     res.redirect("/listings");
// }));

//--------------------------------------------------------------------------------------

// app.get("/test", async (req,res) => {
//     let sample = new Listing({
//         title:"My New Villa",
//         description:"By the Beach",
//         price:1200,
//         location:"Mumbai, Maharashtra",
//         country:"India",
//     });
//     await sample.save();
//     res.send("successful");
// });

//-------------------review paths--------------------------------------

// app.post("/listings/:id/reviews",validateReview, wrapAsync(async (req,res) => {
//     let listing = await Listing.findById(req.params.id);
//     let newReview = new Review(req.body.review);

//     listing.reviews.push(newReview);
//     await newReview.save();
//     await listing.save();

//     res.redirect(`/listings/${listing._id}`);//or ${req.params.id}
// }));

// app.delete("/listings/:id/reviews/:reviewId" , wrapAsync(async(req,res) => {
//     let { id, reviewId} = req.params;

//     await Listing.findByIdAndUpdate(id, {$pull: { reviews: reviewId }});
//     await Review.findByIdAndDelete(reviewId);

//     res.redirect(`/listings/${id}`);
// }));

//---------------------------------------------------------------------------------

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Oops!!Page not found."));
});

app.use((err, req, res, next) => {
  let { status = 500, message = "Something went wrong" } = err;
  res.status(status).render("error.ejs", { err });
  // res.status(status).send(message);
});

app.listen(8080, () => {
  console.log("Listening to port");
});
