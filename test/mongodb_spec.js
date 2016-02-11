'use strict';

//import declaration
var mongoose = require("mongoose");
var chai = require("chai");
var expect = require("chai").expect;
var MongoDBConnection = require("../lib/mongodb_connection");
var mongodb_config = require("../lib/config/mongodb_config");
var mongodb_connection = new MongoDBConnection(mongodb_config);

describe("MongoDB connection", function(){
	describe("#openConnection()", function(){
		it("should return 1 if MongoDB is connected", function(done){
			mongodb_connection.openConnection();
			
			setTimeout(function(){
				expect(mongoose.connection.readyState).to.be.equal(1);
				done();
			}, 3000);
		});
	});

	describe("#closeConnection()",function(){
		it("should return 0 if MongoDB is disconnected", function(done){
			mongodb_connection.closeConnection();
			setTimeout(function(){
				expect(mongoose.connection.readyState).to.be.equal(0);
				done();
			}, 3000);
		});
	});
});