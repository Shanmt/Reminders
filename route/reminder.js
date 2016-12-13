var express = require('express');
var reminders = require('../module/reminder');
var sms = require('../module/sms');
var mysqli = require('../module/mysqli');
var q = require('q');
var request = require('request');
var qs = require('querystring')
var app = express();
var dat = require('date-util');
var http = require('http');
var _ = require('lodash');
var config = require('../configure');
config.app();

var CronJob = require('cron').CronJob;
//Daily Customer reminders

new CronJob('20 10 09 * * 1-6', function() {
  request({
        rejectUnauthorized: false,
        url:global.url+'reminder/all'
    }, function(error, response, body) {
    	
        if (!error && response.statusCode == 200) {
            console.log('Successfull daily reminder cron');
            
        }
        else{

            console.log('Failed daily reminder cron');
            console.log(error);
        }
    })
}, null, true, "Asia/Kolkata");

new CronJob('20 10 21 * * 1-6', function() {
  request({
        rejectUnauthorized: false,
        url:global.url+'reminder/daily_statistics'
    }, function(error, response, body) {
    	
        if (!error && response.statusCode == 200) {
            console.log('Successfull daily reminder cron');
            
        }
        else{

            console.log('Failed daily reminder cron');
            console.log(error);
        }
    });
}, null, true, "Asia/Kolkata");

new CronJob('20 30 21 * * 5', function() {
  request({
        rejectUnauthorized: false,
        url:global.url+'reminder/weekly_statistics'
    }, function(error, response, body) {
    	
        if (!error && response.statusCode == 200) {
            console.log('Successfull weekly status cron');
            
        }
        else{

            console.log('Failed weekly status cron');
            console.log(error);
        }
    });
}, null, true, "Asia/Kolkata");

new CronJob('20 22 18 * * 1-6', function() {
  request({
        rejectUnauthorized: false,
        url:global.url+'reminder/certificate_reminder'
    }, function(error, response, body) {
    	
        if (!error && response.statusCode == 200) {
            console.log('Successfull weekly status cron');
            
        }
        else{

            console.log('Failed weekly status cron');
            console.log(error);
        }
    });
}, null, true, "Asia/Kolkata");

//Function to send Daily Reminders
app.get('/all', function (req, res) {
    
    //query to get all reminders list
    today = new Date().format('dddd');
    
    datein_format = 7;
    dateitem =  new Date().strtotime("+"+datein_format+" day").format('dddd');
    
    if(today != 'Sunday'){
	    
	    //Listing & sending SMS 7 Days before the reminder date to Customer
	    q.all([reminders.getreminders(req, global.mysql, q,datein_format,dateitem,"customer"),reminders.cronLog(req, global.mysql, q,'customer_reminder','getLog')]).then(function (results) {

	    	if(results[1][0][0][0].logcount < 1){ //Flagging Cron

		    	rows = results[0][0][0];
		    	
			   	var message = '';
		
				for(var i = 0;i < rows.length; i++){

					sscontact = rows[i].contactnumber;
					cust_name= rows[i].customername;
					ssid = rows[i].ssid;
					phone = rows[i].customerphone;
					senderid = rows[i].SenderID;
					customer_id = rows[i].customerid;
					reminderid = rows[i].reminderid;

					//Message to customer
					customer_message = "Dear "+rows[i].customername+", Thank you being an esteemed customer with "+rows[i].servicestation+". Your vehicle service is due. Kindly contact "+rows[i].contactperson+" ( "+rows[i].contactnumber+" ) for booking.";
					
					//checking SMS Count
					var smscount = parseInt( customer_message.length / 160 ) + 1;
					
					var available_message = rows[i]['creditSMS'] - rows[i]['SMSused'];
					
					var smsused = rows[i]['SMSused'];
					if((available_message - smscount)  > 0){
						//sending SMS to Customer
						
						sms.smsrequest(req,customer_message,ssid,phone,customer_id,smsused,senderid,reminderid);
						console.log(rows[i].customername+' of '+rows[i].servicestation+' Recieved Service Reminders');
					}
					else{
						console.log(ssid+' SMS Quota Ends *****');
					}
					
				}
				reminders.cronLog(req, global.mysql, q,'customer_reminder','insert');
			}
			else{
				console.log('Cron Already Executed');
			}
			
	    }).fail(function(err){
			console.log(err.stack);
			throw err;
	    });	
	
		//Listing & sending SMS 6 Days before the reminder date to Service Station
	

	    datein_sformat =  6;
		seller_dateitem =  new Date().strtotime("+"+datein_sformat+" day").format('dddd');

		

	    q.all([reminders.getreminders(req, global.mysql, q,datein_sformat,seller_dateitem,"station"),reminders.cronLog(req, global.mysql, q,'servicestation_reminder','getLog')]).then(function (results2) {

	    	if(results2[1][0][0][0].logcount < 1){ //Flagging Cron

		    	allrows = results2[0][0][0];
		    	
		 		var stationlist = [];
		 		
	 			//Listing All Service Station to Remind about their Users
	 			for(var l = 0;l < allrows.length; l++){
	 				
	 				ssid = allrows[l].ssid;
	 				if(stationlist.indexOf(ssid) == -1){
						stationlist.push( ssid );
					}

	 			}
	 			
	 			var stationnumbers = stationlist.length;
	 			//Looping to Sort List of customers of a particular Station
	 			for(var st = 0;st< stationnumbers;st++){
						
						var stationnumber;
						var stationname;
						var current_sms_stats;
						var senderid;
						var customer_count = 0;
						var vehicle;
						var seller_msg = "";
						
						var message_start_length;
						var customer_details_length;
						var temp_counter = 1;
						var customer_details = "";
						var message_start = "Dear [contactname], You have [customer_count] vehicles due for service at [stationname]";
						for(var k = 0;k < allrows.length; k++){
							if(allrows[k].ssid == stationlist[st]){
								
								stationnumber = allrows[k].contactnumber;
								contactname = allrows[k].contactperson;
								stationname = allrows[k].servicestation;
								reminderdate = allrows[k].reminderdate;
								current_sms_stats = allrows[k]['creditSMS'] - allrows[k]['SMSused'];
								senderid = allrows[k].SenderID;
								customer_details = "%0a"+allrows[k].customername+" ( "+allrows[k].registrationid+' ) - '+allrows[k].customerphone;
								
								customer_count = customer_count + 1;

								message_start = message_start.replace("[contactname]", contactname);
								if(k == (allrows.length-1)){ message_start = message_start.replace("[customer_count]", customer_count); }
							    message_start = message_start.replace("[stationname]", stationname);

							    var count_string = new String( customer_count );
							    phrases_toignore = "[stationname]".length - count_string.length;
								message_start_length = parseInt(message_start.length - phrases_toignore);
								customer_details_length = parseInt(customer_details.length - (customer_count * 2));
								

								//Split SMS Based on Charcater count.. If Contact Details of a particular customer's length with SMS Text
								if(parseInt(customer_details_length+message_start_length) > (temp_counter*160)){
									
									spacer = '';
									space_limt = parseInt((temp_counter * 160) - message_start_length);
									for(var m = 0; m< space_limt; m++){
										spacer += " ";
									}
									message_start += spacer;
									message_start += customer_details;
									temp_counter = parseInt(temp_counter+1);
								}
								else{
									message_start += customer_details;
								}
								
							}

						}
												
						//reminderdate = dateformat(reminderdate, "dd-mm-yyyy");
						
						//var sell_message_start = "Dear "+contactname+ ", You have "+customer_count+" "+vehicle+" due for service at "+stationname;
						var footer_note = "%0a%0aAutopad - 9400288828";
						seller_msg = message_start+footer_note;
						var sellersmscount = parseInt( seller_msg.length/ 160 ) + 1 ;
						
						
						if((current_sms_stats - sellersmscount)  > 0){

							//sms.smsrequest(req,seller_msg,stationlist[st],stationnumber,"ServiceStation",sellersmscount,senderid,0);
							console.log(stationname+' Received Customer Service Reminders');
						}
						else{
							console.log(ssid + ' SMS Quota Ends *****');
						}
						
				}

				reminders.cronLog(req, global.mysql, q,'servicestation_reminder','insert');
			}
			else{
				console.log('Cron Already Executed');
			}

	    	
		global.mysql.release();
	    }).fail(function(err){
			console.log(err.stack);
			throw err;
	   });	

	    
	}

	
    res.end();
    return false;

});


/*app.get('/keeplogbackup', function (req, res) {

	//Listing & sending SMS weekly statistics to Customer

	    q.all([reminders.loggeddata(req, global.mysql, q)]).then(function (results) {
    		
	    		date_check =  new Date().format('dddd');
    			dateitem =  new Date().format('ddmmyyyy');
    			console.log( date_check );
	    		var fs = require('fs');
				var stream = fs.createWriteStream("Log-"+dateitem+".txt");
				stream.once('open', function(fd) {
					console.log( results[0][0][0] );

					var logs = '';
					for(var i = 0; i< results[0][0][0].length; i++){
						logs = results[0][0][0][i]['loghead']+'-----'+results[0][0][0][i]['logDescription']+'-----'+results[0][0][0][i]['logstatus']+'-----'+results[0][0][0][i]['createdDate']
						stream.write(logs+"\r\n");
					}
					

				  stream.end();
				q.all([reminders.removeloggeddata(req, global.mysql, q)]).then(function (results) { });  

				});
	    	
	    });
	    res.end();
	    return false;

});*/

app.get('/daily_statistics', function (req, res) {
	date_check =  new Date().format('dddd');
	
	if(date_check != "Sunday"){
		//Listing & sending SMS Daily Summmary to Customer

	    q.all([reminders.statistics(req, global.mysql, q,'daily'),sms.getTemplates(req, global.mysql, q,'dailystatus'),reminders.cronLog(req, global.mysql, q,'dailystatus','getLog')]).then(function (results) {

	    	if(results[2][0][0][0].logcount < 1){ //Flagging Cron

		    	allrows = results[0][0][0];
		    	template = results[1][0][0][0].smsbody;
				
		    	var seller_msg = template;
	 			
	 			//Looping to Sort List of customers of a particular Station
	 			for(var i = 0;i< allrows.length;i++){
						
						
					
					var seller_msg = template;	
					seller_msg = seller_msg.replace('[contactname]', allrows[i].contactperson);
					seller_msg = seller_msg.replace('[total_amount]', allrows[i].amountcollected);
					seller_msg = seller_msg.replace('[total_new_jobs]', allrows[i].totaljobs);
					seller_msg = seller_msg.replace('[total_delivery]', allrows[i].ontime);
					seller_msg = seller_msg.replace('[job_completed]', allrows[i].total_completed);
					seller_msg = seller_msg.replace('[pending_job]', allrows[i].pending_job);

					
					var sellersmscount = parseInt( seller_msg.length/ 160 ) + 1;
					
					
					if(allrows[i].daily_report == 1){
						
						sms.smsrequestwithno_count(req,seller_msg,allrows[i].ssid,allrows[i].contactnumber,"ServiceStation",sellersmscount,allrows[i].SenderID);
						console.log(allrows[i].servicestation+' Recieved Daily Report Feature');
					}
					else{

						console.log(allrows[i].servicestation+' Disabled Daily Report Feature *****');
					}
						
				}
				reminders.cronLog(req, global.mysql, q,'dailystatus','insert');
			}
			else{
				console.log('Cron Already Executed');
			}

		global.mysql.release();
	   }).fail(function(err){
			console.log(err.stack);
			throw err;
	   });	
	}

	res.end();   
	return false;

});


app.get('/weekly_statistics', function (req, res) {
	date_check =  new Date().format('dddd');
	
	if(date_check != "Sunday"){
		//Listing & sending SMS Weekly Summmary to Customer

	    q.all([reminders.statistics(req, global.mysql, q,'weekly'),sms.getTemplates(req, global.mysql, q,'weeklystatus'),reminders.cronLog(req, global.mysql, q,'weeklystatus','getLog')]).then(function (results) {
	    	
	    	if(results[2][0][0][0].logcount < 1){ //Flagging Cron

		    	allrows = results[0][0][0];
		    	template = results[1][0][0][0].smsbody;
				
		    	console.log( allrows.length );
	 			
	 			//Looping to Sort List of customers of a particular Station
	 			
	 			for(var i = 0;i< allrows.length;i++){
						
					var seller_msg = template;	
					
					
					seller_msg = seller_msg.replace('[contactname]', allrows[i].contactperson);
					seller_msg = seller_msg.replace('[total_amount]', allrows[i].amountcollected);
					seller_msg = seller_msg.replace('[total_new_jobs]', allrows[i].totaljobs);
					seller_msg = seller_msg.replace('[total_delivery]', allrows[i].ontime);
					seller_msg = seller_msg.replace('[job_completed]', allrows[i].total_completed);
					seller_msg = seller_msg.replace('[pending_job]', allrows[i].pending_job);

					
					var sellersmscount = parseInt( seller_msg.length/ 160 ) + 1;
					
					
					if(allrows[i].weekly_report == 1){
						
						sms.smsrequestwithno_count(req,seller_msg,allrows[i].ssid,allrows[i].contactnumber,"ServiceStation",sellersmscount,allrows[i].SenderID);
						console.log(allrows[i].servicestation+' Recieved Weekly Report Feature');
					}
					else{

						console.log(allrows[i].servicestation+' Disabled Weekly Report Feature *****');
					}
						
				}
				reminders.cronLog(req, global.mysql, q,'weeklystatus','insert');
			}
			else{
				console.log('Cron Already Executed');
			}

		global.mysql.release();
	   }).fail(function(err){
			console.log(err.stack);
			throw err;
	   });		
	}

	res.end();   
	return false;

});

app.get('/certificate_reminder', function (req, res) {
	
	q.all([reminders.getcertificatereminders(req, global.mysql, q)]).then(function (results) {

	
	//Insurance Results
	var insurance = results[0][0][0];
	var fitness = results[0][0][1];
	var emission = results[0][0][2];
	var tax = results[0][0][3];
	
	for(var i = 0;i<insurance.length;i++){
		if(insurance[i].insurance_reminder_status == 1){
			var dateexpiry = insurance[i].insuranceexpiry.format('dd-mm-yyyy');
			customer_message = "Dear "+insurance[i].customername+", Thank you for being an esteemed customer with "+insurance[i].servicestation+". Your vehicle (" + insurance[i].registrationid  +") insurance  will expire on "+dateexpiry;
			var smscount = parseInt( customer_message.length / 160 ) + 1;
			//console.log( customer_message );	
			var available_message = insurance[i].creditSMS - insurance[i].SMSused;
			
			var smsused = insurance[i].SMSused;
			if((available_message - smscount)  > 0){
				//sending SMS to Customer
				
				sms.smsrequest(req,customer_message,insurance[i].ssid,insurance[i].customer_contact,insurance[i].customer_id,smsused,insurance[i].SenderID,0);
				console.log(insurance[i].customername+' of '+insurance[i].servicestation+' Recieved Insurance Reminders');
			}
			else{
				console.log(insurance[i].ssid+' SMS Quota Ends *****');
			}

		}
		else{
			console.log(insurance[i].ssid+' is disabled insurance reminders *****');
		}
	}
	
	for(var j = 0;j<fitness.length;j++){
		
		if(fitness[j].fitness_reminder_status == 1){
			var dateexpiry = fitness[j].fitnessexpiry.format('dd-mm-yyyy');
			customer_message = "Dear "+fitness[j].customername+", Thank you for being an esteemed customer with "+fitness[j].servicestation+". Your vehicle (" + fitness[j].registrationid  +")  fitness  certificate  will expire on "+dateexpiry;
			var smscount = parseInt( customer_message.length / 160 ) + 1;
			//console.log( customer_message );	
			var available_message = fitness[j].creditSMS - fitness[j].SMSused;
			
			var smsused = fitness[j].SMSused;
			if((available_message - smscount)  > 0){
				//sending SMS to Customer
				
				sms.smsrequest(req,customer_message,fitness[j].ssid,fitness[j].customer_contact,fitness[j].customer_id,smsused,fitness[j].SenderID,0);
				console.log(fitness[j].customername+' of '+fitness[j].servicestation+' Recieved Fitness Reminders');
			}
			else{
				console.log(fitness[j].ssid+' SMS Quota Ends *****');
			}

		}
		else{
			console.log(fitness[j].ssid+' is disabled fitness reminders *****');
		}
	}
	
	for(var k = 0;k<emission.length;k++){
		if(emission[k].emission_reminder_status == 1){
			var dateexpiry = emission[k].emissionexpiry.format('dd-mm-yyyy');
			customer_message = "Dear "+emission[k].customername+", Thank you for being an esteemed customer with "+emission[k].servicestation+". Your vehicle  (" + emission[k].registrationid  +")  Emission/Pollution certificate will expire on "+dateexpiry;
			var smscount = parseInt( customer_message.length / 160 ) + 1;
			//console.log( customer_message );	
			var available_message = emission[k].creditSMS - emission[k].SMSused;
			
			var smsused = emission[k].SMSused;
			if((available_message - smscount)  > 0){
				//sending SMS to Customer
				
				sms.smsrequest(req,customer_message,emission[k].ssid,emission[k].customer_contact,emission[k].customer_id,smsused,emission[k].SenderID,0);
				console.log(emission[k].customername+' of '+emission[k].servicestation+' Recieved Emission Reminders');
			}
			else{
				console.log(emission[k].ssid+' SMS Quota Ends *****');
			}

		}
		else{
			console.log(emission[k].ssid+' is disabled emission reminders *****');
		}
	}
	
	for(var l = 0;l<tax.length;l++){
		if(tax[l].taxexpiry_reminder_status == 1){
			var dateexpiry = tax[l].tax_expiry.format('dd-mm-yyyy');
			customer_message = "Dear "+tax[l].customername+", Thank you for being an esteemed customer with "+tax[l].servicestation+". Your vehicle (" + tax[l].registrationid  +") tax will expire on "+dateexpiry;
			var smscount = parseInt( customer_message.length / 160 ) + 1;
			//console.log( customer_message );	
			var available_message = tax[l].creditSMS - tax[l].SMSused;
			
			var smsused = tax[l].SMSused;
			if((available_message - smscount)  > 0){
				//sending SMS to Customer
				
				sms.smsrequest(req,customer_message,tax[l].ssid,tax[l].customer_contact,tax[l].customer_id,smsused,tax[l].SenderID,0);
				console.log(tax[l].customername+' of '+tax[l].servicestation+' Recieved Tax Reminders');
			}
			else{
				console.log(tax[l].ssid+' SMS Quota Ends *****');
			}

		}
		else{
			console.log(tax[l].ssid+' is disabled tax reminders *****');
		}
	}

	global.mysql.release();
	}).fail(function(err){
			console.log(err.stack);
			throw err;
	});	

	res.end();
	return false;

	
});


module.exports = app;