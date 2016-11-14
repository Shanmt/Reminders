exports.mysqli = function(data,row)
{
     k = mysqli[row];

     for(var i in data)
     {

         k = k.replace(new RegExp('{{'+i+'}}', 'g'), data[i]);


     }
    
     return k;
}


var mysqli = [];

//mysqli['getremainder'] = "SELECT cr.*,cust.customername,cust.contact as customerphone,cust.ssid as stationid,sms.*,sd.*,cv.registrationid FROM customer_reminders cr inner join customer cust on cr.customerid = cust.customerid inner join servicestationdetails sd on sd.servicestationid = cust.ssid inner join smsmain sms on sms.servicestationid = cust.ssid inner join customer_vehicle cv on cv.vehicleid = cr.vehicleid  where reminderdate = CURDATE()";
mysqli['smslog'] = "call addSMSlog(?, ?, ?, ?, ?)";
mysqli['getdatasp'] = "call getServiceStation( ? )";
mysqli['getreminders'] = "call getReminders( ?, ? )";
mysqli['updatereminders'] = "call updateReminders( ? )";
mysqli['statistics'] = "call getStatistics(?)";
mysqli['gettemplates'] = "call smsTemplates(?)";
mysqli['smslogwithnocount'] = "call smsLogwithnoCount(?, ?, ?, ?, ?)";

/*mysqli['getLogs'] = "call getLogs()";
mysqli['removeloggeddata'] = "call removeLogs()";*/