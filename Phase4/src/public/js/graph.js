// var oracledb = require('oracledb');
// var dbConfig = require('../../config/dbConfig');
// oracledb.autoCommit = true;


// // 큐
// const queue= [];

// const enqueue= (data)=>{
//     queue.push(data);
// };
// const dequeue= ()=>{
//   return queue.shift();
// };

// narr = [], earr = [];


// var doi = document.getElementById("val1").value;
// var title = document.getElementById("val2").value;

// main_();

// async function main_(){
//   narr.push({id:doi, label:title});
//   //await enqueue(num)
//   //await run()

//       // create an array with nodes
//   var nodes = new vis.DataSet(narr);

//   // create an array with edges
//   var edges = new vis.DataSet(earr);

//   // create a network
//   var container = document.getElementById("graph");
//   var data = {
//     nodes: nodes,
//     edges: edges,
//   };

//   var options = {
  
//   };
//   var network = new vis.Network(container, data, options);

// }

// async function run(){
//     let oraConnection;
//     try{
//         oraConnection = await oracledb.getConnection({
//             user            : dbConfig.user,
//             password        : dbConfig.password,
//             connectString   : dbConfig.connectString
//         });
//         oracledb.outFormat = oracledb.OBJECT;

//         let result1

//         do{
//             var temp = dequeue()
//             result1 = await oraConnection.execute(
//                 'select r.ed_doi from reference r where r.ing_doi = :doi',
//                 [temp]
//             );
            
//             if(result1.rows.length == 0) continue;
//             // console.log(result1);

//             len = result1.rows.length;
//             for(var i=0;i<len;++i){
//                 var n_ = result1.rows[i].ED_DOI
//                 FindTitle(n_);
//                 narr.push({id:n_, label:FindTitle(n_)});
//                 earr.push({from:temp, to:n_});
//                 enqueue(n_);
//                 console.log({id:n_, label:FindTitle(n_)});
//             }
//         }while(queue.length);

//     }catch (err) {
//         console.error(err);
//     }finally {
//         if (oraConnection) {
//             try {
//                 await oraConnection.close();
//                 // console.log("end connection...");
//             } catch (err) {
//                 console.error(err);
//             }
//         }
//     }
// }

// async function FindTitle(num){
//     let oraConnection;
//     try{
//         oraConnection = await oracledb.getConnection({
//             user            : dbConfig.user,
//             password        : dbConfig.password,
//             connectString   : dbConfig.connectString
//         });
//         oracledb.outFormat = oracledb.OBJECT;

//         let result1 = await oraConnection.execute(
//             'select p.title from paper p where doi = :doi',
//             [num]
//         );
        
//         // console.log(result1.rows[0].TITLE);
        

//     }catch (err) {
//         console.error(err);
//     }finally {
//         if (oraConnection) {
//             try {
//                 await oraConnection.close();
//                 // console.log("end connection...");
//             } catch (err) {
//                 console.error(err);
//             }
//         }
//     }
// }

// var oracledb = require('oracledb');
// var dbConfig = require('../../config/dbConfig');
// oracledb.autoCommit = true;

//   //await enqueue(num)
//   //await run()

//       // create an array with nodes
//   var nodes = new vis.DataSet(narr);

var doi = document.getElementById("val1").value;
var title = document.getElementById("val2").value;



narr = [
    { id: 1, label: "Node 1" },
    { id: 2, label: "Node 2" },
    { id: 3, label: "Node 3" },
    { id: 4, label: "Node 4" },
    { id: 5, label: "Node 5" },
  ];
narr.push({id:doi, label:title});

var nodes = new vis.DataSet(narr);

  // create an array with edges
  var edges = new vis.DataSet([
    { from: 1, to: 3 },
    { from: 1, to: 2 },
    { from: 2, to: 4 },
    { from: 2, to: 5 },
    { from: 3, to: 3 },
  ]);

  // create a network
  var container = document.getElementById("graph");
  var data = {
    nodes: nodes,
    edges: edges,
  };
  var options = {};
  var network = new vis.Network(container, data, options);
