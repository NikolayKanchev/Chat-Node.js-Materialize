const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const server = require("http").Server(app);
const io = require("socket.io")(server);
const bcrypt = require('bcrypt');
const saltRounds = 10;
const Knex = require("knex");
const knexConfig = require("./knexfile.js");
const objection = require("objection");
const Model = objection.Model;
const knex = Knex(knexConfig.development);
const nodemailer = require('nodemailer');
const sendMail = require("./emailAndPass");

app.use(express.static(__dirname + '/public'));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
// give the knex connection to objection.js
Model.knex(knex);

// convenience object that contains all the models and easy access to knex
const db = {
    "Knex": knex,
    "User": require("./models/User.js"),
    "Message": require("./models/Message.js"),
}

app.get("/", function(req, res){
    res.sendFile(__dirname + "/public/signIn.html")
});

app.get("/register", function(req, res){
    res.sendFile(__dirname + "/public/register.html")
});

app.get("/chat", function(req, res){
    res.sendFile(__dirname + "/public/chat.html");
});

app.get("/get-messages", function(req, res) {
    let response = {};

    db.Message.query().select()
    .then(foundMessages => {
        response.status = 200;
        response.messages = foundMessages;
        res.send(response);
    }).catch(err => {
        response.status = 500;
        response.message = "Error connecting or quering the database";
        res.send(response);
    });
});

app.post("/updateActive", function(req, res){
    let userId = req.body.userId;
    let isActive = Boolean(req.body.isActive);
    let response = {};

    db.User.query().select().where('id', userId)
        .then(foundUsers => {
            if (foundUsers.length > 0) {
                // Updates the user status                
                db.User.query().where('id', userId).update({
                    "is_active": isActive
                }).then(()=> {
                    response.status = 200;
                    response.message = "User status updated successfully !"
                    console.log(response);

                    // The test should be here maybe
                });
            } else{
                response.message = "Can't find the user !";
                response.status = 403;
                console.log(response);
            }
     }).catch(err => {
        response.status = 500;
        response.message = "Error connecting or quering the database";
        console.log(response);
    });
});

app.post("/sign-in", function(req, res){
    let email = req.body.email;
    let password = req.body.password;

    // *****************************************************************
    let response = {};

    db.User.query().select().where({
        "email": email
    }).then(foundUsers => {
        if (foundUsers.length === 0) {
            response.status = 403; // forbidden
            response.message = "no such user found";
            res.send(response);
        } else {

            bcrypt.compare(password, foundUsers[0].password).then(function(passValid) {
                if (passValid) {
                    response.status = 200;
                    response.username = foundUsers[0].username;
                    response.userId = foundUsers[0].id;
                    res.send(response);
                } else {
                    response.status = 403; // forbidden
                    response.message = "no such user found";
                    res.send(response);
                }
            });
        }
    }).catch(err => {
        response.status = 500;
        response.message = "error connecting or quering the database";
        res.send(response);
    });
});

app.post("/register-user", function(req, res){
    let response = {};

    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let email = req.body.email;
    let password = req.body.password;

    db.User.query().select().where('email', email)
        .then(foundUsers => {
            if (foundUsers.length > 0) {
                response.message = "user already exists by that name";
                response.status = 200;
                res.send(response)
            } else {
                let pattern = new RegExp("^[_A-Za-z0-9-]+(\\.[_A-Za-z0-9-]+)*@[A-Za-z0-9]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$");
                let result = pattern .test(email);

                if(firstName === "" || lastName === "" || password === "" || email === ""){
                    response.message = "Fill out all the fields !!!";
                    response.status = 400;
                    res.send(response)
                }else if(!result){
                    response.message = "Wrong input for Email !!!";
                    response.status = 400;
                    res.send(response)
                }else{
                    let username = (req.body.firstName[0] + req.body.lastName[0]).toUpperCase();

                    bcrypt.hash(password, saltRounds).then(function(hash) {
                        db.User.query().insert({
                            "firstName": firstName,
                            "lastName": lastName,
                            "username": username,
                            "email": email,
                            "password": hash
                            
                        }).then(persistedUser => {
                                response.status = 200;
                                response.username = username;
                                response.userId = persistedUser.id;                                
                                response.message = "The user was registered successfully !";
                                response.email = email;
                                res.send(response);
                            }).catch(err => {
                                response.status = 500;
                                response.message = "error saving the user to the database";
                                console.log(response);                        
                            });
                    });
                }
            }
        }).catch(err => {
            response.status = 500;
            response.message = "error connecting or quering the database";
            res.send(response);
        });
});

io.on("connection", function(socket) {

    let lastHeartBeat = {};

    console.log("A client connected");

    socket.on('heartbeat', function(data){
        lastHeartBeat.userId = data.userId;
        lastHeartBeat.date = data.date;
        lastHeartBeat.username = data.username;
        // console.log(lastHeartBeat); 
    });

    setInterval(function(){
        
           if(lastHeartBeat.date < (Date.now() - 5000)){
               console.log("Connection lost !!!");

                //Checks whether the user exist or not 
               db.User.query().select().where('id', lastHeartBeat.userId)
                    .then(foundUsers => {
                        if (foundUsers.length > 0) {
                            // update the is_active                
                            db.User.query().where('id', lastHeartBeat.userId).update({
                                "is_active": false
                            })
                            .then(
                                // send to all except the client itself
                                socket.broadcast.emit("socket close", {"username": lastHeartBeat.username})                            );
                        } else{
                            console.log("Can't update. There is no such user !");                            
                        }
                }).catch(err => {
                    console.log("error connecting or quering the database");
                });

               clearInterval(this);
           }
    }, 3000);
    

    socket.on("get users", function(data) {         
        db.User.query().select()
        .then(foundUsers => {
            // send to all
            io.emit("broadcasted users", {"users": foundUsers});
        }).catch(err => {
            console.log("error connecting or quering the database");
        }); 
    });

    socket.on("new message", function(data) {         
        let userId = data.userId;
        let username = data.username;
        let newMessage = data.message;
        let date = data.date;

        //save the message to the DB
    
        db.Message.query().insert({
            "user_id": userId,
            "username": username,
            "text": newMessage,
            "created_at": date
        }).then(persistedMessage => {
            // send to all except the client itself
            socket.broadcast.emit("broadcasted message", {"data": data});
        }).catch(err => {
            let response = {};
            response.status = 500;
            response.error = err;
            response.message = "Error querying the database. Might be an error with the config or the server hosting the database is down.";
            console.log(response);            
        });
    });

    socket.on('Send registration confirmation e-mail', function(data){
        let email = data.email; // The user e-mail

        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                //the e-mail and the password comes from emailAndPass.js
                user: sendMail.getEmail(),
                pass: sendMail.getPass()
            },
            tls:{
                rejectUnauthorized:false
            }
        });

        const mailOptions = {
            from: sendMail.getEmail(), // sender address
            to: email, // list of receivers
            subject: 'From The Best Chat Ever', // Subject line
            html: '<p>You was registered successfully</p>'// plain text body
        };

        transporter.sendMail(mailOptions, function (err, info) {
            if(err)
              console.log(err)
            else
            //   console.log(info);
              socket.emit("Registration success", { "message": "You was registered successfuly !!! <br> You will receive an conformation e-mail !!!" });
         });
    });
});

server.listen('3000', function(err){
    if(err){
        console.log("Error:", err);
    }else{
        console.log("The server is listening on port:", server.address().port);        
    }
});

