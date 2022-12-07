app.get("/BookMark/K_Add", async (req, res) => {
    // 북마크 keyword추가 페이지로 넘어가기
    res.render(__dirname + '/views/bookmark3', {
        //넘기는 건데, kind 필요없음
        //req.query.(변수이름 name)
        //<input type="hidden" name="kind" value="<%= post %>"/>  이게 .ejs
        id: MainID, LS: 1
    });
});

/////////////////////////////////////////////////////

app.post("/BookMark/Delete", async (req, res) => {
    var bind = "", kind_ = req.body.kind;

    if (kind_ === "공지") bind = "ANN";
    else if (kind_ === "자유글") bind = "GNL";
    else if (kind_ === "QnA") bind = "QNA";

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

        context = { results: results.rows };


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

    // 비로그인 상태면 bookmark1_NL.ejs 화면
    if (!LoginState) {
        context.id = "Anonymous";
        context.LS = 0;
    }
    // res.render(__dirname + , {post: "공지", id: "Anonymous", LS:0});
    // 로그인 상태면 bookmark1_L.ejs 화면
    else {
        context.id = MainID;
        context.LS = 1;
    }

    context.post = kind_;
    res.render(__dirname + '/views/post1', context, function (err, html) {
        res.end(html);
    })

    // res.render(__dirname + '/views/post1', {
    //     kind: req.query.kind, id: MainID, LS:1});
});