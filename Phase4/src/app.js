var oracledb = require('oracledb');
var dbConfig = require('./config/dbConfig');
var express = require('express');
var ejs = require('ejs')
var asyncify = require('express-asyncify');
var bodyParser = require('body-parser');
var app = asyncify(express());
// var router = express.Router();
// var router = require('./router');

// 순서 유의
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// app.use('/', router);
app.use(express.static("public"))

app.set('view engine','ejs');

var PORT = process.env.PORT || 8000;

oracledb.autoCommit = true;

// 로그인 관련 Global 변수

var MainID = "Anonymous";
var MainPW = "";
// 0: 로그인 X    1: 로그인 O
var LoginState = 0;

async function init() {
    try {
        // Create a connection pool which will later be accessed via the
        // pool cache as the 'default' pool.
        await oracledb.createPool({
        user            : dbConfig.user,
        password        : dbConfig.password,
        connectString   : dbConfig.connectString,
        poolIncrement: 1, // only grow the pool by one connection at a time
        poolMax: 10, // maximum size of the pool. Increase UV_THREADPOOL_SIZE if you increase poolMax
        poolMin: 0, // start with no connections; let the pool shrink completely
        poolAlias: 'MainP',
        // enableStatistics: true // record pool usage for oracledb.getPool().getStatistics() and logStatistics()
        });
        console.log('Oracle DB Connection pool started');

        // Now the pool is running, it can be used
        //await dostuff();
    } catch (err) {
        console.error('init() error: ' + err.message);
    } finally {
        //await closePoolAndExit();
    }
}




app.get("/Login", (req, res) => {
    // 비로그인 상태면 Login1.ejs 화면
    if(!LoginState) res.render(__dirname + '/views/login1', {id: "Anonymous"});
    // 로그인 상태면 Login3.ejs 화면
    else res.render(__dirname + '/views/login3', {id: MainID});
});

// req 무시
app.post('/Login/SU', (req, res) => {
    if(!LoginState) res.render(__dirname + '/views/login2', {id: "Anonymous"});
    // Just in Case
    else res.render(__dirname + '/views/login2', {id: MainID});
});

app.post('/Login/FromSU', async(req, res) => {
    let connection;
    var isAccount = 0;
    // var MainPW = req.body.MainLoginPW;
    try {
        // Get a connection from the default pool
        connection = await oracledb.getConnection('MainP');

        // FindAccount
        let sql = 'SELECT COUNT(*) as EXIST FROM ACCOUNT ac WHERE ac.id = :ID';

        let binds = [
            req.body.SULoginID
        ];
        
        var results = await connection.execute(sql, binds);
        
        isAccount = results.rows[0][0];
        // console.log(req.body.SULoginID);
        // console.log(isAccount);

        if(!isAccount){
            sql = 'INSERT INTO ACCOUNT(ID, Passwd, Kind) VALUES(:ID,:PW,:KD)';

            binds = [
                req.body.SULoginID,
                req.body.SULoginPW,
                'U'
            ];
            await connection.execute(sql, binds);
            console.log("Created Account : " + req.body.SULoginID);
        }else{
            console.log("Account Already Exists...");
        }
    } catch (err) {
        console.error(err);
    } finally {
        if (connection) {
            try {
                // Put the connection back in the pool
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }

        // Login 가능: DB내 Account가 없어야 생성 가능
        if(!isAccount){
            res.render(__dirname + '/views/login1', {id: MainID});
            // res.sendFile(__dirname + "/webpage/login3.ejs", {id: MainID, method:"post"});
        }
        // Login 불가능
        else{
            // 같은 페이지 보여주기
            res.render(__dirname + '/views/login2', {id: MainID});
        }
    }
});


app.post('/Login/REQ', async (req, res) => {
    // Insert Login Code Here
    // console.log(req.body)
    MainID = req.body.MainLoginID;
    MainPW = req.body.MainLoginPW;
    // var MainPW = req.body.MainLoginPW;
    // console.log(MainID + " " + MainPW)
    
    let connection;
    var login_result;
    try {
        // Get a connection from the default pool
        connection = await oracledb.getConnection('MainP');

        let sql = 'SELECT COUNT(*) as EXIST FROM ACCOUNT ac WHERE ac.id ='
        + ' :MainID and ac.passwd = :MainPW';

        let binds = [
            MainID,
            MainPW

            // "test", "test"
            // Number(request.body.empno),
            // request.body.ename,
            // request.body.job,
            // request.body.mgr,
            // Number(request.body.sal),
            // Number(request.body.comm),
            // Number(request.body.deptno)   
        ];
        
        const results = await connection.execute(sql, binds);
        // oracledb.getPool('MainP').logStatistics();

        login_result = results.rows[0][0];
        // console.log(results.rows[0][0]);
        // oracledb.getPool().logStatistics(); // show pool statistics.  pool.enableStatistics must be true
    } catch (err) {
        console.error(err);
    } finally {
        if (connection) {
            try {
                // Put the connection back in the pool
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
    
    // Login 가능
    if(login_result){
        res.render(__dirname + '/views/login3', {id: MainID});
        console.log("Login Account: " + MainID);
        // res.sendFile(__dirname + "/webpage/login3.ejs", {id: MainID, method:"post"});
    }
    // Login 불가능
    else{
        // 같은 페이지 보여주기
        console.log("Login Failed");
        res.sendFile(__dirname + "/webpage/login1.html");
    }
});


app.post('/Login/WithD', async (req, res) => {
    let connection;
    try {
        // Get a connection from the default pool
        connection = await oracledb.getConnection('MainP');

        let sql = 'DELETE FROM ACCOUNT WHERE ID = :ID AND Passwd = :PW';

        let binds = [
            MainID,
            MainPW
        ];
        
        const results = await connection.execute(sql, binds);
    } catch (err) {
        console.error(err);
    } finally {
        if (connection) {
            try {
                // Put the connection back in the pool
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
        console.log("Deleted Account : " + MainID);

        // 로그 아웃
        LoginState = 0;
        MainID = "Anonymous"

        // 비로그인 상태면 Login1.ejs 화면
        if(!LoginState) res.render(__dirname + '/views/login1', {id: "Anonymous"});
        // 로그인 상태면 Login3.ejs 화면
        else res.render(__dirname + '/views/login3', {id: MainID});
    }    
});


app.post('/Login/Logout', async (req, res) => {
    // 로그 아웃
    LoginState = 0;
    MainID = "Anonymous"

    // 비로그인 상태면 Login1.ejs 화면
    if(!LoginState) res.render(__dirname + '/views/login1', {id: "Anonymous"});
    // 로그인 상태면 Login3.ejs 화면
    else res.render(__dirname + '/views/login3', {id: MainID});
});


//////////////////////////////////////////////////////////


app.get("/About", (req, res) => {
    // 비로그인 상태면 bookmark1_NL.ejs 화면
    if(!LoginState) res.render(__dirname + '/views/about', {id: "Anonymous"});
    // 로그인 상태면 bookmark1_L.ejs 화면
    else res.render(__dirname + '/views/about', {id: MainID});
});


//////////////////////////////////////////////////////////


app.get("/Bookmark", (req, res) => {
    // 비로그인 상태면 bookmark1_NL.ejs 화면
    if(!LoginState) res.render(__dirname + '/views/bookmark1_NL', {id: "Anonymous"});
    // 로그인 상태면 bookmark1_L.ejs 화면
    else res.render(__dirname + '/views/bookmark1_L', {id: MainID});
});


//////////////////////////////////////////////////////////


app.get("/Search", (req, res) => {
    // 비로그인 상태면 search1.ejs 화면  => Anonymous
    if(!LoginState) res.render(__dirname + '/views/search1', {id: "Anonymous"});
    // 로그인 상태면 search1.ejs 화면 => MainID
    else res.render(__dirname + '/views/search1', {id: MainID});
});

app.post("/Search", (req, res) => {
    var sel_list = req.body.SEL;
    var content = req.body.CONT;

    console.log(sel_list + " " + content);
});


//////////////////////////////////////////////////////////


app.get("/Article/Notice", (req, res) => {
    // 비로그인 상태면 bookmark1_NL.ejs 화면
    if(!LoginState) res.render(__dirname + '/views/bookmark1_NL', {id: "Anonymous"});
    // 로그인 상태면 bookmark1_L.ejs 화면
    else res.render(__dirname + '/views/bookmark1_L', {id: MainID});
});


app.get("/Article/Free", (req, res) => {
    // 비로그인 상태면 bookmark1_NL.ejs 화면
    if(!LoginState) res.render(__dirname + '/views/bookmark1_NL', {id: "Anonymous"});
    // 로그인 상태면 bookmark1_L.ejs 화면
    else res.render(__dirname + '/views/bookmark1_L', {id: MainID});
});

app.get("/Article/QNA", (req, res) => {
    // 비로그인 상태면 bookmark1_NL.ejs 화면
    if(!LoginState) res.render(__dirname + '/views/bookmark1_NL', {id: "Anonymous"});
    // 로그인 상태면 bookmark1_L.ejs 화면
    else res.render(__dirname + '/views/bookmark1_L', {id: MainID});
});



//////////////////////////////////////////////////////////


app.get("/PaperAdd/Author", (req, res) => {
    // 비로그인 상태면 paper_add_UATH
    if(!LoginState) res.render(__dirname + '/views/paper_add_UATH', {id: "Anonymous"});
    // 로그인 상태면 paper_add_A.ejs
    else res.render(__dirname + '/views/paper_add_A', {id: MainID});
});

app.get("/PaperAdd/Journal", (req, res) => {
    // 비로그인 상태면 paper_add_UATH
    if(!LoginState) res.render(__dirname + '/views/paper_add_UATH', {id: "Anonymous"});
    // 로그인 상태면 paper_add_J.ejs
    else res.render(__dirname + '/views/paper_add_J', {id: MainID});
});


app.get("/PaperAdd/Paper", (req, res) => {
    // 비로그인 상태면 paper_add_UATH
    if(!LoginState) res.render(__dirname + '/views/paper_add_UATH', {id: "Anonymous"});
    // 로그인 상태면 paper_add_P.ejs
    else res.render(__dirname + '/views/paper_add_P', {id: MainID});
});


app.get("/PaperAdd/Keyword", (req, res) => {
    // 비로그인 상태면 paper_add_UATH
    if(!LoginState) res.render(__dirname + '/views/paper_add_UATH', {id: "Anonymous"});
    // 로그인 상태면 paper_add_K.ejs
    else res.render(__dirname + '/views/paper_add_K', {id: MainID});
});



// listen 8000 port
app.listen(PORT, () =>{
    console.log(`Server is running on port ${PORT}.`);

    init();
});



//test
app.get("/Post", (req, res) => {
    res.render(__dirname + '/views/bookmark1_L', {id: MainID});
});



