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
mysqli['getreminders'] = "call getReminders( ?, ? )";
mysqli['updatereminders'] = "call updateReminders( ? )";
mysqli['statistics'] = "call getStatistics(?)";
mysqli['gettemplates'] = "call smsTemplates(?)";
mysqli['smslogwithnocount'] = "call smsLogwithnoCount(?, ?, ?, ?, ?)";
mysqli['certificatereminder'] = "call certificateReminder( )";
mysqli['cronLog'] = "call getcronLog( ?, ?)";

