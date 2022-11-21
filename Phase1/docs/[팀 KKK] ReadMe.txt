Project Topic: 학술정보 데이터 검색 및 시각화 사이트 구축

[1. 기획 의도]
연구 분야 정하기 위해 "Google Scolar", "KCI(한국학술지인용색인)", "RISS(학술연구정보서비스)", "DBPia" 등의 국/내외 논문 검색 사이트를 이용해 논문을 검색해본 경험이 있었다.
해당 논문 검색 사이트들은 Text-Based로 논문 리스트를 보여 주었고, 이는 신입 연구원에게 최신 연구 동향을 파악하는데 어려움을 준다고 느꼈다.
따라서 Text-Based 논문 검색 방식에서 벗어나 검색한 논문에 대한 인용 관계 및 통계를 시각화하여 정보를 전달하는 것이 연구자에게 연구 주제 선정이나 연구 과정에 큰 도움을 줄 수 있을 것 같아 해당 서비스를 제안하게 되었다.

[2. 요구 사항]

* 논문 (PAPER)

(1) Entity
논문 Entity는 "학술정보 데이터 검색 및 시각화 사이트" 내에서 다루는 기본 요소로서 학술지나 학회에 투고하여 등재된 글을 총칭한다.

논문 Entity에 대한 데이터는 공공데이터포털에서 제공하는 국회도서관_국가학술정보 데이터셋(https://www.data.go.kr/data/15040837/fileData.do)
혹은 KCI / RISS / DBPIA 데이터 크롤링하여 재가공하거나 임의의 가상 데이터셋으로 구성할 예정이다.

(2) Attribute
Attribute 종류: DOI, Url, Summary, Title{English, Origin}, Uses, Author

- DOI: Digital Object Identifier의 약자로서 논문 Entity에 대한 Key Attribute 이다.
- Url: 전문 URL로 이를 통해 논문에 해당하는 주소로 바로 접속 가능하다.
- Summary: 논문에 대한 내용 요약본이다. 
- Title : 논문에 대한 제목이다. 영문과 원문 속성을 둘다 포함하고 있는 Multi-Value Attribute이며 논문 조회시 Title을 통해 논문이 조회될 수 있다. 
- Uses : 논문의 피인용수로 해당 논문이 인용될 때마다 피인용수가 증가한다. PAPER Entity의 Reference Relationship에 의해 Derived Attribute 속성을 가진다.
- Author: 논문에 대한 저자이며 공저자와 같이 저자가 여러명일 수 있기 때문에 다중값 속성을 가진다. 

(3) Relationship

- JOURNAL ["JOURNAL" - "PUBLISH" - "PAPER"]
JOURNAL과 PAPER는 1:N 관계를 가지고 있으며 하나의 JORNAL이 여러 PAPER을 발행한다.

- PAPER ["PAPER" - "HAS" - "KEYWORD"]
PAPER와 KEYWORD는 N:M 관계를 가지고 있어 하나의 PAPER가 여러 키워드를 가지는 동시에 키워드를 통해 여러 PAPER을 찾을 수 있다.

- AUTHOR ["AUTHOR" - "WRITE" - "PAPER"]
AUTHOR과 PAPER는 N:M 관계를 가지고 있으며 AUTHOR가 여러 PAPER을 낼 수 있고, 반대로 PAPER도 여러명에 의해 작성 될 수 있다.

- ACCOUNT ["ACCOUNT" - "P_BOOKMARK" - "PAPER"]
ACCOUNT와 PAPER는 N:M 관계를 가지고 있어 여러 ACCOUNT는 여러 PAPER에 대한 북마크를 설정할 수 있다.

- PAPER ["PAPER" - "REFERENCE" - "PAPER"]
PAPER와 PAPER은 M:N 관계를 가지고 있어 한 PAPER에 대해 여러 PAPER가 참조하는 동시에 특정 PAPER는 여러 PAPER에 의해 참조된다.

* 저자 AUTHOR
(1) Entity
저자 Author은 논문을 작성한 사람을 지칭한다. "학술정보 데이터 검색 및 시각화 사이트"에서는 출판된 논문의 저자만 AUTHOR로서 취급한다.

(2) Attribute
Attribute 종류: Name, Gender, Nation, Group{Institution, Department}, Major, Address, R_Number, Written, Keyword

- R_Number : Key Attribute로 Author에 대한 순번을 의미한다.
- Name : 저자의 이름을 의미한다. First Name과 Last Name을 따로 구분하지 않고 단일 이름을 사용한다.
- Gender : 저자의 성별을 의미한다. 성별은 "남"/"여"만 취급한다.
- Nation : 저자의 국적을 의미한다. 국적은 "KR"과 같이 표준 국가 코드에 맞춰 표기한다.
- Group : 저자의 소속을 의미한다. 소속은 {학교 혹은 연구실, 과} 값을 가질 수 있는 Multi-Value Attribute이다.
- Major : 저자의 전공을 의미하며, 여러 전공을 가질 수 있기 때문에 다중값 속성을 가진다.
- Address : 저자의 이메일 주소를 의미한다. 이메일 도메인을 따로 구분하지 않으며 이메일 전체 문자열을 이메일 주소로 사용한다.
- Written : 저자가 작성한 논문의 개수를 의미한다. PAPER Entity에서 Paper unit을 Counting 할 수 있기 때문에 Derived Attribute 속성을 가진다.

(3) Relationship

- PAPER ["AUTHOR" - "WRITE" - "PAPER"]
AUTHOR과 PAPER는 N:M 관계를 가지고 있으며 AUTHOR가 여러 PAPER을 낼 수 있고, 반대로 PAPER도 여러명에 의해 작성 될 수 있다.

- ACCOUNT ["ACCOUNT" - "A_BOOKMARK" - "AUTHOR"]
ACCOUNT와 AUTHOR은 M:N 관계를 가지고 있으며 ACCOUNT는 여러 AUTHOR을 북마크할 수 있고 반대로 AUTHOR도 여러 ACCOUNT에 의해 북마크 될 수 있다.



* 학술지 JOURNAL : 논문이 적힌 곳
(1) Entity
학술지 Journal은 논문이 투고되고 출판하는 주체를 의미한다.

(2) Attribute
Attribute: Publisher, Name, Vol. , Sort, Nation, Year, ISBN

- ISBN : International Standard Book Number 의 약자로 연구 주제 Entity에 대한 Key Attribute이다.
ISBN이 할당이 안된 데이터의 경우, 임의로 ISBN 값을 부여하여 Key Attribute로서의 속성을 유지한다.
- Publisher : 논문에 대한 발행기관을 의미한다.
- Name : 논문지에 대한 이름을 의미한다.
- Vol. : 논문지에 대한 권호를 의미한다. 단행본인 경우에 1을 연속간행물일 경우, 해당 권호수에 맞게 표기한다.
- Sort : 논문의 종류를 의미한다. 종류로는 연구보고서, 학위논문, 학술 저널 등이 존재한다.
- Nation : 발행국가를 의미한다.
- Year : 발행연도를 의미한다.

(3) Relationship

- - JOURNAL ["JOURNAL" - "PUBLISH" - "PAPER"]
JOURNAL과 PAPER는 1:N 관계를 가지고 있으며 하나의 JORNAL이 여러 PAPER을 발행한다.

- FIELD ["JOURNAL" - "IN" - "FIELD"]
FIELD와 JOURNAL은 1:N 관계를 가지며 하나의 FIELD 안에 여러 JORNAL이 포함되어 있다.

	

* 키워드 KEYWORD : 각 논문의 주제별 키워드
(1) Entity
키워드 Keyword는 논문이 가지고 있는 핵심 단어들 의미한다. FIELD 와 다르게 PAPER, ACCOUNT Entity가 세분화된 분야를 이용하기 때문에
KEYWORD Entity를 만들어 유지하게 되었다.

(2) Attribute
Attribute: Sub, K_ID

- K_ID : Key Attribute로 논문 키워드에 대해 할당된 ID를 의미한다.
- Sub: 논문에 대한 소분류 키워드를 의미한다.

(3) Relationship

- PAPER ["PAPER" - "HAS" - "KEYWORD"]
PAPER와 KEYWORD는 N:M 관계를 가지고 있어 하나의 PAPER가 여러 키워드를 가지는 동시에 키워드를 통해 여러 PAPER을 찾을 수 있다.

- FIELD ["FIELD" - "CONTAIN" - "KEYWORD"]
FIELD와 KEYWORD는 1:N 관계를 가지며 하나의 FIELD 내에 여러 KEYWORD가 존재한다.

- ACCOUNT ["ACCOUNT" - "K_BOOKMARK" - "KEYWORD"]
ACCOUNT와 PAPER는 N:M 관계를 가지고 있어 여러 ACCOUNT가 여러 KEYWORD에 대한 북마크를 설정할 수 있다.



* 분야(대분류) FIELD : 연구 주제
(1) Entity
연구 주제 FEILD는 연구에 대한 주제를 의미한다. 모든 연구 주제를 동등하게 분류하는 것은 비효율적이기 떄문에 
책을 분류하는 기준 중 하나인 듀이십진법(DDC)에 따라 연구 주제를 분류할 예정이다.

(2) Attribute
Attribute 종류: Large, Middle, DDC, keyword

- DDC : Dewey Decimal Classification의 약자로 연구 주제 Entity에 대한 Key Attribute이다.
- Large : 연구 주제 중 대분류를 의미한다. 예시로 어문학, 인문과학, 자연과학, 공학, 농학 등이 있다.
- Middle : 연구 주제 중 중분류를 의미한다. 예시로 언어학, 국어학, 전자공학, 통계학, 생물공학 등이 있다.

(3) Relationship

- KEYWORD ["FIELD" - "CONTAIN" - "KEYWORD"]
FIELD와 KEYWORD는 1:N 관계를 가지며 하나의 FIELD 내에 여러 KEYWORD가 존재한다.

- JOURNAL ["JOURNAL" - "IN" - "FIELD"]
FIELD와 JOURNAL은 1:N 관계를 가지며 하나의 FIELD 안에 여러 JORNAL이 포함되어 있다.



* 계정 ACCOUNT : 관리자/사용자
(1) Entity
계정 ACCOUNT는 인증된 개인에게만 "학술정보 데이터 검색 및 시각화 사이트" 서비스를 제공을 하기위해 사용하는 방법이다. 
웹사이트를 이용하는 사용자들이 "논문 검색 / 데이터 시각화 서비스"를 이용하기 위해 특정 ID와 PW를 정해 웹사이트 서비스를 이용한다.

(2) Attribute
Attribute: Kind, ID, Passwd

- ID : Key Attribute로 사용자를 구분할 수 있는 요소이다. ID는 시스템 내에서 중복해서 사용하지 못한다.
- Passwd : 사용자를 인증할 수 있는 임의의 번호를 의미한다.
- Kind : 계정의 종류를 의미한다. 계정의 종류로는 "사용자"와 "관리자" 계정이 존재한다.

(3) Relationship

- PAPER ["ACCOUNT" - "P_BOOKMARK" - "PAPER"]
ACCOUNT와 PAPER는 N:M 관계를 가지고 있어 여러 ACCOUNT는 여러 PAPER에 대한 북마크를 설정할 수 있다.

- KEYWORD ["ACCOUNT" - "K_BOOKMARK" - "KEYWORD"]
ACCOUNT와 PAPER는 N:M 관계를 가지고 있어 여러 ACCOUNT가 여러 KEYWORD에 대한 북마크를 설정할 수 있다.

- AUTHOR ["ACCOUNT" - "A_BOOKMARK" - "AUTHOR"]
ACCOUNT와 PAPER는 N:M 관계를 가지고 있어 여러 ACCOUNT가 여러 AUTHOR에 대한 북마크를 설정할 수 있다.

- POST ["ACCOUNT" - "WRITE_P" - "POST"]
ACCOUNT와 POST는 1:N 관계를 가지고 있어 하나의 ACCOUNT가 여러 POST를 작성할 수 있다.

- COMMENT ["ACCOUNT" - "WRITE_C" - "COMMENT"]
ACCOUNT와 COMMENT는 1:N 관계를 가지고 있어 한 ACCOUNT가 여러 COMMENT를 작성할 수 있다.



* 글 POST

(1) Entity
글 Post는 웹사이트내 "사용자 - 관리자" 혹은 "사용자 - 사용자" 끼리 소통하기 위한 글(원문)을 의미한다.
논문 검색 및 정보 시각화 서비스와 달리 사용자 혹은 관리자가 임의로 작성한 글만 취급한다.

(2) Attribute
Attribute 종류: "No.", Type, Title, Contents, Views, Date, Time

- No. : Key Attribute로 전체 글 중 해당 글의 순서를 의미한다.
- Type : 웹사이트에서의 해당 글의 종류를 의미한다. 웹사이트 글 종류로는 "공지", "자유글", "QnA"가 있다.
- Title : 글의 제목을 의미하며 사이트의 게시글 목록을 선택할 시에 나타나는 리스트 항목을 구분하는 요소이다.
- Contents : 글의 원문을 의미하며 사용자는 글 리스트 중 항목을 선택시에 접근할 수 있다.
- Views : 글의 조회수로 사용자가 글을 읽을(조회)때마다 글에 대한 조회수가 증가한다.
- Date : 사용자가 글을 작성한 날짜를 의미한다. 
- Time : 사용자가 글을 작성한 시간을 의미한다.

(3) Relationship

- ACCOUNT ["ACCOUNT" - "WRITE_P" - "POST"]
ACCOUNT와 POST는 1:N 관계를 가지고 있어 하나의 ACCOUNT가 여러 POST를 작성할 수 있다.

- COMMENT ["POST" - "ON" - "COMMENT"]
POST와 COMMENT는 1:N 관계를 가지고 있어 한 POST에 대해 여러 COMMENT를이 달릴 수 있다. 
또한, POST와 COMMNET 간의 Relation은 Weak Relationship을 가지고 있다.



* 댓글 COMMENT 

(1) Entity
댓글 Comment는 원문에 대한 짧은 답글을 의미한다. Comment는 
"학술정보 데이터 검색 및 시각화 사이트"에서는 댓글에 대한 댓글은 다루지 않고 원문에 대한 댓글만을 취급한다.
COMMENT Entity는 POST Entity가 존재해야 생성될 수 있으므로 Weak Entity이다.

(2) Attribute
Attribute 종류: "No.", Contents

- No. : Key Attribute로 전체 댓글 중 해당 댓글의 순서를 의미한다.
- Contents : 댓글에 대한 원문 내용을 의미한다.

(3) Relationship

- ACCOUNT ["ACCOUNT" - "WRITE_C" - "COMMENT"]
ACCOUNT와 COMMENT는 1:N 관계를 가지고 있어 한 ACCOUNT가 여러 COMMENT를 작성할 수 있다.

- POST ["POST" - "ON" - "COMMENT"]
POST와 COMMENT는 1:N 관계를 가지고 있어 한 POST에 대해 여러 COMMENT를이 달릴 수 있다. 
또한, POST와 COMMNET 간의 Relation은 Weak Relationship을 가지고 있다.
