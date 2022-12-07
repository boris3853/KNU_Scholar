var oracledb = require('oracledb');
var dbConfig = require('./config/dbConfig');
oracledb.autoCommit = true;

// 큐
const queue= [];

const enqueue= (data)=>{
    queue.push(data);
};
const dequeue= ()=>{
  return queue.shift();
};

arr = []


async function run(){
    let oraConnection;
    try{
        oraConnection = await oracledb.getConnection({
            user            : dbConfig.user,
            password        : dbConfig.password,
            connectString   : dbConfig.connectString
        });
        oracledb.outFormat = oracledb.OBJECT;

        let result1

        do{
            result1 = await oraConnection.execute(
                'select r.ed_doi from reference r where r.ing_doi = :doi',
                [dequeue()]
            );
            
            if(result1.rows.length == 0) continue;
            // console.log(result1);

            len = result1.rows.length;
            for(var i=0;i<len;++i){
                var n_ = result1.rows[i].ED_DOI
                FindTitle(n_);
                arr.push({id:n_, label:FindTitle(n_)});
                enqueue(n_);
                console.log({id:n_, label:FindTitle(n_)});
            }
        }while(queue.length);

    }catch (err) {
        console.error(err);
    }finally {
        if (oraConnection) {
            try {
                await oraConnection.close();
                // console.log("end connection...");
            } catch (err) {
                console.error(err);
            }
        }
    }
}

async function FindTitle(num){
    let oraConnection;
    try{
        oraConnection = await oracledb.getConnection({
            user            : dbConfig.user,
            password        : dbConfig.password,
            connectString   : dbConfig.connectString
        });
        oracledb.outFormat = oracledb.OBJECT;

        let result1 = await oraConnection.execute(
            'select p.title from paper p where doi = :doi',
            [num]
        );
        
        // console.log(result1.rows[0].TITLE);
        

    }catch (err) {
        console.error(err);
    }finally {
        if (oraConnection) {
            try {
                await oraConnection.close();
                // console.log("end connection...");
            } catch (err) {
                console.error(err);
            }
        }
    }
}

async function print(){
    await console.log(arr)
}


var num = 551;
arr.push({id:num, label:FindTitle(num)});
enqueue(num);
run()
print()

// console.log(arr)
// enqueue(5)
// FindTitle(5)
// run();
// console.log(dequeue() == null)