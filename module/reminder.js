var mysqli = require('./mysqli');
var mysql = require('mysql');
var q = require('q');
var dat = require('date-util');


//Module To Get ALL reminders
exports.getreminders = function(req,mysql,q,datein_format,dateitem,type)
{
  
  var nextdate = '';
  $mysqli =  {};
  today = new Date().format('dddd');
  var nextdate = 0;
  var lastdate = 0;

  if(type == "customer"){
		if(dateitem == "Monday"){
		  	
		  	lastdate = 1;

		}
	}
	if(type == "station"){
		
		if(dateitem == "Sunday"){
		  	
		  	lastdate = 1;
		}
	}
	strQuery = mysqli.mysqli($mysqli,'getreminders');
	var escape_data = [datein_format,lastdate];
	var defered = q.defer();
    query =  mysql.query(strQuery,escape_data,defered.makeNodeResolver());
    console.log( query.sql );
    return defered.promise;
}
//Module To Update ang Log SMS
exports.smslog = function(req,mysql,q,smsdata,smscount,ssid,phonenumber,customerid )
{

  $mysqli =  {};
  strQuery = mysqli.mysqli($mysqli,'smslog');
  var escape_data = [smsdata,smscount,ssid,phonenumber,customerid];
  var defered = q.defer();
  query =  mysql.query(strQuery,escape_data,defered.makeNodeResolver());
  console.log(query.sql);
  return defered.promise;
}
//Module to Send SMS without any Count
exports.smslogwithnocount = function(req,mysql,q,smsdata,smscount,ssid,phonenumber,customerid )
{

  $mysqli =  {};
  strQuery = mysqli.mysqli($mysqli,'smslogwithnocount');
  var escape_data = [smsdata,smscount,ssid,phonenumber,customerid];
  var defered = q.defer();
  query =  mysql.query(strQuery,escape_data,defered.makeNodeResolver());
  console.log(query.sql);
  return defered.promise;
}
//Module To Update Reminder table
exports.updatereminders = function(req,mysql,q,reminderid,type)
{

  $mysqli =  {};
  strQuery = mysqli.mysqli($mysqli,'updatereminders');
  var escape_data = [reminderid,type];
  var defered = q.defer();
  query =  mysql.query(strQuery,escape_data,defered.makeNodeResolver());
  console.log(query.sql);
  return defered.promise;

}
//Module To Give Satistics
exports.statistics =  function(req,mysql,q,type)
{
 
  $mysqli =  {};
  strQuery = mysqli.mysqli($mysqli,'statistics');
  var escape_data = [type];
  var defered = q.defer();
  query =  mysql.query(strQuery,escape_data,defered.makeNodeResolver());
  return defered.promise;

}

/*exports.loggeddata =  function(req,mysql,q)
{

  $mysqli =  {};
  strQuery = mysqli.mysqli($mysqli,'getLogs');
  var escape_data = [];
  var defered = q.defer();
  query =  mysql.query(strQuery,escape_data,defered.makeNodeResolver());
  console.log(query.sql);
  return defered.promise;

}

exports.removeloggeddata =  function(req,mysql,q)
{

  $mysqli =  {};
  strQuery = mysqli.mysqli($mysqli,'removeloggeddata');
  var escape_data = [];
  var defered = q.defer();
  query =  mysql.query(strQuery,escape_data,defered.makeNodeResolver());
  console.log(query.sql);
  return defered.promise;

}*/