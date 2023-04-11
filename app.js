const express=require('express');
const mysql=require('mysql');
const dotenv=require('dotenv');
const path=require('path');
const hbs=require('hbs');
const app=express();
const cookieParser=require('cookie-parser');
const bodyParser = require('body-parser');

dotenv.config({
    path:'./.env'
});
const db=mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

db.connect((err)=>{
    if(err){
        console.log(err);
    }
    else{
        console.log("mysql connection success");
    }
});



app.use(cookieParser());
app.use(express.urlencoded({extended: false}));

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

const location=path.join(__dirname,'./public');

app.use(express.static(location));

app.set('view engine','hbs');

const partialspath=path.join(__dirname,"./views/partials");
hbs.registerPartials(partialspath);

app.use("/",require('./routes/pages'));
app.use("/auth",require('./routes/auth'));

app.listen(5000,()=>{
    console.log("server started @ port 5000");
});