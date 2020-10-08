const express = require('express');
const BodyParser = require("body-parser");
const { urlencoded } = require('body-parser');
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltrounds = 10;


// initialising webapp
const app = express();
app.use(BodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.set('view engine', 'ejs')



// initialising mongo database
mongoose.connect("mongodb+srv://sideeq:sideeq11@cluster0.7rhnk.mongodb.net/webapp", {useNewUrlParser: true, useUnifiedTopology : true})


// creating event schema
const eventschema = new mongoose.Schema({
    eventName : String,
    eventDate : String,
    email : String,
    startTime : String,
    endTime : String,
    address : String,
    city : String,
    state : String, 
    description : String,
})

const Events = new mongoose.model("Event", eventschema);

// creating users login schema
const loginschema = new mongoose.Schema({
    first_name : String,
    Sur_name : String,
    email : String,
    password : String
})

const User_data = new mongoose.model("User", loginschema);

let eventArray = []


// Home page
app.get('/',(req,res)=>{
    Events.find({}, (err, found)=>{
        if(err){
            console.log(err);
        }else{
            if(found.length !== 0){
                res.render("Home", {list :  found}) 
            }else{
            if(found.length === 0){
                Events.insertMany(eventArray, (err)=>{
                    if(err){
                        console.log(err)
                    }
                } )
                Events.find({}, (err,myres)=>{
                    if(err){
                        console.log(err)
                    }else{
                        console.log(myres.length);
                        res.render("Home", {list :  found}) 
                    }
                })
            }
            }
        }
    })
   
})

// Getting the form pages

app.get("/eventform", (req,res)=>{
    res.render("eventform")
})
app.get("/sign", (req, res)=>{
    res.render('sign', {errormessage : ""})
})
app.get("/create", (req, res)=>{
    res.render("create", {passwordmessage : "" , emailmessage : ""})
})
app.get("/cr",(req,res)=>{
    res.redirect("eventform")
})


// post or appending the data for each pages


// creating a new user
app.post("/create", (req,res)=>{
    let pass1 = req.body.password;
    let pass2 = req.body.confirmPassword;
    let email = req.body.email;
    User_data.find({email : email}, (err, ret)=>{
        if(err){
            console.log(err)
        }else{
            if(ret > 0){
                res.render("create", {passwordmessage : "", emailmessage : "Email already been used!"})
            }else{
                if(pass1 === pass2){
                    bcrypt.hash(pass1, saltrounds, (err, result)=>{
                        if(err){
                            console.log(err)
                        }else{
                            const user = new User_data({
                                first_name : req.body.firstname,
                                Sur_name : req.body.surname,
                                email : req.body.email,
                                password : result
                            })
                            user.save((err)=>{
                                if(err){console.log(err)}else{
                                    Events.find({}, (err, result)=>{
                                        if(err){
                                            console.log(err)
                                        }else{
                                            res.render("dashboard", {list : result, username: req.body.surname})
                                        }
                                    })
                           }
                            })
                        }
                    })
                    
                }else{
                    res.render("create" ,{ passwordmessage : "password not match!"})
                }
            }
        }
    })
    

})

// old user sign in 
app.post("/sign", (req, res)=>{
        let email = req.body.email;
        let password = req.body.password;
        User_data.findOne({email : email},(err, foundUser)=>{
            if(err){
                console.log("the error is " + err)
            }else{
                if(foundUser){
                    bcrypt.compare(password, foundUser.password, (err, result)=>{
                        if(result === true){
                            let name = foundUser.first_name;
                            Events.find({}, (err, myre)=>{
                                if(err){
                                    console.log(err)
                                }else{
                                    res.render("dashboard", {list : myre, username: name})
                                }
                            })
                        } else{
                            res.render("sign",{ errormessage : "email and password not matched!"})
                        }
                    })  
                }else{
                    if(!foundUser){
                        res.render("sign",{ errormessage : "user not found"})
                    }
                }
            }
        })
})

// Getting new event in to dashboard by a new user
app.post("/", (req, res)=>{
    let event = req.body;
    eventArray.push(event);
    event = new Events({
        eventName : req.body.eventName,
        eventDate : req.body.eventDate,
        email : req.body.email,
        startTime : req.body.startTime,
        endTime : req.body.endTime,
        address : req.body.address,
        city : req.body.city,
        state : req.body.state,
        description : req.body.description

    })
    event.save((err)=>{
        if(err){
            console.log(err)
        }else{
            Events.find({}, (err , result)=>{
                if(err){
                    console.log(err)
                }else{
                     res.render("dashboard", { list : result, username : ""} )
                }
            })
        }
    })
   
})




// admin section 

// creating admin login credentials (hardcoded)

const adminschema = new mongoose.Schema({
    name : String,
    password : String
})

const admin = new mongoose.model("Admin", adminschema);

// hardcoding an admin credential
admin.find({}, (err, adminlist)=>{
    if(err){
        console.log(err)
    }else{
        if(adminlist.length=== 0){
            let myAdmin = new admin({
                name  : "bryan",
                password : "admin1234"
            })
            myAdmin.save((err)=>{
                if(err){
                    console.log(err)
                }else{
                    console.log("admin succesfully saved")
                }
            })
        }
    }
})



app.get("/admin", (req, res)=>{
    res.render("admin", {errormessage : ""})
})
app.post("/admin", (req, res)=>{
    let name = req.body.username;
    let password = req.body.password;
    admin.findOne({ name : name} , (err, foundAmin)=>{
        if(err){
            console.log("name not found")
        }else{
            if(foundAmin == null){
                res.render("admin", {
                    errormessage : "data not found!"
                })
            }else{
            let adminpassowrd = foundAmin.password;
            if(adminpassowrd === password){
                Events.find({}, (err, adminresult)=>{
                    if(err){
                        console.log(err)
                    }else{
                        res.render("adminDashboard", {list : adminresult})
                    }
                })
            }else{
                res.render("admin", {errormessage : "Incorrect username or password"})
            }
        }
    }
    })
})

// admin dashboard

app.post("/adminDashboard", (req,res)=>{
    let description = req.body.mybutton;
    Events.findOne({description: description}, (err, found)=>{
        if(err){
            console.log(err)
        }else{
            let id = found._id
           Events.findByIdAndDelete( id, (err, docs)=>{
               if(err){
                   console.log(err)
               }else{
                   console.log("Deleted : "+ docs)
                   Events.find({}, (err, list)=>{
                       if(err){
                           console.log(err)
                       }else{
                        res.render("adminDashboard",{
                            list : list
                        })
                       }
                   })
               }
           })
        }
    })
   
})

// validating search form

// General search without login
app.post("/search", (req,res)=>{
    let title = req.body.search;
    Events.find({eventName : title}, (err, result)=>{
        if(err){
            console.log(err)
        }else{
            res.render("home", {  list : result})
        }
    })
})

// basic search after login
app.post("/search1", (req, res)=>{
    let title = req.body.search;
    Events.find({eventName : title}, (err, result)=>{
        if(err){
            console.log(err)
        }else{
            res.render("dashboard", {username : "", list : result})
        }
    })
})

// admin search 
app.post("/search2", (req, res)=>{
    let title = req.body.search;
    Events.find({eventName: title}, (err, result)=>{
        if(err){
            console.log(err)
        }else{
            res.render("adminDashboard", {list : result})
        }
    })
})




app.listen(8080, ()=>{
    console.log('server runnung on Port 8080')
})
