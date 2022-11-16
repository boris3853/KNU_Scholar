package my_team;

import java.sql.*; // import JDBC package

public class exer {
	public static final String URL = "jdbc:oracle:thin:@localhost:1521:orcl";
	public static final String USER_UNIVERSITY ="my";
	public static final String USER_PASSWD ="my";

	public static void main(String[] args) {
		try {
			// Load a JDBC driver for Oracle DBMS
			Class.forName("oracle.jdbc.driver.OracleDriver");
			// Get a Connection object 
			System.out.println("Success!");
		}catch(ClassNotFoundException e) {
			System.err.println("error = " + e.getMessage());
			System.exit(1);
		}
				
		ShowPostAll(1);
		CreateAccount("new_id", "new_pass");
		DeleteAccount("new_id", "new_pass");


	}

	public static void ShowPostAll(int kind) { // 5
		Connection conn = null;
		String sql = "select p_no, title, date_time from post where category = ?";
		PreparedStatement ps = null;
		ResultSet rs = null;
		
		try {
			conn = DriverManager.getConnection(URL, USER_UNIVERSITY, USER_PASSWD); 
			ps = conn.prepareStatement(sql);
			if(kind == 1) ps.setString(1, "ANN"); // 공지
			else if(kind == 2) ps.setString(2, "GNL"); // 커뮤니티
			else if(kind == 2) ps.setString(2, "QNA"); // qna 
			rs = ps.executeQuery();
			System.out.println(String.format("%5s | %-50s\t | DATE ", "P_NO", "TITLE"));
			while(rs.next()) {
				int p_no = rs.getInt(1);
				String title = rs.getString(2);
				Date date = rs.getDate(3);
				System.out.println(String.format("%5d | %-50s\t | %tF ", p_no, title, date));
			}
			ps.close();
			rs.close();
			conn.close();
		} catch (SQLException e) {
			e.printStackTrace();
		}
	}
	
	public static void CreateAccount(String UserId, String UserPW) { // 8
		// CreateAccount(String UserId, String UserPW) - 계정 생성, insert, id 중복 검사, 성공시 '계정 생성 성공' 출력
		Connection conn = null;
		String sql = "INSERT INTO ACCOUNT(ID, Passwd, Kind) VALUES(?,?,'U')";
		PreparedStatement ps = null;
		int rs = 0;
		try {
			conn = DriverManager.getConnection(URL, USER_UNIVERSITY, USER_PASSWD); 
			ps = conn.prepareStatement(sql);
			ps.setString(1, UserId);
			ps.setString(2, UserPW);
			rs = ps.executeUpdate();
			ps.close();
			conn.close();
		} catch (SQLException e) {
			// e.printStackTrace();
		}
		if(rs == 1) System.out.println("계정 생성 성공");
		else System.out.println("계정 생성 실패"); 
	}
	
	public static void DeleteAccount(String UserId, String UserPW) { // 10
		// DeleteAccount(String UserId, String UserPW) - 계정 탈퇴, ID/PW 일치하면 삭제 , '삭제 완료' 출력
		Connection conn = null;
		String sql = "DELETE FROM ACCOUNT WHERE ID = ? AND Passwd = ?";
		PreparedStatement ps = null;
		int rs = 0;
		try {
			conn = DriverManager.getConnection(URL, USER_UNIVERSITY, USER_PASSWD); 
			ps = conn.prepareStatement(sql);
			ps.setString(1, UserId);
			ps.setString(2, UserPW);
			rs = ps.executeUpdate();
			ps.close();
			conn.close();
		} catch (SQLException e) {
			// e.printStackTrace();
		}
		if(rs == 1) System.out.println("계정 삭제 성공");
		else System.out.println("계정 삭제 실패");
	}

}
