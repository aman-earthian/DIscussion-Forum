var bodyParser = require("body-parser"),
passport = require("passport"),
LocalStrategy = require("passport-local"),
methodOverride = require("method-override"),
express = require("express"),
User = require("./models/user"),
mongoose = require("mongoose"),
app = express();

mongoose.connect("mongodb://localhost/discussionforum");
app.set("view engine" , "ejs");
app.use(methodOverride("_method"));
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

var forumSchema = new mongoose.Schema({
    question: String,
    image: String,
    answer: String,
    created: {type: Date , default: Date.now}
});
var forum = mongoose.model("forum",forumSchema);

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

//Passport
app.use(require("express-session")({
    secret: "nothing",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    next();
});

//Home orIndex Page
app.get("/",function(req,res){
    res.redirect("/forums");
});

app.get("/forums",function(req,res){
    forum.find({} , function(err,forums){
        if(err){
            console.log("Error!!!");
        } else{
            res.render("index",{forums: forums, currentUser: req.user});
        }
    })
});

//answer route
app.get("/forums/:id/answer",isLoggedIn,function(req,res){
    forum.findById(req.params.id , function(err,foundques){
        if(err){
            res.redirect("/forums");
            console.log("Error!!!");
        } else{
            res.render("answer",{forum:foundques});
        }
    });
});

// //Comments
// app.post("/forums",isLoggedIn,function(req,res){
//     forums.findById(req.params.id , function(err,forum){
//         if(err){
//             console.log(err);
//             res.redirect("/forums");
//         } else{
//             Comment.create(req.body.comment , function(err,comment){
//                 if(err){
//                     console.group(err);
//                 } else{
//                     comment.author.id = req.user._id;
//                     comment.author.usename = req.user.username;

//                     comment.save();
//                     forum.comments.push(comment);
//                     forum.save();
//                     res.redirect("/forums/"+forum._id);
//                 }
//             });
//         }
//     });
// });

//New Question
app.get("/forums/new",isLoggedIn,function(req,res){
    res.render("new");
});

//About us
app.get("/forums/meet", function(req,res){
    res.render("meet");
})


//Posting a new question to db
app.post("/forums",isLoggedIn, function(req,res){
    forum.create(req.body.forum , function(err , newques){
        if(err){
            res.render("new");
        } else{
            res.redirect("/forums");
        }
    });
});

//Show question
app.get("/forums/:id",isLoggedIn,function(req,res){
    forum.findById(req.params.id, function(err , foundques){
        if(err){
            res.redirect("/forums");
            console.log("Error!!!");
        } else{
            res.render("show",{forum : foundques});
        }
    })
});

//Edit Route
app.get("/forums/:id/edit",isLoggedIn,function(req,res){
    forum.findById(req.params.id , function(err,foundques){
        if(err){
            res.redirect("/forums");
            console.log("Error!!!");
        } else{
            res.render("edit",{forum:foundques});
        }
    })
});

//Update A question
app.put("/forums/:id" , function(req,res){
    forum.findByIdAndUpdate(req.params.id,req.body.forum,{new:true},function(err,updateques){
        if(err){
            res.redirect("/forums");
            console.log("Error!!!");
        } else{
            res.redirect("/forums/"+req.params.id);
        }
    });
});

//Deleting a ques
app.delete("/forums/:id",isLoggedIn,function(req,res){
    forum.findByIdAndRemove(req.params.id , function(err){
        if(err){
            res.redirect("/forums");
            console.log("Error!!!");
        } else{
            res.redirect("/forums");
        }
    });
});

// ============
//Auth Logic
// =============

//show sign up
app.get("/register", function(req,res){
    res.render("signup");
});
//sign up logic
app.post("/register", function(req,res){
    var newUser = new User({username: req.body.username});
    User.register(newUser , req.body.password , function(err , user){
        if(err){
            console.log(err);
            return res.render("signup");
        }
        passport.authenticate("local")(req,res,function(){
            res.redirect("/forums");
        });
    });
});

//Show login
app.get("/login",function(req,res){
    res.render("login");
});
// login logic
app.post("/login",passport.authenticate("local",{
    successRedirect:"/forums",
    failureRedirect:"/login"
}),function(req,res){
});

//logout
app.get("/logout",function(req,res){
    req.logout();
    res.redirect("/forums");
});

function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

app.listen(3000 , '127.0.0.1' , function(){
    console.log("Server is started........");
});