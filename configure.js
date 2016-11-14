var mysql = require('mysql');
exports.app = function()
{  

	
  
   global.url = 'http://localhost:8081/';
   global.dbconfig = {
       host: "localhost",
       user: "root",
       password: "",
      database : 'clubauto_cloud2.3'
      };
   function handleDisconnect()
   {  

   	  global.connect = mysql.createConnection(global.dbconfig); 
      
      global.connect.connect();
      
      global.connect.on('close', function (err) {
        handleDisconnect();
      });
      
      global.connect.on('end', function (err) {
        handleDisconnect();
      });
      
      global.connect.on('error', function(err) {
         if(err.code === 'PROTOCOL_CONNECTION_LOST') { 
             handleDisconnect();                        
          } 
          else {
           console.log(err);
           //throw err;
         }
      });
      
      global.mysql = global.connect;
    }
   //console.log(global);
   handleDisconnect();

   return global;
}