'use strict';

const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
 
	userName : {type: String, required: true },	
	userEmail : {type: String, required: true},
	currentCash : Number,
	careerCash : String,
	manualClicks : String,
	menuState : Boolean,
	clickValue : String,
	signedIn : Boolean,
	employees :{
		name : String,
		count : Number,
		currentCost : Number,
		employeeSpeed : Number
	},
	trucks : {
		name : String,
		count : Number,
		currentCost : Number,
		employeeSpeed : Number
	},
	planes : {
		name : String,
		count : Number,
		currentCost : Number,
		employeeSpeed : Number
	},
	loading : Boolean,
	error : String	
}
);

module.exports = mongoose.model('User', userSchema);