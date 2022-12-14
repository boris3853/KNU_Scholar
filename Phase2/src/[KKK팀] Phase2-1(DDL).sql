CREATE TABLE PAPER (
	Title		VARCHAR(150) 	NOT NULL,
	Summary		CLOB,
	Url 		VARCHAR(50)    	NOT NULL,
	DOI		NUMBER		NOT NULL,
	J_NUMBER	NUMBER		NOT NULL,
	PRIMARY KEY (DOI)
);

CREATE TABLE REFERENCE (
	ing_DOI		NUMBER		NOT NULL,
	ed_DOI		NUMBER		NOT NULL,
	PRIMARY KEY (ing_DOI, ed_DOI)
);

CREATE TABLE AUTHOR (
	Name		VARCHAR(40)	NOT NULL,
	Institution	VARCHAR(260),
	Gender		CHAR,
	Nation		VARCHAR(3),
	Address		VARCHAR(40),
	R_number	NUMBER		NOT NULL,
	PRIMARY KEY (R_number)
);

CREATE TABLE MAJOR (
	R_number	NUMBER		NOT NULL,
	DDC		NUMBER		NOT NULL,
	PRIMARY KEY (R_number, DDC)
);

CREATE TABLE WRITE (
	DOI		NUMBER		NOT NULL,
	R_number	NUMBER		NOT NULL,
	PRIMARY KEY (DOI, R_number)
);

CREATE TABLE JOURNAL (
	Name		VARCHAR(150)	NOT NULL,
	Vol		NUMBER,
	Issue		NUMBER,
	Publisher		VARCHAR(40)	NOT NULL,
	DDC		NUMBER,
	J_NUMBER	NUMBER		NOT NULL,
	Year		DATE,
	PRIMARY KEY (J_NUMBER)
);

CREATE TABLE FIELD (
	Large		VARCHAR(45)	NOT NULL,
	Middle		VARCHAR(65)	NOT NULL,
	DDC		NUMBER		NOT NULL,
	PRIMARY KEY (DDC),
	UNIQUE (Large, Middle)
);

CREATE TABLE KEYWORD (
	Sub		VARCHAR(50)	NOT NULL,
	K_ID		NUMBER		NOT NULL,
	DDC		NUMBER,
	PRIMARY KEY (K_ID),
	UNIQUE (Sub)
);

CREATE TABLE HAS (
	DOI		NUMBER		NOT NULL,
	K_ID		NUMBER		NOT NULL,
	PRIMARY KEY (DOI, K_ID)
);

CREATE TABLE ACCOUNT (
	ID		VARCHAR(20)	NOT NULL,
	Passwd		VARCHAR(10)	NOT NULL,
	Kind		CHAR		NOT NULL,	-- 'U'(user) or 'A'(admin)
	PRIMARY KEY (ID)
);

CREATE TABLE K_BOOKMARK (
	ID  		VARCHAR(20)	NOT NULL,
	K_ID		NUMBER		NOT NULL,
	PRIMARY KEY (ID, K_ID)
);

CREATE TABLE P_BOOKMARK (
	ID		VARCHAR(20)	NOT NULL,
	DOI		NUMBER		NOT NULL,
	PRIMARY KEY (ID, DOI)
);

CREATE TABLE A_BOOKMARK (
	ID		VARCHAR(20)	NOT NULL,
	R_number	NUMBER		NOT NULL,
	PRIMARY KEY (ID, R_number)
);

CREATE TABLE POST (
	ID		VARCHAR(20)	NOT NULL,
	P_NO		NUMBER		NOT NULL,
	Category		VARCHAR(3)	NOT NULL,	-- ANN, GNL, QNA
	Title		VARCHAR(100)	NOT NULL,
	Date_Time	DATE		NOT NULL,
	Views		NUMBER 	default 0,
	Contents		CLOB		NOT NULL,
	PRIMARY KEY (P_NO)
);

CREATE TABLE COMMENTS (
	ID		VARCHAR(20)	NOT NULL,
	C_NO		NUMBER		NOT NULL,
	P_NO		NUMBER		NOT NULL,
	Contents		VARCHAR(300)	NOT NULL,
	Primary key(C_NO, P_NO, ID)
);

ALTER TABLE PAPER ADD FOREIGN KEY (J_NUMBER) REFERENCES JOURNAL(J_NUMBER);
ALTER TABLE REFERENCE ADD FOREIGN KEY (ing_DOI) REFERENCES PAPER(DOI);
ALTER TABLE REFERENCE ADD FOREIGN KEY (ed_DOI) REFERENCES PAPER(DOI);
ALTER TABLE WRITE ADD FOREIGN KEY (DOI) REFERENCES PAPER(DOI);
ALTER TABLE WRITE ADD FOREIGN KEY (R_number) REFERENCES AUTHOR(R_number);
ALTER TABLE MAJOR ADD FOREIGN KEY (R_number) REFERENCES AUTHOR(R_number);
ALTER TABLE MAJOR ADD FOREIGN KEY (DDC) REFERENCES FIELD(DDC);
ALTER TABLE JOURNAL ADD FOREIGN KEY (DDC) REFERENCES FIELD(DDC);
ALTER TABLE KEYWORD ADD FOREIGN KEY (DDC) REFERENCES FIELD(DDC);
ALTER TABLE HAS ADD FOREIGN KEY (DOI) REFERENCES PAPER(DOI);
ALTER TABLE HAS ADD FOREIGN KEY (K_ID) REFERENCES KEYWORD(K_ID);
ALTER TABLE K_BOOKMARK ADD FOREIGN KEY (ID) REFERENCES ACCOUNT(ID);
ALTER TABLE K_BOOKMARK ADD FOREIGN KEY (K_ID) REFERENCES KEYWORD(K_ID);
ALTER TABLE P_BOOKMARK ADD FOREIGN KEY (ID) REFERENCES ACCOUNT(ID);
ALTER TABLE P_BOOKMARK ADD FOREIGN KEY (DOI) REFERENCES PAPER(DOI);
ALTER TABLE A_BOOKMARK ADD FOREIGN KEY (ID) REFERENCES ACCOUNT(ID);
ALTER TABLE A_BOOKMARK ADD FOREIGN KEY (R_number) REFERENCES AUTHOR(R_number);
ALTER TABLE POST ADD FOREIGN KEY (ID) REFERENCES ACCOUNT(ID);
ALTER TABLE COMMENTS ADD FOREIGN KEY (ID) REFERENCES ACCOUNT(ID);
ALTER TABLE COMMENTS ADD FOREIGN KEY (P_NO) REFERENCES POST(P_NO);