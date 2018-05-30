'use strict';

const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
 
	userName : {type: String, required: true },
	password: {type:String, required: true},	
	currentCash : Number,
	careerCash : Number,
	manualClicks : Number,
	menuState : Boolean,
	clickValue : Number,
	signedIn : Boolean,
	assets: 
	{
		employees: Number,
		trucks: Number,
		planes: Number
	},
	loading : Boolean,
	error : String	
}
);


userSchema.set('toObject', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
		delete ret.__v;
		delete ret.password;
  }
});

module.exports = mongoose.model('User', userSchema);