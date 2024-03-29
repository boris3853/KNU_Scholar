package kkk;

import java.io.*;
import java.sql.*;
import java.util.*;
import java.util.Date;

public class KKK_PHASE3 {
	public static final String URL = "jdbc:oracle:thin:@20.121.23.59:1521:XE";
	public static final String USER ="system";
	public static final String PASSWD ="kkk12345";
	public static final String TABLE_NAME1 = "PAPER";
	public static final String TABLE_NAME2 = "AUTHOR";
	public static final String TABLE_NAME3 = "P_BOOKMARK";
	public static final String TABLE_NAME4 = "KEYWORD";
	public static final String TABLE_NAME5 = "ACCOUNT";
	public static final String TABLE_NAME6 = "POST";
	
	static Connection conn = null; // Connection object
	static Statement stmt = null;	// Statement object
	static String sql = ""; // an SQL statement 
	static ResultSet rs = null; // result set object
	
	static int LoginState = 0;
	static int LoopState = 0;
	static String ID = "";
	static String PW = "";
	
	public static void DBconnection()
	{
		try {
			// Load a JDBC driver for Oracle DBMS
			Class.forName("oracle.jdbc.driver.OracleDriver");
			// Get a Connection object 
			System.out.println("Success!");
		}catch(ClassNotFoundException e) {
			System.err.println("error = " + e.getMessage());
			System.exit(1);
		}

		// Make a connection
		try{
			conn = DriverManager.getConnection(URL, USER, PASSWD); 
			System.out.println("Connected.");
		}catch(SQLException ex) {
			ex.printStackTrace();
			System.err.println("Cannot get a connection: " + ex.getLocalizedMessage());
			System.err.println("Cannot get a connection: " + ex.getMessage());
			System.exit(1);
		}
	}
	
	public static void DBrelease()
	{
		// Release database resources.
		try {
			// Close the Statement object.
			//stmt.close(); 
			// Close the Connection object.
			conn.close();
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	public static void PrintUser()
	{
		if(LoginState == 1) System.out.println("Login as " + ID);
	}
	
	
	// 1
	public static void SearchPaper(int type, String name)
	{
		try {
			conn.setAutoCommit(false);
			
			if(type == 1) sql = "SELECT * FROM PAPER p WHERE p.title like '%' || ? || '%'";
			// SELECT * FROM PAPER p WHERE p.title like '%Bitcoin%';
			else if(type == 2) sql = "SELECT p.* FROM PAPER p, AUTHOR a, WRITE w WHERE a.name LIKE '%' || ? || "
					+ "'%' AND p.doi = w.doi AND a.r_number = w.r_number";
			// SELECT * FROM AUTHOR a WHERE a.name like '%Xu%';
			else if(type == 3) sql = "SELECT p.* FROM PAPER p, KEYWORD k, HAS h"
					+ " WHERE k.sub LIKE '%' || ? || '%' AND p.doi = h.doi AND k.k_id = h.k_id";
			// SELECT * FROM KEYWORD k WHERE k.sub like '%modeling%';
			
			PreparedStatement ps = conn.prepareStatement(sql);
//			System.out.print(type);
//			System.out.print(name);
			ps.setString(1, name);
			
			int itr = 0;
			ResultSet rs = ps.executeQuery();
			while(rs != null && rs.next())
			{
				String title_ = rs.getString(1);
				String summary_ = rs.getString(2);
				String url_ = rs.getString(3);
				int doi_ = rs.getInt(4);
				int jnum_ = rs.getInt(5);
				
				System.out.println("\n#" + String.valueOf(itr++));
				System.out.println("Title = " + title_);
				System.out.println("Summary = " + summary_);
				System.out.println("URL = " + url_);
				System.out.println("DOI = " + doi_);
				System.out.println("J_num = " + jnum_);
			}
			
			ps.close();
			rs.close();
			conn.commit();
		}catch(SQLException ex2) {
			System.err.println("sql error = " + ex2.getMessage());
			System.exit(1);
		}
	}
	
	// 2
	public static void BookMarkPaper(String UserID, int DOI)
	{
		try {
			conn.setAutoCommit(false);
			sql = "SELECT * FROM P_BOOKMARK WHERE ID = ? AND DOI = ?";
			PreparedStatement ps = conn.prepareStatement(sql);
			ps.setString(1, UserID);
			ps.setInt(2, DOI);
			rs = ps.executeQuery();
			if(rs.next()) {
				System.out.println("이미 북마크된 논문입니다.");
				return;
			}
			
			sql = "INSERT INTO P_BOOKMARK(ID, DOI) VALUES(?, ?)";
//			INSERT INTO P_BOOKMARK(ID, DOI) VALUES('test', 111);
			
			ps = conn.prepareStatement(sql);
			ps.setString(1, UserID);
			ps.setInt(2, DOI);
			
			ps.executeUpdate();
			System.out.println("Insert Success.");
			conn.commit();
			
		}catch(SQLException ex2) {
			System.err.println("sql error = " + ex2.getMessage());
			System.exit(1);
		}		
	}
	
	// 3
    public static void ShowPaperDetail(int DOI) {
    	//sql, stmt 는 변수 선언되어 있다고 생각하고 작성하였음.
        try {
			// Let's execute an SQL statement.
			// Title
			sql = "SELECT Title FROM PAPER WHERE DOI = " + DOI;
			
			System.out.println("");
			stmt = conn.createStatement();
			rs = stmt.executeQuery(sql);
			if(!rs.next()) {
				System.out.println("존재하지 않는 논문입니다.");
				return;
			}
			System.out.println(rs.getString(1));
			
			// Author - Name
			sql = "SELECT a.Name, a.r_number FROM AUTHOR a, WRITE w";
			sql += " WHERE w.DOI = " + DOI;
			sql += " AND a.R_number = w.R_number";
			
			System.out.print("저자\t\t");
			rs = stmt.executeQuery(sql);
			while(rs.next()) {
				String name = rs.getString(1);
				int rnumber = rs.getInt(2);
				System.out.print(name + "("+rnumber + ")  ");
			}
			System.out.println("");
			
			// Journal - Publisher, Name, Vol, Issue, Year
			// #19
			sql = "SELECT j.Publisher, j.Name, j.Vol, j.Issue, TO_CHAR(j.Year, 'yyyy') FROM JOURNAL j, PAPER p";
			sql += " WHERE p.DOI = " + DOI;
			sql += " AND p.J_number = j.J_number";
			
			rs = stmt.executeQuery(sql);
			System.out.print("발행기관\t\t");
			rs.next();
			System.out.println(rs.getString(1));
			System.out.print("학술지명\t\t");
			System.out.println(rs.getString(2));
			System.out.print("권호사항\t\t");
			int rs_num = rs.getInt(3);
			if(!rs.wasNull()) System.out.print("Vol." + rs_num);
			rs_num = rs.getInt(4);
			if(!rs.wasNull()) System.out.print("No." + rs_num);
			
            System.out.println("");
            System.out.print("발행연도\t\t");
            System.out.println(rs.getString(5));
			
            
			// Keyword - Sub
			// #12, #16
			sql = "SELECT COUNT(*) FROM HAS h";
			sql += " WHERE h.doi = " + DOI;
			rs = stmt.executeQuery(sql);
			rs.next();
			System.out.print("주제어 (" + rs.getInt(1) + ")\t");
			
			sql = "SELECT k.sub FROM KEYWORD k, HAS h";
			sql += " WHERE h.doi = " + DOI;
			sql += " AND h.k_id = k.k_id";
			
			rs = stmt.executeQuery(sql);
			while(rs.next()) {	
				String sub = rs.getString(1);
				System.out.print(sub + "  ");
			}
			System.out.println("");
			
			
			// MAJOR - 
			// #15
			sql = "SELECT f.large, f.middle FROM FIELD f, JOURNAL j, PAPER p";
			sql += " WHERE p.DOI = " + DOI;
			sql += " AND p.J_number = j.J_number";
			sql += " AND j.ddc = f.ddc";
			
			rs = stmt.executeQuery(sql);
			rs.next();
			System.out.print("논문분야\t\t");
			System.out.println(rs.getString(1) + ", " + rs.getString(2));
			
			// Paper - Url
			sql = "SELECT url FROM PAPER";
			sql += " WHERE DOI = " + DOI;
			
			rs = stmt.executeQuery(sql);
			rs.next();
			System.out.print("발행기관 URL\t");
			System.out.println(rs.getString(1));
			
			// 피인용횟수(인용 당한 횟수)
			// #13
			sql = "SELECT COUNT(*) FROM REFERENCE r";
			sql += " WHERE r.ed_doi = " + DOI;
			
			rs = stmt.executeQuery(sql);
			rs.next();
			System.out.println("인용된 횟수\t\t" + rs.getInt(1));
			
			// Paper - Reference (인용한 거)
			// #8
			sql = "SELECT p.title FROM PAPER p, REFERENCE r";
			sql += " WHERE r.ing_doi = " + DOI;
			sql += " AND p.doi = r.ed_doi";
			sql += " ORDER BY p.title ASC";
			
			rs = stmt.executeQuery(sql);
			System.out.println("REFERENCE");
			while(rs.next()) {
				String name = rs.getString(1);
				System.out.println(name);
			}
			System.out.println("");
			

			if(LoginState == 1)
			{
				// BookMark Paper
				Scanner sc = new Scanner(System.in);
				//sc.nextLine(); // buffer
				System.out.print("\nBook Mark? (y/n): ");
				String chk_bm = sc.nextLine();
				
				// 좀따가 기능추가
				if(chk_bm.equals("y")) BookMarkPaper(ID, DOI);
			}
			
					
		}catch(SQLException ex2) {
			System.err.println("sql error = " + ex2.getMessage());
			System.exit(1);
		}
    }

    // 4
    public static void ShowAuthorDetail(int Rnum) {
        try {
			// Let's execute an SQL statement.
			// Author - Name, Gender, Nation, Institution, Address
			sql = "SELECT name, gender, nation, institution, address FROM AUTHOR"; 
			sql += " WHERE R_number = " + Rnum;
			stmt = conn.createStatement();
			
			System.out.println("");
			rs = stmt.executeQuery(sql);
			if(!rs.next()) {
				System.out.println("존재하지 않는 저자입니다.");
				return;
			}
			System.out.println(rs.getString(1) + "( " + rs.getString(2) + ", " + rs.getString(3) + " )");
			System.out.println(rs.getString(4));
			System.out.println("Address : " + rs.getString(5));
			
			// Major - Field
			sql = "SELECT f.large, f.middle FROM MAJOR m, FIELD f";
			sql += " WHERE m.r_number = " + Rnum;
			sql += " AND m.ddc = f.ddc";
			
			System.out.println("저자관련 전공");
			ResultSet rs = stmt.executeQuery(sql);
			
			while(rs.next()) {
			    String large = rs.getString(1);
			    String middle = rs.getString(2);
			    System.out.println(large + ", " + middle);
			}
			
			// Author - Paper Count
			// #3
			sql = "SELECT COUNT(*) FROM AUTHOR a, WRITE w";
			sql += " WHERE a.r_number = " + Rnum;
			sql += " AND a.r_number = w.r_number";
			
			rs = stmt.executeQuery(sql);
			rs.next();
			System.out.println("\n저자가 쓴 논문\t ( " + rs.getInt(1) + " )");
			
			// Author - Paper
			// #2
			sql = "SELECT p.title FROM PAPER p, AUTHOR a, WRITE w";
			sql += " WHERE p.doi = w.doi";
			sql += " AND a.r_number = w.r_number";
			sql += " AND w.r_number = " + Rnum;
			
			rs = stmt.executeQuery(sql);
			
			while(rs.next()) {
				String title = rs.getString(1);
				System.out.println(title);
			}
			System.out.println("");
			
			// Author - Paper - Keyword
			sql = "SELECT k.sub FROM PAPER p, HAS h, KEYWORD k, WRITE w";
			sql += " WHERE w.r_number = " + Rnum;
			sql += " AND w.doi = p.doi";
			sql += " AND p.doi = h.doi";
			sql += " AND h.k_id = k.k_id";
			
			System.out.println("저자관련 키워드");
			rs = stmt.executeQuery(sql);
			
			while(rs.next()) {
			    String sub = rs.getString(1);
			    System.out.print(sub + "  ");
			}
			System.out.println("");
						
		}catch(SQLException ex2) {
			System.err.println("sql error = " + ex2.getMessage());
			System.exit(1);
		}   
    }
	
	// 5
	public static void ShowPostAll(int kind) {
		try {
			String sql = "select p_no, title, date_time from post where category = ?";
			PreparedStatement ps = conn.prepareStatement(sql);
			
			if(kind == 1) ps.setString(1, "ANN"); // 공지
			else if(kind == 2) ps.setString(1, "GNL"); // 커뮤니티
			else if(kind == 3) ps.setString(1, "QNA"); // qna 
			
			rs = ps.executeQuery();
			
			System.out.println(String.format("%5s | %-50s\t | DATE ", "P_NO", "TITLE"));
			
			while(rs.next()) {
				int p_no = rs.getInt(1);
				String title = rs.getString(2);
				Date date = rs.getDate(3);
				System.out.println(String.format("%5d | %-50s\t | %tF ", p_no, title, date));
			}
		} catch (SQLException e) {
			e.printStackTrace();
		}
	}
	
	// 6
	public static void ShowPostDetail(int PID)
	{
		try {
			conn.setAutoCommit(false);
			
			// POST
			
			sql = "SELECT * FROM POST p WHERE p.p_no = ?";
//			SELECT * FROM POST p WHERE p.p_no = 10;
			
			PreparedStatement ps = conn.prepareStatement(sql);
			ps.setInt(1, PID);
			
			ResultSet rs = ps.executeQuery();
			while(rs != null && rs.next())
			{
				String id_ = rs.getString(1);
				int pno_ = rs.getInt(2);
				String category_ = rs.getString(3);
				String title_ = rs.getString(4);
				Date datetime_ = rs.getDate(5);
				int view_ = rs.getInt(6);
				String content_ = rs.getString(7);
				
				System.out.println("\nID = " + id_);
				System.out.println("P_num = " + pno_);
				System.out.println("Category = " + category_);
				System.out.println("Title = " + title_);
				System.out.println("Date = " + datetime_);
				System.out.println("View = " + view_);
				System.out.println("Content = " + content_);
				
			}
			
			// COMMENT
			
			sql = "SELECT co.id, co.contents FROM COMMENTS co WHERE co.p_no = ?";
//			SELECT co.id, co.contents FROM COMMENTS co WHERE co.p_no = 10;
			
			ps = conn.prepareStatement(sql);
			ps.setInt(1, PID);
			
			
			System.out.println("\nComments ==>");
			int itr = 1;
			
			rs = ps.executeQuery();
			while(rs != null && rs.next())
			{
				String id_ = rs.getString(1);
				String contents_ = rs.getString(2);
			
				System.out.println("\n#" + itr++);
				System.out.println("ID = " + id_);
				System.out.println("Contents = " + contents_);				
			}
			
			ps.close();
			rs.close();
			conn.commit();
		}catch(SQLException ex2) {
			System.err.println("sql error = " + ex2.getMessage());
			System.exit(1);
		}
	}
	
	// 7
	 public static void ShowBookMark(String UserID) {
	        try {
				// Let's execute an SQL statement.
				// K_bookmark
				// #18
				sql = "SELECT k.sub FROM KEYWORD k, K_BOOKMARK kb";
				sql += " WHERE kb.id = \'" + UserID;
				sql += "\' AND k.k_id = kb.k_id";
				
				System.out.println("Keyword BookMark");
				stmt = conn.createStatement();
				rs = stmt.executeQuery(sql);
				
				while(rs.next()) {
				    String sub = rs.getString(1);
				    System.out.print("-" + sub + "  ");
				}
				System.out.println("");
				
				// A_bookmark
				sql = "SELECT a.name FROM AUTHOR a, A_BOOKMARK ab";
				sql += " WHERE ab.id = \'" + UserID;
				sql += "\' AND a.r_number = ab.r_number";
				
				System.out.println("\nAuthor BookMark");
				rs = stmt.executeQuery(sql);
				
				while(rs.next()) {
				    String author = rs.getString(1);
				    System.out.print("-" + author + "  ");
				}
				System.out.println("");
				
				// P_bookmark
				sql = "SELECT p.title FROM PAPER p, P_BOOKMARK pb";
				sql += " WHERE pb.id = \'" + UserID;
				sql += "\' AND p.doi = pb.doi";
				
				System.out.println("\nPaper BookMark");
				rs = stmt.executeQuery(sql);
				
				while(rs.next()) {
				    String title = rs.getString(1);
				    System.out.println("-" + title);
				}
				System.out.println("");
				
			}catch(SQLException ex2) {
				System.err.println("sql error = " + ex2.getMessage());
				System.exit(1);
			}   
	    }
	
	// 8
	public static void CreateAccount(String UserId, String UserPW) {
		// CreateAccount(String UserId, String UserPW) - 계정 생성, insert, id 중복 검사, 성공시 '계정 생성 성공' 출력
		int rs = 0;
		
		if(FindAccount(UserId) == false)
		{
			try {
				String sql = "INSERT INTO ACCOUNT(ID, Passwd, Kind) VALUES(?,?,'U')";
				PreparedStatement ps = conn.prepareStatement(sql);
				ps.setString(1, UserId);
				ps.setString(2, UserPW);
				rs = ps.executeUpdate();
				ps.close();
			} catch (SQLException e) {
				e.printStackTrace();
			}
			if(rs == 1) System.out.println("계정 생성 성공");
			else System.out.println("계정 생성 실패");
		}else {
			System.out.println("계정이 이미 존재합니다.");
		}
		 
	}
	
	public static boolean FindAccount(String UserID)
	{
		int ret = 0;
		try {
			conn.setAutoCommit(false);
			
			sql = "SELECT COUNT(*) as EXIST FROM ACCOUNT ac WHERE ac.id = ?";
				
			PreparedStatement ps = conn.prepareStatement(sql);
			ps.setString(1, UserID);
			
			ResultSet rs = ps.executeQuery();
		
			while(rs != null && rs.next())
				ret = rs.getInt(1);
				
			ps.close();
			rs.close();
			conn.commit();
		}catch(SQLException ex2) {
			System.err.println("sql error = " + ex2.getMessage());
			System.exit(1);
		}
			
		if(ret == 1) return true;
		else return false;
	}
	
	// 9
	public static void LoginAccount(String UserID, String UserPW)
	{
		// 1: success 0: fail
		int ret = 0;
		try {
			conn.setAutoCommit(false);
			
			sql = "SELECT COUNT(*) as EXIST FROM ACCOUNT ac WHERE ac.id = ? and ac.passwd = ?";
//			SELECT COUNT(*) as EXIST FROM ACCOUNT WHERE ac.id = 'test2' and ac.passwd = '1q2w3e4r!';
				
			PreparedStatement ps = conn.prepareStatement(sql);
			ps.setString(1, UserID);
			ps.setString(2,  UserPW);
			
			ResultSet rs = ps.executeQuery();
			
			while(rs != null && rs.next())
				ret = rs.getInt(1);
			
			ps.close();
			rs.close();
			conn.commit();
		}catch(SQLException ex2) {
			System.err.println("sql error = " + ex2.getMessage());
			System.exit(1);
		}
		
		if(ret == 1) {
			LoginState = 1;
			ID = UserID;
			System.out.println("Account => " + ID);
		}
		else System.out.println("No Account");
	}
	
	// 10
	public static void DeleteAccount(String UserId, String UserPW) { // 10
		// DeleteAccount(String UserId, String UserPW) - 계정 탈퇴, ID/PW 일치하면 삭제 , '삭제 완료' 출력
		int rs = 0;
		if(!ID.equals(UserId)) {
			System.out.println("잘못된 아이디입니다. 현재 로그인한 계정만 삭제할 수 있습니다.");
			return;
		}
		try {			
			String sql = "DELETE FROM ACCOUNT WHERE ID = ? AND Passwd = ?";
			PreparedStatement ps = conn.prepareStatement(sql);
			ps.setString(1, UserId);
			ps.setString(2, UserPW);
			rs = ps.executeUpdate();
			ps.close();
		} catch (SQLException e) {
			e.printStackTrace();
		}
		if(rs == 1) {
			System.out.println("계정 삭제 성공");
			LoginState = 0;
		}
		else System.out.println("계정 삭제 실패");
	}
	
	
	public static void main(String[] args) {
		Scanner sc = new Scanner(System.in);
		int op;
		
		System.out.println("Welcome to KKK Proejct!");
		System.out.println("==================================================");
		
		DBconnection();
		

		while(LoopState == 0)
		{
			System.out.println("==================================================");
			if(LoginState == 1) System.out.println("Login as \"" + ID + "\"");
			System.out.println("Select Menu: \n");
			System.out.println("1. Search Paper");
			System.out.println("2. Show Post");
			if(LoginState == 1) System.out.println("3. Show BookMark");
			System.out.println("4. Login");
			System.out.println("--------------------------------------------------");
			System.out.println("0. Exit\n");
			
			System.out.println("==================================================");
			System.out.print("Enter selection number > ");
			
			while(true)
			{
				try {
					op = sc.nextInt();
					break;
				}catch(InputMismatchException e) {
					System.out.println("정수만 입력해주세요.");
					System.out.print("Enter selection number > ");
					sc = new Scanner(System.in);
				}
			}
			
			
			System.out.println("==================================================");
			
			switch(op){
				case 1: // Show Paper
					System.out.println("Select Type: \n");
					System.out.println("1. Title");
					System.out.println("2. Author");
					System.out.println("3. Keyword");
					System.out.println("==================================================\n");
					System.out.print("Enter Type: ");
					
					int type;
					while(true)
					{
						try {
							type = sc.nextInt();
							break;
						}catch(InputMismatchException e) {
							System.out.println("정수만 입력해주세요.");
							System.out.print("Enter selection number > ");
							sc = new Scanner(System.in);
						}
					}
					
					switch(type){
						case 1:
							System.out.print("Enter Title Name: ");
							break;
						case 2:
							System.out.print("Enter Author Name: ");
							break;
						case 3:
							System.out.print("Enter Keyword Name: ");
							break;
					}
					
					// Search Paper
					sc.nextLine(); // buffer
					String Pname = sc.nextLine();
					SearchPaper(type, Pname);
					
					// Show Paper Detail
					System.out.print("\nEnter DOI: ");
					
					int DOI_;
					while(true)
					{
						try {
							DOI_ = sc.nextInt();
							break;
						}catch(InputMismatchException e) {
							System.out.println("정수만 입력해주세요.");
							System.out.print("Enter selection number > ");
							sc = new Scanner(System.in);
						}
					}
					
					ShowPaperDetail(DOI_);
					
					// Show Author Detail
					System.out.print("\nEnter Rnum: ");
					
					int RNUM2;
					while(true)
					{
						try {
							RNUM2 = sc.nextInt();
							break;
						}catch(InputMismatchException e) {
							System.out.println("정수만 입력해주세요.");
							System.out.print("Enter selection number > ");
							sc = new Scanner(System.in);
						}
					}
					ShowAuthorDetail(RNUM2);
					
					// 나중에 분기문 체크
					break;
					
				case 2: // Show Post
					System.out.println("");
					System.out.println("1. 공지");
					System.out.println("2. 커뮤니티");
					System.out.println("3. Q & A");
					System.out.println("==================================================\n");
					
					// Show post by category
					System.out.print("Enter kind(num): ");
					
					int KIND; 
					while(true)
					{
						try {
							KIND = sc.nextInt();
							break;
						}catch(InputMismatchException e) {
							System.out.println("정수만 입력해주세요.");
							System.out.print("Enter selection number > ");
							sc = new Scanner(System.in);
						}
					}
					
					// KIND 예외 처리
					if(KIND < 1 || KIND > 3)
					{
						System.out.println("1(공지) / 2(커뮤니티) / 3(qna)만 선택가능합니다.");
						break;
					}
					
					ShowPostAll(KIND);
					
					// Show Post Detail
					System.out.print("Enter P_NO: ");
					
					int PID; 
					while(true)
					{
						try {
							PID = sc.nextInt();
							break;
						}catch(InputMismatchException e) {
							System.out.println("정수만 입력해주세요.");
							System.out.print("Enter selection number > ");
							sc = new Scanner(System.in);
						}
					}
					
					ShowPostDetail(PID);
					break;
					
				case 3: // Show User BookMark
					if(LoginState != 1)
					{
						System.out.println("Unauthorized Access");
						break;
					}
					
					ShowBookMark(ID);
					break;
				
				case 4: // Account
					int type2 = -1;
					do {
						System.out.println("\n1. Create Account");
						System.out.println("2. Login Account");
						if(LoginState!=0)
							System.out.println("3. Delete Account");
						System.out.println("--------------------------------------------------");
						System.out.println("0. Exit\n");
						System.out.println("==================================================");
						System.out.print("Enter Type: ");
						
						while(true)
						{
							try {
								type2 = sc.nextInt();
								break;
							}catch(InputMismatchException e) {
								System.out.println("정수만 입력해주세요.");
								System.out.print("Enter selection number > ");
								sc = new Scanner(System.in);
							}
						}
						
						if(type2 == 0) break;
						
						sc.nextLine();
						System.out.print("Enter UserID: ");
						String UserID0 = sc.nextLine();
						System.out.print("Enter UserPW: ");
						String UserPW0 = sc.nextLine();
						
						switch(type2){
							case 1: // Create Account
								CreateAccount(UserID0, UserPW0);
								break;
							case 2: // Login Account
								LoginAccount(UserID0, UserPW0);
								break;
							case 3: // Delete Account
								DeleteAccount(UserID0, UserPW0);
								break;
						}
						System.out.println("");
					}while(type2 != 0);
					break;
					
				default:
					System.out.println("Bye");
					LoopState = -1;
			}
		}
		
		
		sc.close();
		DBrelease();
	}
}
