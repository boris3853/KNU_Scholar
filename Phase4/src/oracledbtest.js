var oracledb = require('oracledb');
var dbConfig = require('./config/dbConfig');
oracledb.autoCommit = true;

function showpost(req, res){

}


function run()
{
    // 로그인 데이터 조회 처리
    oracledb.getConnection({
        user            : dbConfig.user,
        password        : dbConfig.password,
        connectString   : dbConfig.connectString
    },
    function(err, connection) {
        if (err) {
            console.error(err.message);
            return;
        }

        // PrepareStatement 구조
        // let query = 'SELECT p_no, title, id, date_time FROM POST WHERE CATEGORY = :KIND';
        // let query = 'select p.title from paper p where doi = :doi';
        let query = 'select r.ed_doi from reference r where r.ing_doi = :doi';


        let binddata = [

            5411           
        ];



        connection.execute(query, binddata, function (err, result) {
        // connection.execute(query, function (err, result) {
            console.log(result)
            // console.log(result.rows[0][0]);
            console.log(result.rows.length);


            
            
        });
        connection.release;
        // DB 연결 해제
        
    });    

    
}

run();

// console.log(Date());