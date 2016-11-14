var mysqli = require('./mysqli');
var mysql = require('mysql');
var q = require('q');
var dat = require('date-util');
var reminders = require('./reminder');
var request = require('request');
var dateformat = require('dateformat');
var mysqli = require('./mysqli');


//Module To Get "event" Templates
exports.getTemplates = function(req,mysql,q,event)
{

  $mysqli =  {};
  strQuery = mysqli.mysqli($mysqli,'gettemplates');
  var escape_data = [event];
  var defered = q.defer();
  query =  mysql.query(strQuery,escape_data,defered.makeNodeResolver());
  console.log(query.sql);
  return defered.promise;
}

//function to Send SMS
exports.smsrequestwithno_count = function (req,customer_message,ssid,phone,customer_id,smsused,senderid){
	var message = '';
	api_url = "http://mysms.msgclub.net/rest/services/sendSMS/sendGroupSms?AUTH_KEY=ff10fa8b46156b3429369cbe66f3f1c4&message="+customer_message+"&senderId="+senderid+"&routeId=1&mobileNos="+phone+"&smsContentType=english";
	
	request( api_url  ,function (error, response, body) {
			
			
	    if (!error && response.statusCode == 200) {
	    	
	    	var result = JSON.parse(body);
	        if (result.responseCode != "3001") {
	             console.log("Error");
	        }
	    	else{
	        	$mysqli2 = {};
	        	var smslog = customer_message;
	        	var smscount = parseInt( smslog.length/160 ) + 1;
	        	
	        	//Adding current SMS count with SMS Length
	        	var sms_used = smsused + smscount;
	        	var servicestation = ssid;
	        	var nows = new Date();
	        	var createddate = dateformat(nows, "yyyy-mm-dd hh:mm:ss");
	        	var tomobile = phone;
	        	var customerid = customer_id;
	        	// Adding Urgument to Update SMSLOG Table
	        	

	        	//Update SMS LOG
	        	q.all([reminders.smslogwithnocount(req, global.connect, q,smslog,smscount,ssid,phone,customerid)]).then( function(results) {} );
	        	
					        	
	        				        				        	
	   		}
	        
	    }

	});
}

//function to Send SMS
exports.smsrequest = function (req,customer_message,ssid,phone,customer_id,smsused,senderid,reminderid){
	var message = '';
	api_url = "http://mysms.msgclub.net/rest/services/sendSMS/sendGroupSms?AUTH_KEY=ff10fa8b46156b3429369cbe66f3f1c4&message="+customer_message+"&senderId="+senderid+"&routeId=1&mobileNos="+phone+"&smsContentType=english";
	
	
	var message = '';
    	
    	request( api_url  ,function (error, response, body) {
				
				
		    if (!error && response.statusCode == 200) {
		    	
		    	
		    	var result = JSON.parse(body);
		    	if (result.responseCode != "3001") {

		            console.log(error);

		        }
		    	else{
		        	
		        	$mysqli2 = {};
		        	var smslog = customer_message;
		        	var smscount = parseInt( smslog.length/160 ) + 1;
		        	
		        	//Adding current SMS count with SMS Length
		        	var sms_used = smsused + smscount;
		        	var servicestation = ssid;
		        	var nows = new Date();
		        	var createddate = dateformat(nows, "yyyy-mm-dd hh:mm:ss");
		        	var tomobile = phone;
		        	var customerid = customer_id;
		        	// Adding Urgument to Update SMSLOG Table
		        	

		        	//Update SMS Count and SMS LOG
		        	q.all([reminders.smslog(req, global.connect, q,smslog,smscount,ssid,phone,customerid)]).then( function(results) {} );
		        	
					if(reminderid > 0){

						reminders.updatereminders(req, global.connect, q,reminderid );
					}		        	
		        				        				        	
		   		}
		        

		    }

	});
}
