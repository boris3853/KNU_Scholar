

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

// cytoscape.use(dagre);

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


app.get("/Bookmark", async (req, res) => {
    // 비로그인 상태면 bookmark1_NL.ejs 화면
    if (!LoginState) res.render(__dirname + '/views/bookmark1_NL', { id: "Anonymous", LS: 0 });
    // 로그인 상태면 bookmark1_L.ejs 화면
    else {
        let connection;
        var context;

        try {
            // Get a connection from the default pool
            connection = await oracledb.getConnection('MainP');

            //query1
            let sql = 'SELECT k.sub, k.k_id FROM KEYWORD k, K_BOOKMARK b WHERE k.k_id = b.k_id AND b.id = :ID';
            let binds = [
                MainID
            ];
            var results = await connection.execute(sql, binds);
            console.dir(results)
            context = { keywords: results.rows };

            sql = 'SELECT COUNT(*) FROM K_BOOKMARK WHERE id = :ID';
            results = await connection.execute(sql, binds);
            console.dir(results)
            context.countK = results.rows[0][0];

            //query2
            sql = 'SELECT a.name, a.r_number FROM AUTHOR a, A_BOOKMARK b WHERE a.r_number = b.r_number AND b.id = :ID';
            results = await connection.execute(sql, binds);
            console.dir(results)
            context.authors = results.rows;

            sql = 'SELECT COUNT(*) FROM A_BOOKMARK WHERE id = :ID';
            results = await connection.execute(sql, binds);
            console.dir(results)
            context.countA = results.rows[0][0];

            //query3
            sql = 'SELECT p.title, p.doi FROM PAPER p, P_BOOKMARK b WHERE p.doi = b.doi AND b.id = :ID';
            results = await connection.execute(sql, binds);
            console.dir(results)
            context.papers = results.rows;

            sql = 'SELECT COUNT(*) FROM P_BOOKMARK WHERE id = :ID';
            results = await connection.execute(sql, binds);
            console.dir(results)
            context.countP = results.rows[0][0];

            res.writeHead('200', { 'Content-Type': 'text/html;charset=utf8' });

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

        // 로그인 상태임
        context.id = MainID;
        context.LS = 1;

        res.render(__dirname + '/views/bookmark1_L', context, function (err, html) {
            res.end(html);
        });
    }

});


//////////////////////////////////////////////////////////


app.get("/Search", (req, res) => {
    // 비로그인 상태면 search1.ejs 화면  => Anonymous
    if(!LoginState) res.render(__dirname + '/views/search1', {err: -1, id: "Anonymous", LS:0});
    // 로그인 상태면 search1.ejs 화면 => MainID
    else res.render(__dirname + '/views/search1', {err: -1, id: MainID, LS:1});
});

app.post("/Search", async(req, res) => {
    var sel_list = req.body.SEL;
    var content = req.body.CONT;

    console.log(sel_list + " " + content);

    let sql;
    if(sel_list === "논문 제목")
        sql = "SELECT * FROM PAPER p WHERE p.title LIKE '%' || :CONTENT || '%'";
    else if(sel_list === "저자 이름")
        sql = "SELECT p.* FROM PAPER p, AUTHOR a, WRITE w WHERE a.name LIKE '%'"
        + "|| :CONTENT || '%' AND p.doi = w.doi AND a.r_number = w.r_number";
    else if(sel_list === "키워드")
        sql = "SELECT p.* FROM PAPER p, KEYWORD k, HAS h + WHERE k.sub LIKE '%' ||" 
        + "  :CONTENT || '%' AND p.doi = h.doi AND k.k_id = h.k_id";
    
    binds = [
        content
    ];

    let connection;
    var context = {};

    try {
        // Get a connection from the default pool
        connection = await oracledb.getConnection('MainP');

        var results = await connection.execute(sql, binds);

        // console.dir(results)

        
        // 쿼리 오류날 시 err = -1
        if(!results.rows.length) context.err = -1;
        else{
            context.err = 0;
            context.result1 = results.rows
        }
        
        res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});

        console.log(context)
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

    // 비로그인 상태면 search1.ejs 화면
    if(!LoginState)
    {
        context.id = "Anonymous";
        context.LS = 0;
    }
    // 로그인 상태면 search1.ejs 화면 => MainID
    else 
    {
        context.id = MainID;
        context.LS = 1;
    }

    res.render(__dirname + '/views/search1', context, function(err,html){
        res.end(html);
    })
});

app.get("/Search/ShowDetail", async(req, res) => {
    let sql = "SELECT Title, summary FROM PAPER WHERE DOI = :DOI";
    binds = [req.query.DOI];

    let connection;
    var context = {};

    try {
        // Get a connection from the default pool
        connection = await oracledb.getConnection('MainP');

        var results = await connection.execute(sql, binds);

        console.log(results);
        context.title = results.rows[0][0];
        context.Summary = results.rows[0][1];

        sql = "SELECT a.Name, a.r_number FROM AUTHOR a, WRITE w"
        + " WHERE w.DOI = :DOI AND a.R_number = w.R_number";

        results = await connection.execute(sql, binds);

        console.log(results);
        context.sql2 = results.rows;

        sql = "SELECT j.Publisher, j.Name, j.Vol, j.Issue, TO_CHAR(j.Year, 'yyyy') FROM JOURNAL j, PAPER p"
        + " WHERE p.DOI = :DOI AND p.J_number = j.J_number";

        results = await connection.execute(sql, binds);
        console.log(results);
        context.publisher = results.rows[0][0];
        context.jnum = results.rows[0][1];
        context.vol = results.rows[0][2];
        context.issue = results.rows[0][3];
        context.year = results.rows[0][4];

        console.log(results.rows[0][0]);
        console.log(results.rows[0][1]);
        console.log(results.rows[0][2]);
        console.log(results.rows[0][3]);
        console.log(results.rows[0][4]);

        sql = "SELECT k.sub FROM KEYWORD k, HAS h WHERE h.doi = :DOI"
            + " AND h.k_id = k.k_id";
        results = await connection.execute(sql, binds);
        console.log(results);
        context.sql3 = results.rows;

        sql = "SELECT f.middle FROM FIELD f, JOURNAL j, PAPER p"
            + " WHERE p.DOI = :DOI AND p.J_number = j.J_number"
            + " AND j.ddc = f.ddc";
        results = await connection.execute(sql, binds);
        console.log(results.rows[0][0]);

        context.field = results.rows[0][0];

        sql = "SELECT url FROM PAPER WHERE DOI = :DOI";
        results = await connection.execute(sql, binds);
        context.url = results.rows[0][0];
        
        console.log(results.rows[0][0]);

        sql = "SELECT COUNT(*) FROM REFERENCE r WHERE r.ed_doi = :DOI";
        results = await connection.execute(sql, binds);
        console.log(results.rows[0][0]);

        context.refered = results.rows[0][0];

        /*
        sql = "SELECT p.title FROM PAPER p, REFERENCE r"
        + " WHERE r.ing_doi = :DOI"
        + " AND p.doi = r.ed_doi"
        + " ORDER BY p.title ASC";
        results = await connection.execute(sql, binds);
        console.log(results.rows);
        */


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
    
    // 비로그인 상태면 search1.ejs 화면
    if(!LoginState)
    {
        context.id = "Anonymous";
        context.LS = 0;
    }
    // 로그인 상태면 search1.ejs 화면 => MainID
    else 
    {
        context.id = MainID;
        context.LS = 1;
    }

    res.render(__dirname + '/views/search2', context, function(err,html){
        res.end(html);
    })
});

app.get("/Search/ShowAuthorDetail", async(req, res) => {
    // console.log(req.query.RNUM);

    let sql = "SELECT name, gender, nation, institution, address FROM AUTHOR"
    + " WHERE R_number = :RNUM";
    binds = [req.query.RNUM];

    let connection;
    var context = {};

    try {
        // Get a connection from the default pool
        connection = await oracledb.getConnection('MainP');

        var results = await connection.execute(sql, binds);

        console.log(results.rows[0]);

        context.name = results.rows[0][0];
        context.sex = results.rows[0][1];
        context.nation = results.rows[0][2];
        context.inst = results.rows[0][3];
        context.email = results.rows[0][4];

        sql = "SELECT f.large, f.middle FROM MAJOR m, FIELD f"
        + " WHERE m.r_number = :Rnum"
        + " AND m.ddc = f.ddc";

        results = await connection.execute(sql, binds);


        context.major1 = results.rows[0][0];
        
        // 전공 하나만 있는 저자 존재
        if(results.rows.length == 1)
            context.major2 = null
        else
            context.major2 = results.rows[1][0];
        console.log(context.major1);
        console.log(context.major2);

        sql = "SELECT k.sub FROM PAPER p, HAS h, KEYWORD k, WRITE w"
        + " WHERE w.r_number = :Rnum"
        + " AND w.doi = p.doi"
        + " AND p.doi = h.doi"
        + " AND h.k_id = k.k_id";

        results = await connection.execute(sql, binds);
        console.log(results.rows);

        context.sql3 = results.rows;

        sql = "SELECT COUNT(*) FROM AUTHOR a, WRITE w"
        + " WHERE a.r_number = :Rnum"
        + " AND a.r_number = w.r_number";

        results = await connection.execute(sql, binds);
        console.log(results.rows[0][0]);

        context.papercount = results.rows[0][0];

        sql = "SELECT p.title FROM PAPER p, AUTHOR a, WRITE w"
        + " WHERE p.doi = w.doi"
        + " AND a.r_number = w.r_number"
        + " AND w.r_number = :Rnum";

        results = await connection.execute(sql, binds);
        console.log(results.rows);
        context.sql5 = results.rows;


        var cy = cytoscape({
            container: document.getElementById('cy'),
            elements: [
              { data: { id: 'a' } },
              { data: { id: 'b' } },
              {
                data: {
                  id: 'ab',
                  source: 'a',
                  target: 'b'
                }
              }]
          });

        var layout = cy.layout({ name: 'circle' });
        layout.run();
          
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
    
    // 비로그인 상태면 search1.ejs 화면
    if(!LoginState)
    {
        context.id = "Anonymous";
        context.LS = 0;
    }
    // 로그인 상태면 search1.ejs 화면 => MainID
    else 
    {
        context.id = MainID;
        context.LS = 1;
    }


    res.render(__dirname + '/views/search3', context, function(err,html){
        res.end(html);
    })
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


app.get("/Article/Delete", async(req, res) => {
    kind_ = req.query.kind;
    
    if(kind_ === "공지") bind = "ANN";
    else if(kind_ === "자유글") bind = "GNL";
    else if(kind_ === "QnA") bind = "QNA";
    
    let connection;
    var context;
    var results;

    try {
        // Get a connection from the default pool
        connection = await oracledb.getConnection('MainP');

        console.log(req.query.pno);
        // QUERY 1
        let sql = "DELETE FROM POST WHERE P_NO = :PNO";
        var binds = [
            req.query.pno
        ];

        results = await connection.execute(sql, binds);
        
        

        
        // QUERY 2
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
});



//////////////////////////////////////////////////////////
app.get("/PaperAdd/Paper", (req, res) => {
    // 비로그인 상태면 paper_add_UATH
    if (!LoginState) res.render(__dirname + '/views/paper_add_UATH', { id: "Anonymous", LS: 0 });
    // 로그인 상태면 paper_add_P.ejs
    else res.render(__dirname + '/views/paper_add_P', { id: MainID, LS: 1 });
});


app.post("/PaperAdd/Paper", async (req, res) => {
    // Ptitle, Psummary, Purl, Pdoi, Pjnumber, Prnumber, Pkeyword, Prdoi
    var p_title = req.body.Ptitle;
    var p_summary = req.body.Psummary;
    var p_url = req.body.Purl;
    var p_doi = Number(req.body.Pdoi);
    var p_jnumber = Number(req.body.Pjnumber);
    var p_rnumber = req.body.Prnumber;
    var p_kid = req.body.Pkeyword;
    var p_r_doi = req.body.Prdoi;
    console.log(p_title, p_summary, p_url, p_doi, p_jnumber, p_rnumber, p_kid, p_r_doi);

    var r_nums = p_rnumber.split('#');
    var k_ids = p_kid.split('#');
    var p_dois = p_r_doi.split('#');
    console.log(r_nums);

    let sql;

    sql = "select count(*) from ((select doi from paper where doi=:DOI) union (select doi from paper where url=:URL))";
    binds = [p_doi, p_url];

    let connection;
    var context = {};

    try {
        // Get a connection from the default pool
        connection = await oracledb.getConnection('MainP');

        // kid 중복 검사
        var results = await connection.execute(sql, binds);
        // 쿼리 오류날 시 err = -1
        if (!results.rows.length) context.err = -1;
        else {
            context.err = 0;
            context.result1 = results.rows
        }
        var a_result = results.rows[0][0];
        console.log(a_result);

        if (!a_result) {
            // title, summary, url, doi, j_number
            sql = " insert into paper values(:T, to_clob(:S), :U, :D, :J)";
            binds = [p_title, p_summary, p_url, p_doi, p_jnumber];
            await connection.execute(sql, binds);
            console.log("Added Paper : " + p_doi);
            // r_nums, k_ids, p_dois
            for (let i = 0; i < r_nums.length; i++) {
                r_nums[i] = Number(r_nums[i]);
                sql = "select count(*) from author where r_number=:RN"; binds = [r_nums[i]]; results = await connection.execute(sql, binds);
                var temp1 = results.rows[0][0];
                if (!temp1) continue;
                console.log(temp1);
                sql = "insert into write values(:WDOI, :WRNUM)";
                binds = [p_doi, r_nums[i]];
                await connection.execute(sql, binds);
            }
            for (let i = 0; i < k_ids.length; i++) {
                k_ids[i] = Number(k_ids[i]);
                sql = "select count(*) from keyword where k_id=:KI"; binds = [k_ids[i]]; results = await connection.execute(sql, binds);
                var temp2 = results.rows[0][0];
                if (!temp2) continue;
                sql = "insert into has values(:HDOI, :HKID)";
                binds = [p_doi, k_ids[i]];
                await connection.execute(sql, binds);
            }
            for (let i = 0; i < p_dois.length; i++) {
                p_dois[i] = Number(p_dois[i]);
                sql = "select count(doi) from paper where doi=:PD"; binds = [p_dois[i]]; results = await connection.execute(sql, binds);
                var temp3 = results.rows[0][0];
                if (!temp3) continue;
                sql = "insert into reference values(:RINGDOI, :REDDOI)";
                binds = [p_doi, p_dois[i]];
                await connection.execute(sql, binds);
            }
        }
        else {
            console.log("Paper Already exists...");
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
        // 비로그인 상태면 paper_add_UATH
        if (!LoginState) res.render(__dirname + '/views/paper_add_UATH', { id: "Anonymous", LS: 0 });
        // 로그인 상태면 paper_add_P.ejs
        else res.render(__dirname + '/views/paper_add_P', { id: MainID, LS: 1 });
    }
});



app.get("/PaperAdd/Author", (req, res) => {
    // 비로그인 상태면 paper_add_UATH
    if (!LoginState) res.render(__dirname + '/views/paper_add_UATH', { id: "Anonymous", LS: 0 });
    // 로그인 상태면 paper_add_A.ejs
    else res.render(__dirname + '/views/paper_add_A', { id: MainID, LS: 1 });
});

app.post("/PaperAdd/Author", async (req, res) => {
    // Aname, Ainst, radios, Anation, Aaddr, Arnum, Addc
    var a_name = req.body.Aname;
    var a_inst = req.body.Ainst;
    var a_gender = req.body.radios;
    var a_nation = req.body.Anation;
    var a_addr = req.body.Aaddr;
    var a_rnum = Number(req.body.Arnum);
    var a_ddc = req.body.Addc;
    console.log(a_name, a_inst, a_gender, a_nation, a_addr, a_rnum, a_ddc);

    let sql;

    sql = "select count(*) from ((select * from author where r_number = :ARNUMBER) union (select * from author where address = :AADDRESS))";
    binds = [a_rnum, a_addr];

    let connection;
    var context = {};

    try {
        // Get a connection from the default pool
        connection = await oracledb.getConnection('MainP');

        // kid 중복 검사
        var results = await connection.execute(sql, binds);
        // 쿼리 오류날 시 err = -1
        if (!results.rows.length) context.err = -1;
        else {
            context.err = 0;
            context.result1 = results.rows
        }
        var a_result = results.rows[0][0];
        console.log(a_result);

        if (!a_result) {
            sql = "insert into author values(:ANAME, :AINST, :AGENDER, :ANATION, :AADDR, :ARNUM)";
            binds = [a_name, a_inst, a_gender, a_nation, a_addr, a_rnum];
            await connection.execute(sql, binds);
            console.log("Added Author : " + a_rnum);

            for (let i = 0; i < a_ddc.length; i++) {
                sql = "insert into major values(:RNUM, :MDDC)";
                binds = [a_rnum, Number(a_ddc[i])*100];
                await connection.execute(sql, binds);
                console.log("Added Major : " + a_rnum + " " + a_ddc[i]);
            }
        }
        else {
            console.log("Author Already exists...");
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

        // 비로그인 상태면 paper_add_UATH
        if (!LoginState) res.render(__dirname + '/views/paper_add_UATH', { id: "Anonymous", LS: 0 });
        // 로그인 상태면 paper_add_A.ejs
        else res.render(__dirname + '/views/paper_add_A', { id: MainID, LS: 1 });
    }

});




app.get("/PaperAdd/Journal", (req, res) => {
    // 비로그인 상태면 paper_add_UATH
    if (!LoginState) res.render(__dirname + '/views/paper_add_UATH', { id: "Anonymous", LS: 0 });
    // 로그인 상태면 paper_add_J.ejs
    else res.render(__dirname + '/views/paper_add_J', { id: MainID, LS: 1 });
});

app.post("/PaperAdd/Journal", async (req, res) => {
    var j_name = req.body.Jname;
    var j_vol = Number(req.body.Jvol);
    var j_issue = Number(req.body.Jissue);
    var j_publisher = req.body.Jpublisher;
    var j_ddc = Number(req.body.Jddc) * 100;
    var j_number = Number(req.body.Jnumber);
    var j_year = req.body.Jyear;
    console.log(j_name + j_vol + j_issue + j_publisher + j_ddc + j_number + j_year);

    let sql;

    sql = "select count(*) from ((select * from journal where j_number = :JNUM) union (select * from journal where name = :JNAME and vol = :JVOL and issue = :JISSUE and publisher =:JPUB and ddc = :JDDC and to_char(year,'yyyy')=:JYEAR))";
    binds = [j_number, j_name, j_vol, j_issue, j_publisher, j_ddc, j_year];

    let connection;
    var context = {};

    try {
        // Get a connection from the default pool
        connection = await oracledb.getConnection('MainP');

        // kid 중복 검사
        var results = await connection.execute(sql, binds);
        // 쿼리 오류날 시 err = -1
        if (!results.rows.length) context.err = -1;
        else {
            context.err = 0;
            context.result1 = results.rows
        }
        var j_result = results.rows[0][0];

        if (!j_result) {
            sql = "insert into journal values(:JNAME, :JVOL, :JISSUE, :JPUB, :JDDC, :JNUM, to_date(:JYEAR, 'yyyy'))";
            binds = [j_name, j_vol, j_issue, j_publisher, j_ddc, j_number, j_year];
            if (j_vol == 0) binds[1] = null;
            if (j_issue == 0) binds[2] = null;
            await connection.execute(sql, binds);
            console.log("Added Journal : " + j_number);
        }
        else {
            console.log("Journal Already exists...");
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
        // 비로그인 상태면 paper_add_UATH
        if (!LoginState) res.render(__dirname + '/views/paper_add_UATH', { id: "Anonymous", LS: 0 });
        // 로그인 상태면 paper_add_J.ejs
        else res.render(__dirname + '/views/paper_add_J', { id: MainID, LS: 1 });
    }
});



app.get("/PaperAdd/Keyword", (req, res) => {
    // 비로그인 상태면 paper_add_UATH
    if (!LoginState) res.render(__dirname + '/views/paper_add_UATH', { id: "Anonymous", LS: 0 });
    // 로그인 상태면 paper_add_K.ejs
    else res.render(__dirname + '/views/paper_add_K', { id: MainID, LS: 1 });
});

app.post("/PaperAdd/Keyword", async (req, res) => {
    var k_id = req.body.K_ID;
    var k_sub = req.body.K_SUB;
    var k_ddc = req.body.K_DDC;
    k_ddc = Number(k_ddc) * 100;
    console.log(k_id + k_sub + k_ddc);

    let sql;

    sql = "select count(*) from keyword where k_id = :KID";
    binds = [k_id];

    let connection;
    var context = {};

    try {
        // Get a connection from the default pool
        connection = await oracledb.getConnection('MainP');

        // kid 중복 검사
        var results = await connection.execute(sql, binds);
        // 쿼리 오류날 시 err = -1
        if (!results.rows.length) context.err = -1;
        else {
            context.err = 0;
            context.result1 = results.rows
        }
        var k_result = results.rows[0][0];

        // sub + ddc 중복 검사
        sql = "select count(*) from keyword where sub = :KSUB and ddc = :KDDC";
        binds = [k_sub, k_ddc];
        results = await connection.execute(sql, binds);
        // 쿼리 오류날 시 err = -1
        if (!results.rows.length) context.err = -1;
        else {
            context.err = 0;
            context.result1 = results.rows
        }
        if (!k_result) { k_result = results.rows[0][0]; }
        console.log(k_result);

        if (!k_result) { // keyword not already exists -> can insert
            sql = "insert into keyword(sub, k_id, ddc) values(:KSUB,:KID,:KDDC)";
            binds = [k_sub, k_id, k_ddc];
            await connection.execute(sql, binds);
            console.log("Added Keyword : " + k_id);
        }
        else console.log("Keyword Already exists...");

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
        // 비로그인 상태면 paper_add_UATH
        if (!LoginState) res.render(__dirname + '/views/paper_add_UATH', { id: "Anonymous", LS: 0 });
        // 로그인 상태면 paper_add_K.ejs
        else res.render(__dirname + '/views/paper_add_K', { id: MainID, LS: 1 });
    }
});


// listen 8000 port
app.listen(PORT, () =>{
    console.log(`Server is running on port ${PORT}.`);

    init();
});



//test
/*
app.get("/Post", (req, res) => {
    res.render(__dirname + '/views/bookmark1_L', {id: MainID});
});
*/


