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
oracledb.fetchAsString = [ oracledb.CLOB ];

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
    if(!LoginState) res.render(__dirname + '/views/login1', {id: "Anonymous", LS:0});
    // 로그인 상태면 Login3.ejs 화면
    else res.render(__dirname + '/views/login3', {id: MainID, LS:1});
});

// req 무시
app.post('/Login/SU', (req, res) => {
    if(!LoginState) res.render(__dirname + '/views/login2', {id: "Anonymous", LS:0});
    // Just in Case
    else res.render(__dirname + '/views/login2', {id: MainID, LS:1});
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
            res.render(__dirname + '/views/login1', {id: MainID, LS:0});
            // res.sendFile(__dirname + "/webpage/login3.ejs", {id: MainID, method:"post"});
        }
        // Login 불가능
        else{
            // 같은 페이지 보여주기
            res.render(__dirname + '/views/login2', {id: MainID, LS:0});
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
        LoginState = 1;
        res.render(__dirname + '/views/login3', {id: MainID, LS:1});
        console.log("Login Account: " + MainID);
        // res.sendFile(__dirname + "/webpage/login3.ejs", {id: MainID, method:"post"});
    }
    // Login 불가능
    else{
        // 같은 페이지 보여주기
        console.log("Login Failed");
        res.render(__dirname + '/views/login1', {id: "Anonymous", LS:0});
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
        if(!LoginState) res.render(__dirname + '/views/login1', {id: "Anonymous", LS:0});
        // 로그인 상태면 Login3.ejs 화면
        else res.render(__dirname + '/views/login3', {id: MainID, LS:1});
    }    
});


app.post('/Login/Logout', async (req, res) => {
    // 로그 아웃
    LoginState = 0;
    MainID = "Anonymous"

    // 비로그인 상태면 Login1.ejs 화면
    if(!LoginState) res.render(__dirname + '/views/login1', {id: "Anonymous", LS:0});
    // 로그인 상태면 Login3.ejs 화면
    else res.render(__dirname + '/views/login3', {id: MainID, LS:1});
});


//////////////////////////////////////////////////////////


app.get("/About", (req, res) => {
    // 비로그인 상태면 bookmark1_NL.ejs 화면
    if(!LoginState) res.render(__dirname + '/views/about', {id: "Anonymous", LS:0});
    // 로그인 상태면 bookmark1_L.ejs 화면
    else res.render(__dirname + '/views/about', {id: MainID, LS:1});
});


//////////////////////////////////////////////////////////


app.get("/Bookmark", (req, res) => {
    // 비로그인 상태면 bookmark1_NL.ejs 화면
    if(!LoginState) res.render(__dirname + '/views/bookmark1_NL', {id: "Anonymous", LS:0});
    // 로그인 상태면 bookmark1_L.ejs 화면
    else res.render(__dirname + '/views/bookmark1_L', {id: MainID, LS:1});
});


//////////////////////////////////////////////////////////


app.get("/Search", (req, res) => {
    // 비로그인 상태면 search1.ejs 화면  => Anonymous
    if(!LoginState) res.render(__dirname + '/views/search1', {id: "Anonymous", LS:0});
    // 로그인 상태면 search1.ejs 화면 => MainID
    else res.render(__dirname + '/views/search1', {id: MainID, LS:1});
});

app.post("/Search", (req, res) => {
    var sel_list = req.body.SEL;
    var content = req.body.CONT;

    console.log(sel_list + " " + content);
});


//////////////////////////////////////////////////////////


app.get("/Article/Notice", async(req, res) => {
    let connection;
    var context;

    try {
        // Get a connection from the default pool
        connection = await oracledb.getConnection('MainP');

        let sql = 'SELECT p_no, title, id, date_time FROM POST WHERE CATEGORY = :KIND';

        let binds = [
            "ANN"
        ];
        
        var results = await connection.execute(sql, binds);

        console.dir(results)
        
        // var DTM = [];
        // for(var i=0;i<results.length;++i){
        //     var YY = new Date(results.rows[i][2]).getFullYear();
        //     var MM = new Date(results.rows[i][2]).getMonth() + 1;
        //     var DD = new Date(results.rows[i][2]).getDay();
        //     // DTM.push("".concat(YY,"-",MM,"-",DD));
        //     DTM.push("d");
        // }

        // console.log(DTM);

        context = {results:results.rows};
        

        res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                
        
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

    // 비로그인 상태면 bookmark1_NL.ejs 화면
    if(!LoginState)
    {
        context.id = "Anonymous";
        context.LS = 0;
    }
    // res.render(__dirname + , {post: "공지", id: "Anonymous", LS:0});
    // 로그인 상태면 bookmark1_L.ejs 화면
    else 
    {
        context.id = MainID;
        context.LS = 1;
    }

    context.post = "공지";
    res.render(__dirname + '/views/post1', context, function(err,html){
        res.end(html);
    })
    // res.render(__dirname + '/views/post1', {post: "공지", id: MainID, LS:1});
    
});


app.get("/Article/Free", async(req, res) => {
    let connection;
    var context;

    try {
        // Get a connection from the default pool
        connection = await oracledb.getConnection('MainP');

        let sql = 'SELECT p_no, title, id, date_time FROM POST WHERE CATEGORY = :KIND';

        let binds = [
            "GNL"
        ];
        
        var results = await connection.execute(sql, binds);

        console.dir(results)
        
        // var DTM = [];
        // for(var i=0;i<results.length;++i){
        //     var YY = new Date(results.rows[i][2]).getFullYear();
        //     var MM = new Date(results.rows[i][2]).getMonth() + 1;
        //     var DD = new Date(results.rows[i][2]).getDay();
        //     // DTM.push("".concat(YY,"-",MM,"-",DD));
        //     DTM.push("d");
        // }

        // console.log(DTM);

        context = {results:results.rows};
        

        res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                
        
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

    // 비로그인 상태면 bookmark1_NL.ejs 화면
    if(!LoginState)
    {
        context.id = "Anonymous";
        context.LS = 0;
    }
    // res.render(__dirname + , {post: "공지", id: "Anonymous", LS:0});
    // 로그인 상태면 bookmark1_L.ejs 화면
    else 
    {
        context.id = MainID;
        context.LS = 1;
    }

    context.post = "자유글";
    res.render(__dirname + '/views/post1', context, function(err,html){
        res.end(html);
    })
    
    // 비로그인 상태면 bookmark1_NL.ejs 화면
    // if(!LoginState) res.render(__dirname + '/views/post1', {post: "자유글", id: "Anonymous", LS:0});
    // 로그인 상태면 bookmark1_L.ejs 화면
    // else res.render(__dirname + '/views/post1', {post: "자유글", id: MainID, LS:1});
});

app.get("/Article/QNA", async(req, res) => {
    let connection;
    var context;

    try {
        // Get a connection from the default pool
        connection = await oracledb.getConnection('MainP');
        
        let sql = 'SELECT p_no, title, id, date_time FROM POST WHERE CATEGORY = :KIND';

        let binds = [
            "QNA"
        ];
        
        var results = await connection.execute(sql, binds);

        console.dir(results)
        
        // var DTM = [];
        // for(var i=0;i<results.length;++i){
        //     var YY = new Date(results.rows[i][2]).getFullYear();
        //     var MM = new Date(results.rows[i][2]).getMonth() + 1;
        //     var DD = new Date(results.rows[i][2]).getDay();
        //     // DTM.push("".concat(YY,"-",MM,"-",DD));
        //     DTM.push("d");
        // }

        // console.log(DTM);

        context = {results:results.rows};
        

        res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                
        
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

    // 비로그인 상태면 bookmark1_NL.ejs 화면
    if(!LoginState)
    {
        context.id = "Anonymous";
        context.LS = 0;
    }
    // res.render(__dirname + , {post: "공지", id: "Anonymous", LS:0});
    // 로그인 상태면 bookmark1_L.ejs 화면
    else 
    {
        context.id = MainID;
        context.LS = 1;
    }

    context.post = "QnA";
    res.render(__dirname + '/views/post1', context, function(err,html){
        res.end(html);
    })


    // 비로그인 상태면 bookmark1_NL.ejs 화면
    // if(!LoginState) res.render(__dirname + '/views/post1', {post: "QnA", id: "Anonymous", LS:0});
    // 로그인 상태면 bookmark1_L.ejs 화면
    // else res.render(__dirname + '/views/post1', {post: "QnA", id: MainID, LS:1});
});


app.get("/Article/Add", async(req, res) => {
    res.render(__dirname + '/views/post3', {
        kind: req.query.kind, id: MainID, LS:1});
});

app.post("/Article/Add", async(req, res) => {
    var bind = "", kind_ = req.body.kind;
    
    if(kind_ === "공지") bind = "ANN";
    else if(kind_ === "자유글") bind = "GNL";
    else if(kind_ === "QnA") bind = "QNA";
    
    let connection;
    var context;
    var results;

    try {
        // Get a connection from the default pool
        connection = await oracledb.getConnection('MainP');

        // QUERY 1
        let sql = "SELECT COUNT(*) FROM POST";
        results = await connection.execute(sql);
        var PostN = results.rows[0][0] + 1;

        console.dir(PostN);

        // QUERY 2
        sql = 'INSERT INTO POST VALUES(:ID, :PNO, :CTG, :TITLE, TO_DATE(SYSDATE, \'yyyy/mm/dd\'), 0, TO_CLOB(:CTNT))';

        let binds = [
            MainID,
            PostN,
            bind,
            req.body.title,
            req.body.description
        ];

        var results = await connection.execute(sql, binds);
        console.dir(results);

        // QUERY 3
        sql = 'SELECT p_no, title, id, date_time FROM POST WHERE CATEGORY = :KIND';

        binds = [
            bind
        ];
        
        results = await connection.execute(sql, binds);

        console.dir(results)
        
        // var DTM = [];
        // for(var i=0;i<results.length;++i){
        //     var YY = new Date(results.rows[i][2]).getFullYear();
        //     var MM = new Date(results.rows[i][2]).getMonth() + 1;
        //     var DD = new Date(results.rows[i][2]).getDay();
        //     // DTM.push("".concat(YY,"-",MM,"-",DD));
        //     DTM.push("d");
        // }

        // console.log(DTM);

        context = {results:results.rows};
        

        res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                
        
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

    // 비로그인 상태면 bookmark1_NL.ejs 화면
    if(!LoginState)
    {
        context.id = "Anonymous";
        context.LS = 0;
    }
    // res.render(__dirname + , {post: "공지", id: "Anonymous", LS:0});
    // 로그인 상태면 bookmark1_L.ejs 화면
    else 
    {
        context.id = MainID;
        context.LS = 1;
    }

    context.post = kind_;
    res.render(__dirname + '/views/post1', context, function(err,html){
        res.end(html);
    })

    // res.render(__dirname + '/views/post1', {
    //     kind: req.query.kind, id: MainID, LS:1});
});



app.get('/Article/Detail', async(req, res) =>{
    // console.log(req.query.kind);
    // console.log(req.query.PValue);
    
    let connection;
    var context;

    try {
        // Get a connection from the default pool
        connection = await oracledb.getConnection('MainP');
        
        // query1
        let sql = 'SELECT * FROM POST p WHERE p.p_no = :PNO';

        let binds = [
            req.query.PValue
        ];
        
        var results = await connection.execute(sql, binds);


        console.dir(results);
        // console.log(results.rows[0][6]);
        
        context = {
            author:results.rows[0][0],
            pval:results.rows[0][1],
            title:results.rows[0][3],
            date:results.rows[0][4],
            content:results.rows[0][6]
        };

        if(context.author === MainID)
            context.canDelete = 1;
        else
            context.canDelete = 0;
        

        // query2
        sql = 'SELECT * FROM COMMENTS co WHERE co.p_no = :PNO';

        results = await connection.execute(sql, binds);

        console.dir(results.rows);

        context.comments = results.rows;
        
        // console.log(context.comments.length);
        // console.log(results.rows[context.comments.length-1][1]+1);
        if(context.comments.length > 0)
            context.lastCMT = results.rows[context.comments.length-1][1]+1;
        else
            context.lastCMT = 1;

        res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
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
    
    if(!LoginState)
    {
        context.id="Anonymous";
        context.LS=0;
    }
    else
    {
        context.id=MainID;
        context.LS=1;
    }
    
    
    context.kind = req.query.kind;
    res.render(__dirname + '/views/post2', context, function(err,html){
        res.end(html);
    });
});


app.post('/Article/AddComment', async(req, res) =>{
    let connection;
    var context;

    try {
        // Get a connection from the default pool
        connection = await oracledb.getConnection('MainP');
        
        // query1
        let sql = 'INSERT INTO COMMENTS VALUES(:ID, :CNO, :PNO, :CTNT)';
        
        let binds = [
            MainID,
            req.body.cno,
            req.body.pno,
            req.body.UserComment
        ];

        // console.log(binds[0]);
        // console.log(binds[1]);
        // console.log(binds[2]);
        // console.log(binds[3]);
        
        
        var results = "";

        // comment가 비어있으면
        if(binds[3] !== "")
            results = await connection.execute(sql, binds);
        console.log(results);

        // query2
        sql = 'SELECT * FROM POST p WHERE p.p_no = :PNO';

        binds = [
            req.body.pno
        ];
        
        results = await connection.execute(sql, binds);

        console.dir(results);
        // console.log(results.rows[0][6]);
        
        context = {
            author:results.rows[0][0],
            pval:results.rows[0][1],
            title:results.rows[0][3],
            date:results.rows[0][4],
            content:results.rows[0][6]
        };

        if(context.author === MainID)
            context.canDelete = 1;
        else
            context.canDelete = 0;

        // query3
        sql = 'SELECT * FROM COMMENTS co WHERE co.p_no = :PNO';

        results = await connection.execute(sql, binds);

        console.dir(results.rows);

        context.comments = results.rows;
        
        // console.log(results.rows[context.comments.length-1][1]+1);
        context.lastCMT = results.rows[context.comments.length-1][1]+1;
        
        res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
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

    if(!LoginState)
    {
        context.id="Anonymous";
        context.LS=0;
    }
    else
    {
        context.id=MainID;
        context.LS=1;
    }

    context.kind = req.body.kind;
    res.render(__dirname + '/views/post2', context, function(err,html){
        res.end(html);
    });
});


//////////////////////////////////////////////////////////


app.get("/PaperAdd/Author", (req, res) => {
    // 비로그인 상태면 paper_add_UATH
    if(!LoginState) res.render(__dirname + '/views/paper_add_UATH', {id: "Anonymous", LS:0});
    // 로그인 상태면 paper_add_A.ejs
    else res.render(__dirname + '/views/post1', {id: MainID, LS:1});
});

app.get("/PaperAdd/Journal", (req, res) => {
    // 비로그인 상태면 paper_add_UATH
    if(!LoginState) res.render(__dirname + '/views/paper_add_UATH', {id: "Anonymous", LS:0});
    // 로그인 상태면 paper_add_J.ejs
    else res.render(__dirname + '/views/paper_add_J', {id: MainID, LS:1});
});


app.get("/PaperAdd/Paper", (req, res) => {
    // 비로그인 상태면 paper_add_UATH
    if(!LoginState) res.render(__dirname + '/views/paper_add_UATH', {id: "Anonymous", LS:0});
    // 로그인 상태면 paper_add_P.ejs
    else res.render(__dirname + '/views/paper_add_P', {id: MainID, LS:1});
});


app.get("/PaperAdd/Keyword", (req, res) => {
    // 비로그인 상태면 paper_add_UATH
    if(!LoginState) res.render(__dirname + '/views/paper_add_UATH', {id: "Anonymous", LS:0});
    // 로그인 상태면 paper_add_K.ejs
    else res.render(__dirname + '/views/paper_add_K', {id: MainID, LS:1});
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



