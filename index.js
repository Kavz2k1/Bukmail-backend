const express = require("express")
const nodemailer = require("nodemailer");
const cors = require("cors")
const app = express()
const mongoose = require("mongoose")
app.use(express.json())
app.use(cors({
    origin: "https://bulkmail-frontend-blush.vercel.app",
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true
  }))


mongoose.connect("mongodb+srv://rajkaviya121:rajkaviya2@cluster0.v7anyu3.mongodb.net/passkey?retryWrites=true&w=majority&appName=Cluster0").then(function(){
    console.log("connected to db")
    console.log("Database:", mongoose.connection.db.databaseName);
}).catch(function()
{console.log("falied to connect")})

const credential = mongoose.model("credential", {},"bulkmail")



app.post("/sendmail", async function(req,res){
    var msg = req.body.msg
    var emailList = req.body.emailList
    console.log(msg)
    // console.log(emailList)

    credential.find().then(function(data){
        console.log("fetcheddata: ", data)
        console.log("Keys in first document:", Object.keys(data[0]));

        const user = data[0]._doc.user;
        const pass = data[0]._doc.pass;

        if (!user || !pass) {
            console.log("Missing user or pass in MongoDB data");
            return res.send(false);
        }
     

        console.log("User:", user, "Pass:", pass);
        // Clean and extract user/pass
  

    const transporter = nodemailer.createTransport({
        service:"gmail",
    // true for 465, false for other ports
      auth: {
       user: user,
        pass: pass,
       
      },
      
    });
    
    new Promise(async function(resolve,reject){
        try{
    
    
            for(var i=0; i<emailList.length; i++)
            {
              await  transporter.sendMail(
                    {
                        from:data[0].toJSON().user,
                        to:emailList[i],
                        subject:"A message from bulk mail",
                        text:msg
                    },
                )
                console.log("email sent to :" +emailList[i])
            }
            resolve("success")
        }
        catch(error){
         reject("failed")
         console.log(error)
        }
    }).then(function(){
        res.send(true)
    }).catch(function(){
        res.send(false)
    })
       
    
    }).catch(function(error){
        console.log(error)
    })
    
    
    
})

// app.post("/sendmail", async function(req, res) { // ✅ Make this async
//     var msg = req.body.msg
//     var emailList = req.body.emailList
//     console.log(msg)
    
//     try {
//     const data = await credential.find() // ✅ Use await instead of .then
    
//     const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//     user: data[0].toJSON().user,
//     pass: data[0].toJSON().pass,
//     },
//     });
    
//     for (var i = 0; i < emailList.length; i++) {
//     await transporter.sendMail({ // ✅ Await properly
//     from: data[0].toJSON().user, // ✅ From should match the login email
//     to: emailList[i],
//     subject: "A message from bulk mail",
//     text: msg,
//     })
//     console.log("email sent to :" + emailList[i])
//     }
    
//     res.send(true) // ✅ Only respond once, after all emails are sent
//     } catch (error) {
//     console.log("Error sending mail:", error)
//     res.send(false)
//     }
//     })
    
app.listen(5000, function()
{
    console.log("Server started at 5000...");
    console.log("success");
    
})