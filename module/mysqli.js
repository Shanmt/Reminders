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


mysqli['smslog'] = "call addSMSlog(?, ?, ?, ?, ?)";
mysqli['getdatasp'] = "call getServiceStation( ? )";
mysqli['getreminders'] = "call getReminders( ?, ? )"; // Interval_day: Integer :  Difference from current date; lastday: Integer : Select data from Lastday or Not values 1 or 0; Used to handle Sunday
mysqli['updatereminders'] = "call updateReminders( ? )"; // reminder_id : Integer
mysqli['statistics'] = "call getStatistics(?)"; // type: Weekly/daily
mysqli['gettemplates'] = "call smsTemplates(?)"; // get template event from smstemplates
mysqli['smslogwithnocount'] = "call smsLogwithnoCount(?, ?, ?, ?, ?)"; // smsdata: SMS test; counts: SMS message Count; ssid : ServiceStation id; _tonumber : Sent Phone number; _customerid: Customer ID
mysqli['certificatereminder'] = "call certificateReminder( )"; 
mysqli['cronLog'] = "call getcronLog( ?, ?)";  // _cron: values are either insert/getlog ; _type: Type of reminder event 

