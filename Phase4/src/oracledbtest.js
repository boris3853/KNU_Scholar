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
        let query = 'INSERT INTO POST VALUES(:ID, :PNO, :CTG, :TITLE, TO_DATE(SYSDATE, \'yyyy/mm/dd\'), 0, TO_CLOB(:CTNT))';
        // let query = "commit";

        // MainID,
        //     PostN,
        //     bind,
        //     req.body.title,
        //     ,
        //     req.body.description

        let binddata = [
            // "test2","test2"
            "test",
            51,
            "ANN",
            "제목 테스트",
            "내용 테스트"

            // Number(request.body.empno),
            // request.body.ename,
            // request.body.job,
            // request.body.mgr,
            // Number(request.body.sal),
            // Number(request.body.comm),
            // Number(request.body.deptno)            
        ];

        /*
        connection.execute(query, binddata, function (err, result) {
            if (err) {
                console.error(err.message);
                doRelease(connection);
                return;
            }
            console.log(result.rowsAffected);

            doRelease(connection, result.rowsAffected);         // Connection 해제
            */


        
        /*
        let query = 
            'SELECT COUNT(*) as EXIST FROM ACCOUNT ac WHERE ac.id ='
            + MainID + ' and ac.passwd = ' + MainPW;
            */
        connection.execute(query, binddata, function (err, result) {
        // connection.execute(query, function (err, result) {
            if (err) {
                console.error(err.message);
                doRelease(connection);
                return;
            }
            // console.log(Date(result.rows[0][2]));                   // 데이터
            
            /*
            console.log(new Date(result.rows[0][2]).getFullYear());
            console.log(new Date(result.rows[0][2]).getMonth()+1);
            console.log(new Date(result.rows[0][2]).getDay());

            let YY = new Date(result.rows[0][2]).getFullYear();
            let MM = new Date(result.rows[0][2]).getMonth() + 1;
            let DD = new Date(result.rows[0][2]).getDay();

            console.log(YY + "-" + MM + "-" + DD);
            */

            console.dir(result)

            // console.log(result.rows[0][0]);



            doRelease(connection, result.rows);         // Connection 해제
            
        });
        // DB 연결 해제
        function doRelease(connection, result) {
            connection.release(function (err) {
                if (err) {
                    console.error(err.message);
                }

                
            });
        }
        
    });    

    
}

run();

// console.log(Date());