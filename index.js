import  express, { urlencoded }  from "express";
import path from "path"
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import mongoose from "mongoose"
import bcrypt from "bcrypt"

mongoose.connect("mongodb://127.0.0.1:27017", {dbName : "MyDb"}).then(()=>{
    console.log("DataBase Connected")
})
const UserSchema = new mongoose.Schema({
  name : String,  email : String , password : String
})

const User = new mongoose.model("Usersdata" , UserSchema)


const app = express()
// const users = []
app.use(cookieParser())
app.use(express.static(path.join(path.resolve() , "public")))
app.use(urlencoded({extended : true}))

app.set("view engine", "ejs");
const isAuthenticated = async (req, res , next)=> {
    const {user} = req.cookies;
    if(user){
    const decoded = jwt.verify(user , "asdhfkjladhfkljadsfhlkajsdfhl")
    req.user = await User.findById(decoded._id);
    next();
}
    else{
        res.render("Login")
   }
}

app.get("/", isAuthenticated ,(req,res)=>{
    console.log(req.user)
    res.render("Logout", {name : req.user.name})
} )
app.get("/register",(req,res)=>{
    // console.log(req.user)
    res.render("Register")
} )
app.get("/login", (req,res)=>{
    res.render("Login")
})

app.post("/login", async (req,res)=>{
    const {email, password} = req.body;
    let user = await User.findOne({email}) 
    if(!user){
        return res.redirect("/register")
    }
    const isMatch = await bcrypt.compare(password,user.password);
    if(!isMatch){
        return  res.render("Login", {message : "Incorrect Password"})        
    }
    const token = jwt.sign({_id : user._id}, "asdhfkjladhfkljadsfhlkajsdfhl")
      res.cookie("user" , token ,{httpOnly : true, maxAge : 60*10000})
      res.redirect("/")

})
app.post("/register", async (req,res) => {
    const {name , email , password} = req.body
    let user = await User.findOne({email})
    if(user){
        return res.redirect("/login")
    }
    const hashedPass = await bcrypt.hash(password, 12);
   user =   await User.create({name , email , password : hashedPass})
  const token = jwt.sign({_id : user._id}, "asdhfkjladhfkljadsfhlkajsdfhl")
    res.cookie("user" , token ,{httpOnly : true, maxAge : 60*10000})
    res.redirect("/")
})


app.get("/logout", (req,res) => {
    res.cookie("user" , null, {httpOnly : true, expires : new Date(Date.now())})
    res.redirect("/")
})



app.listen(5000, ()=>{
})