module.exports = 
{
    user : process.env.NODE_ORACLEDB_USER || "system",
    password : process.env.NODE_ORACLEDB_PASSWOR || "kkk12345",
    connectString : process.env.NODE_ORACLEDB_CONNECTIONSTRING || "20.121.23.59:1521/XE"
}