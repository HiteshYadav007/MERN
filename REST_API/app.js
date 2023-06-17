const express = require('express');
const bodyParser = require('body-parser');

const authRoutes = require('./routes/auth');
const feedRoutes = require('./routes/feed'); 

const mongoose = require('mongoose');
const app = express();
const path = require('path');
const multer = require('multer');
const { Server } = require('socket.io');
const { createServer } = require("http");


// const { v4 : uuidv4 } = require('uuid');

const fileStorage = multer.diskStorage({
	destination:(req,file,callback) => {
		callback(null,'images/');
	},
	filename:(req,file,callback) => {
		callback(null,new Date().getTime() + '-' + file.originalname)
	}
});

const fileFilter = (req , file, callback) => {
	if(file.mimeType === 'image/jpeg' || file.mimeType === 'image/jpg' || file.mimeType === 'image/png')
	{
		callback(null,true);
	}
	else{
		callback(null,true);
	}
};
//app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); 
app.use(multer({
	storage:fileStorage,
	fileFilter:fileFilter
}).single('image') 
);
app.use('/images',express.static(path.join(__dirname,'/images')));
app.use((req,res,next)=>{
	res.setHeader('Access-Control-Allow-Origin','*');
	res.setHeader('Access-Control-Allow-Methods','GET, POST, PUT , PATCH, DELETE');
	res.setHeader('Access-Control-Allow-Headers','Content-Type,Authorization');
	next();
});

app.use('/feed',feedRoutes);
app.use('/auth',authRoutes);



app.use((error , req, res, next) => {
	console.log(error);
	const status = error.statusCode || 500;
	const message = error.message;
	const data = error.data;
	res.status(status).json({message:message,data:data});

})

const httpServer = createServer(app);
mongoose
.connect('mongodb://0.0.0.0:27017/messages')
	.then(result=>{
	const io = require('./socket').init(httpServer);
	io.on('connection',socket => {
		console.log('Client Connected');
	});
	httpServer.listen(8080)
	})
	.catch(err=>console.log(err));
