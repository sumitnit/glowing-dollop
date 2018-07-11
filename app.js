var express = require('express');
var app = express();

var bodyParser = require('body-parser');

var mongoose = require('mongoose');

var blogModel = require('./blogModel.js')

app.use(bodyParser.json({limit:'10mb',extended:true}));
app.use(bodyParser.urlencoded({limit:'10mb',extended:true}));

var blog = mongoose.model('blog');

var dbPath = 'mongodb://localhost:27017/myblog';

db = mongoose.connect(dbPath);

mongoose.connection.once('open',function(req,res){
	console.log('Database Connection Open');
});

const urlLogger = (request, response, next) => {
  console.log('Request URL:', request.url);
  next();
};
const timeLogger = (request, response, next) => {
  console.log('Datetime:', new Date(Date.now()).toString());
  next();
};
app.use(urlLogger, timeLogger);

//API to Create a Blog
app.post('/create',function(req,res,next){
	if(req.body.title == '') {
		req.status = 'Blog title cannot be empty';
		next(req);
	}
	else {
		var newBlog = new blog({
		title: req.body.title,
		subTitle: req.body.subTitle,
		blogBody: req.body.blogBody,
		created: Date.now(),
		authorInfo: {
			name: req.body.authorName,
			email: req.body.authorEmail
		}
	});
	newBlog.tags = (req.body.tags!= undefined || req.body.tags!= null)?req.body.tags.split(','):'';
	newBlog.save(function(err,result){
		if(err) {
			req.status = 'Error creating Blog';
			next(req);
		}
		else
			res.send(result);
	});
	}
});

//API to view all Blogs
app.get('/allBlogs',function(req,res,next){
	blog.find(function(err,result){
		if(err){
			req.status = 'Error getting blogs';
			next(req);
		}
		else
			if(result!=null)
				res.send(result);
			else{
				req.status ='No Blogs Exist!!! Create a new Blog';
				next(req);
			}

	});
});

//API to view a particular Blog
app.get('/blog/:id',function(req,res,next){
	if(req.params.id) {
		req.status = 'ID is not present';
		next(req);
	}
	else
	{
		blog.findOne({'_id':req.params.id},function(err,result){
		if(err){
			res.send('No ID found')
		}
		else
			if(result!=null)
				res.send(result);
			else{
				req.status ='No ID found';
				next(req);
			}
	});
	}
});

//API to edit a blog
app.post('/blog/:id/edit',function(req,res,next){
	if(!req.params.id) {
		req.status = 'Id is not present'
		next(req);
	}
	if(req.body.title == '') {
		req.status = 'Blog title cannot be empty';
		next(req);
	}
	else {
		var update = {
		title: req.body.title,
		subTitle: req.body.subTitle,
		blogBody: req.body.blogBody,
		lastModified: Date.now(),
		authorInfo: {
			name: req.body.authorName,
			email: req.body.authorEmail
		}
	};
	update.tags = (req.body.tags!=undefined || req.body.tags!=null)?req.body.tags.split(','):'';
	blog.findOneAndUpdate({'_id':req.params.id},update,function(err,result){
		if(err) {
			req.status = 'Error while Updating';
			next(req);
		}
		else
			if(result!=null)
			{
				res.send(result);
			}
			else{
				req.status ='No ID found';
				next(req);
			}
	});
	}
});

//API to delete a blog
app.delete('/delete/:id',function(req,res,next){
	if(!req.params.id){
		req.status = 'Id is not present';
		next(req);
	}
	else {
		blog.remove({'_id':req.params.id},function(err,result){
		if(err) {
			req.status = 504;
			next(req);
		}
		else{
			res.send(result);
		}
	})
	}
});

// Error Handling
app.get('*',function(req,res,next){
	req.status = 404;
	next(req);
});

app.use(function(err,req,res,next){
	if(req.status == 504) {
		res.send('Blog doesn\'t exist');
	}
	if(req.status == 404) {
		res.send('Path not exists!!! Kindly check the route');
	}
	else {
		res.send(req.status);
	}
})



app.listen(3000,function(req,res){
	console.log('App started');
})