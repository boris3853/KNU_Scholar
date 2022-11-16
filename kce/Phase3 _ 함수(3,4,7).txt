//sql, stmt 는 변수 선언되어 있다고 생각하고 작성하였음.
    public void ShowPaperDetail(int DOI) {
        try {
			// Let's execute an SQL statement.
			// Title
			sql = "SELECT Title FROM PAPER" 
			sql += " WHERE DOI = " + doi;
			
			System.out.println("");
			ResultSet rs = stmt.executeQuery(sql);
			System.out.println(rs.getString(1));
			
			// Author - Name
			sql = "SELECT a.Name FROM AUTHOR a, WRITE w" 
			sql += " WHERE w.DOI = " + doi;
			sql += " AND a.R_number = w.R_number";
			
			System.out.print("저자\t\t");
			ResultSet rs = stmt.executeQuery(sql);
			while(rs.next()) {
				String name = rs.getString(1);
				System.out.print(name + "  ");
			}
			System.out.println("");
			
			// Journal - Publisher, Name, Vol, Issue, Year
			// #19
			sql = "SELECT j.Publisher, j.Name, j.Vol, j.Issue, TO_CHAR(j.Year, 'yyyy') FROM JOURNAL j, PAPER p" 
			sql += " WHERE p.DOI = " + doi;
			sql += " AND p.J_number = j.J_number";
			
			ResultSet rs = stmt.executeQuery(sql);
			System.out.print("발행기관\t\t");
			System.out.println(rs.getString(1));
			System.out.print("학술지명\t\t");
			System.out.println(rs.getString(2));
			System.out.print("권호사항\t\t");
			if(rs.getInt(3) != NULL)
			    System.out.print("Vol." + rs.getInt(3));
            if(rs.getInt(4) != NULL)
                System.out.print("No." + rs.getInt(4));
            System.out.println("");
            System.out.print("발행연도\t\t");
            System.out.println(rs.getString(5));
			
			// Keyword - Sub
			// 갯수까지 확인 할 수 있도록 쿼리 짜봤는데, 되는지 확인 못해봤어요.
			// #12, #16
			sql = "SELECT COUNT(*), k.sub FROM KEYWORD k, PAPER p, HAS h" 
			sql += " WHERE p.doi = " + doi;
			sql += " AND h.doi = p.doi";
			sql += " AND h.k_id = k.k_id";
			
			ResultSet rs = stmt.executeQuery(sql);
			System.out.print("주제어 (" + rs.getString(1) + ")\t\t");
			while(rs.next()) {
				String sub = rs.getString(2);
				System.out.print(sub + "  ");
			}
			System.out.println("");
			
			// MAJOR - 
			// #15
			sql = "SELECT f.large, f.middle FROM FIELD f, JOURNAL j, PAPER p";
			sql += " WHERE p.DOI = " + doi;
			sql += " AND p.J_number = j.J_number";
			sql += " AND j.ddc = f.ddc";
			
			ResultSet rs = stmt.executeQuery(sql);
			System.out.print("논문분야\t\t");
			System.out.println(rs.getString(1) + ", " + rs.getString(2));
			
			// Paper - Url
			sql = "SELECT url FROM PAPER" 
			sql += " WHERE DOI = " + doi;
			
			ResultSet rs = stmt.executeQuery(sql);
			System.out.print("발행기관 URL\t\t");
			System.out.println(rs.getString(1));
			
			// 피인용횟수(인용 당한 횟수)
			// #13
			sql = "SELECT COUNT(*) FROM REFERENCE r";
			sql += " WHERE r.ed_doi = " + doi;
			
			ResultSet rs = stmt.executeQuery(sql);
			System.out.println("인용된 횟수\t\t" + rs.getInt(1));
			
			// Paper - Reference (인용한 거)
			// #8
			sql = "SELECT p.title FROM PAPER p, REFERENCE r";
			sql += " WHERE r.ing_doi = " + doi;
			sql += " AND p.doi = r.ed_doi";
			sql += " ORDER BY p.title ASC";
			
			ResultSet rs = stmt.executeQuery(sql);
			System.out.print("REFERENCE\t\t");
			while(rs.next()) {
				String name = rs.getString(1);
				System.out.println(name);
			}
			System.out.println("");
			
			conn.commit();			
		}catch(SQLException ex2) {
			System.err.println("sql error = " + ex2.getMessage());
			System.exit(1);
		}
        
    }





public void ShowAuthorDetail(int Rnum) {
        try {
			// Let's execute an SQL statement.
			// Author - Name, Gender, Nation, Institution, Address
			sql = "SELECT name, gender, nation, institution, address FROM AUTHOR" 
			sql += " WHERE R_number = " + Rnum;
			
			System.out.println("");
			ResultSet rs = stmt.executeQuery(sql);
			System.out.println(rs.getString(1) + "( " + rs.getString(2) + ", " + rs.getString(3) + " )");
			System.out.println(rs.getString(4));
			System.out.println("Address : " + rs.getString(5));
			
			// Major - Field
			sql = "SELECT f.large, f.middle FROM MAJOR m, FIELD f";
			sql += " WHERE m.r_number = " + rnum;
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
			sql = "SELECT COUNT(*) FROM PAPER p, AUTHOR a, WRITE w" 
			sql += " WHERE a.r_number = " + rnum;
			sql += " AND p.doi = w.doi";
			sql += " GROUP BY a.r_number";
			
			ResultSet rs = stmt.executeQuery(sql);
			System.out.println("\n저자가 쓴 논문\t ( " + rs.getInt(1) + " )");
			
			// Author - Paper
			// #2
			sql = "SELECT p.title FROM PAPER p, AUTHOR a, WRITE w" 
			sql += " WHERE p.doi = w.doi";
			sql += " AND a.r_number = w.r_number";
			sql += " AND w.r_number = " + rnum;
			
			ResultSet rs = stmt.executeQuery(sql);
			
			while(rs.next()) {
				String title = rs.getString(1);
				System.out.println(title);
			}
			System.out.println("");
			
			// Author - Paper - Keyword
			sql = "SELECT k.sub FROM PAPER p, HAS h, KEYWORD k, WRITE w";
			sql += " WHERE w.r_number = " + rnum;
			sql += " AND w.doi = p.doi";
			sql += " AND p.doi = h.doi";
			sql += " AND h.k_id = k.k_id";
			
			System.out.println("저자관련 키워드");
			ResultSet rs = stmt.executeQuery(sql);
			
			while(rs.next()) {
			    String sub = rs.getString(1);
			    System.out.print(sub + "  ");
			}
			System.out.println("");
			
			conn.commit();			
		}catch(SQLException ex2) {
			System.err.println("sql error = " + ex2.getMessage());
			System.exit(1);
		}
        
    }






  public void ShowBookMark(int UserID) {
        try {
			// Let's execute an SQL statement.
			// K_bookmark
			// #18
			sql = "SELECT k.sub FROM KEYWORD k, K_BOOKMARK kb" 
			sql += " WHERE kb.id = " + UserID;
			sql += " AND k.k_id = kb.k_id";
			
			System.out.println("Keyword BookMark");
			ResultSet rs = stmt.executeQuery(sql);
			
			while(rs.next()) {
			    String sub = rs.getString(1);
			    System.out.print(sub + "  ");
			}
			System.out.println("");
			
			// A_bookmark
			sql = "SELECT a.name FROM AUTHOR a, A_BOOKMARK ab" 
			sql += " WHERE ab.id = " + UserID;
			sql += " AND a.r_number = ab.r_number";
			
			System.out.println("\nAuthor BookMark");
			ResultSet rs = stmt.executeQuery(sql);
			
			while(rs.next()) {
			    String author = rs.getString(1);
			    System.out.print(author + "  ");
			}
			System.out.println("");
			
			// P_bookmark
			sql = "SELECT p.title FROM PAPER p, P_BOOKMARK pb" 
			sql += " WHERE pb.id = " + UserID;
			sql += " AND p.doi = pb.doi";
			
			System.out.println("\nPaper BookMark");
			ResultSet rs = stmt.executeQuery(sql);
			
			while(rs.next()) {
			    String title = rs.getString(1);
			    System.out.println(title);
			}
			System.out.println("");
			
			conn.commit();			
		}catch(SQLException ex2) {
			System.err.println("sql error = " + ex2.getMessage());
			System.exit(1);
		}
        
    }