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
  global.connect = mysql.createPool(global.dbconfig); 
      
  global.connect.getConnection(function(err, connection) {

    if(err){
      console.log(err);
      return false;
    }
     global.mysql = connection;
  });
    
   //console.log(global);
  
   return global;
}