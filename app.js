var bodyParser = require("body-parser"),
methodOverride = require("method-override"),
express = require("express"),
mongoose = require("mongoose"),
app = express();

mongoose.connect("mongodb://localhost/discussionforum");
app.set("view engine" , "ejs");
app.use(methodOverride("_method"));
app.use(express.static("public"));
app.use(bodyParser.urlencoded({useNewUrlParser:true}));

var forumSchema = new mongoose.Schema({
    question: String,
    image: String,
    answer: String,
    created: {type: Date , default: Date.now}
});
var forum = mongoose.model("forum",forumSchema);

//Home orIndex Page
app.get("/",function(req,res){
    res.redirect("/forums");
});

app.get("/forums",function(req,res){
    forum.find({} , function(err,forums){
        if(err){
            console.log("Error!!!");
        } else{
            res.render("index",{forums: forums});
        }
    });
});

//New Question
app.get("/forums/new",function(req,res){
    res.render("new");
});

//About us
app.get("/forums/meet", function(req,res){
    res.render("meet");
})


//Posting a new question to db
app.post("/forums", function(req,res){
    forum.create(req.body.blog , function(err , newques){
        if(err){
            res.render("new");
        } else{
            res.redirect("/forums");
        }
    });
});

//Show question
app.get("/forums/:id",function(req,res){
    forum.findById(req.params.id, function(err , foundques){
        if(err){
            res.redirect("/forums");
            console.log("Error!!!");
        } else{
            res.render("show",{forum : foundques});
        }
    });
});

//Edit Route
app.get("/forums/:id/edit",function(req,res){
    forum.findById(req.params.id , function(err,foundques){
        if(err){
            res.redirect("/forums");
            console.log("Error!!!");
        } else{
            res.render("edit",{forum:foundques});
        }
    });
});

//Update A question
app.put("/forums/:id" , function(req,res){
    forum.findByIdAndUpdate(req.params.id,req.body.forum,function(err,updateques){
        if(err){
            res.redirect("/forums");
            console.log("Error!!!");
        } else{
            res.redirect("forums/"+req.params.id);
        }
    });
});

//Deleting a ques
app.delete("/forums/:id",function(req,res){
    forum.findByIdAndRemove(req.params.id , function(err){
        if(err){
            res.redirect("/forums");
            console.log("Error!!!");
        } else{
            res.redirect("/forums");
        }
    });
});

app.listen(3000 , '127.0.0.1' , function(){
    console.log("Server is started!!!!! Yay@@");
});