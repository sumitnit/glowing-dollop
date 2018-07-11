var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var blogModel = new Schema({

	title: {type: String,default:'',required:true},
	subTitle: {type: String,default:''},
	blogBody: {type: String,default:''},
	tags: [],
	created: {type: Date},
	lastModified: {type:Date},
	authorInfo: {
		name: {type:String},
		email: {type: String}
	}
});

mongoose.model('blog',blogModel);