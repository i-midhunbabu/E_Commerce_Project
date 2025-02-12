const mongo = require('mongodb').MongoClient;
const client = new mongo('mongodb://localhost:27017')
function Database(){
    return client.connect().then((result)=>{
        var data = result.db('Machine_Test');
        return data;
    })
}
module.exports = Database();