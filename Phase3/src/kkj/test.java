package test;
import java.io.*;
import java.sql.*;
import java.util.Scanner;

public class test {
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
	
	
	// 1
	public static void SearchPaper(int type, String name)
	{
		try {
			conn.setAutoCommit(false);
			
			if(type == 1) sql = "SELECT * FROM PAPER p WHERE p.title like '%' || ? || '%'";
			// SELECT * FROM PAPER p WHERE p.title like '%Bitcoin%';
			else if(type == 2) sql = "SELECT * FROM AUTHOR a WHERE a.name like '%' || ? || '%'";
			// SELECT * FROM AUTHOR a WHERE a.name like '%Xu%';
			else if(type == 3) sql = "SELECT * FROM KEYWORD k WHERE k.sub like '%' || ? || '%'";
			// SELECT * FROM KEYWORD k WHERE k.sub like '%modeling%';
			
			PreparedStatement ps = conn.prepareStatement(sql);
//			System.out.print(type);
//			System.out.print(name);
			ps.setString(1, name);
			
			ResultSet rs = ps.executeQuery();
			while(rs != null && rs.next())
			{
				switch(type)
				{
				case 1:
					String title_ = rs.getString(1);
					String summary_ = rs.getString(2);
					String url_ = rs.getString(3);
					int doi_ = rs.getInt(4);
					int jnum_ = rs.getInt(5);
					
					System.out.println("\nTitle = " + title_);
					System.out.println("Summary = " + summary_);
					System.out.println("URL = " + url_);
					System.out.println("DOI = " + doi_);
					System.out.println("J_num = " + jnum_);
					break;
				case 2:
					String name_ = rs.getString(1);
					String inst_ = rs.getString(2);
					String gender_ = rs.getString(3);
					String nation_ = rs.getString(4);
					String addr_ = rs.getString(5);
					int rnum_ = rs.getInt(6);
					
					System.out.println("\nName = " + name_);
					System.out.println("Institution = " + inst_);
					System.out.println("Gender = " + gender_);
					System.out.println("Nation = " + nation_);
					System.out.println("Address = " + addr_);
					System.out.println("R_num = " + rnum_);
					break;
				case 3:
					String sub_ = rs.getString(1);
					int kid_ = rs.getInt(2);
					int ddc_ = rs.getInt(3);
					
					System.out.println("\nSub = " + sub_);
					System.out.println("K_id = " + kid_);
					System.out.println("DDC = " + ddc_);
					break;
				default:
				}
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
			sql = "INSERT INTO P_BOOKMARK(ID, DOI) VALUES(?, ?)";
//			INSERT INTO P_BOOKMARK(ID, DOI) VALUES('test', 111);
			
			PreparedStatement ps = conn.prepareStatement(sql);
			ps.setString(1, UserID);
			ps.setInt(2, DOI);
			
			ps.executeUpdate();
			System.out.println("Insert Success.");
			conn.commit();
			
		}catch(SQLException ex2) {
			System.err.println("sql error = " + ex2.getMessage());
			System.exit(1);
		}
		
		System.out.println(UserID);
		System.out.println(DOI);
		
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
	
	// 9
//	public static int LoginAccount(String UserID, String UserPW)
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
		
		if(ret == 1) System.out.println("Account available");
		else System.out.println("No Account");
//		return ret;
		
	}
	
	
	public static void main(String[] args) {
		Scanner sc = new Scanner(System.in);
		int op;
		
		System.out.println("Welcome to KKK Proejct!");
		System.out.println("==================================================");
		
		DBconnection();
		
		System.out.println("==================================================");
		System.out.println("Select Menu: \n");
		System.out.println("1. Search Paper");
		System.out.println("2. BookMark Paper");
		System.out.println("6. Show Post Detail");
		System.out.println("9. Login Account");
		System.out.println("--------------------------------------------------");
		System.out.println("0. Exit\n");
		
		System.out.println("==================================================");
		System.out.print("Enter selection number > ");
		op = sc.nextInt();
		
		System.out.println("\n==================================================");
		
		switch(op){
			case 1: // Search Paper
				System.out.println("Select Type: \n");
				System.out.println("1. Title");
				System.out.println("2. Author");
				System.out.println("3. Keyword");
				System.out.println("==================================================\n");
				System.out.print("Enter Type: ");
				int type = sc.nextInt();
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
				sc.nextLine(); // buffer
				String Pname = sc.nextLine();
				
				SearchPaper(type, Pname);
				break;
				
			case 2: // BookMark Paper
				sc.nextLine(); // buffer
				System.out.print("Enter UserID: ");
				String ID = sc.nextLine();
				System.out.print("Enter DOI: ");
				int DOI = sc.nextInt();

//
//				System.out.println(ID);
//				System.out.println(DOI);
				
				BookMarkPaper(ID, DOI);
				break;
				
			case 6: // Show Post Detail
				System.out.print("Enter PID: ");
				int PID = sc.nextInt(); 
				
				ShowPostDetail(PID);
				break;
				
			case 9: // Login Account
				sc.nextLine();
				System.out.print("Enter UserID: ");
				String UserID = sc.nextLine();
				System.out.print("Enter UserPW: ");
				String UserPW = sc.nextLine();
				
				LoginAccount(UserID, UserPW);
				break;
			default:
				System.out.println("Bye");
				System.exit(0);
		}
		
		sc.close();
		DBrelease();
	}
}
