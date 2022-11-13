-- TYPE 1 : A single-table query
-- 제목 검색: 제목에 'Bitcoin'이 포함된 논문검색
SELECT p.title FROM PAPER p
WHERE p.title like '%Bitcoin%';

-- TYPE 2 : Multi-way join with join predicates in WHERE
-- r_number가 12111인 저자가 쓴 논문 리스트
SELECT p.* FROM PAPER p, AUTHOR a, WRITE w
WHERE p.doi = w.doi
AND a.r_number = w.r_number
AND w.r_number = 12111;

-- TYPE 3 : Aggregation + multi-way + GROUP BY
-- 각 저자가 쓴 논문 갯수
SELECT a.r_number, COUNT(*) FROM AUTHOR a, PAPER p, WRITE w
WHERE a.r_number = w.r_number
AND p.doi = w.doi
GROUP BY a.r_number;

-- TYPE 4 : Subquery
-- 'kkk' 계정이 쓴 게시글 확인하기
SELECT po.title FROM POST po
WHERE po.id = (
	SELECT ac.id FROM ACCOUNT ac
	WHERE ac.id = 'kkk'
);

-- TYPE 5 : EXISTS 포함 Subquery
-- 'kkk' 계정이 쓴 글에 댓글이 달렸는지 확인 (댓글인 달린 포스트만 보여준다)
SELECT po.category, po.title, po.date_time FROM POST po
WHERE po.id = 'kkk'
AND EXISTS (
	SELECT * FROM COMMENTS
	WHERE c_no = po.p_no
);

-- TYPE 6 : Selection + Projection + IN predicates
-- 'kkk' 계정이 북마크한 저자가 쓴 논문 제목 보여주기
SELECT a.name, p.title FROM paper p, AUTHOR a, WRITE w
WHERE p.doi = w.doi
AND a.r_number = w.r_number
AND a.r_number in (
	SELECT ab.r_number FROM A_BOOKMARK ab
	WHERE ab.id = 'kkk'
);

-- -- TYPE 7 : In-line view
-- 'kkk' 계정이 북마크한 논문 리스트 중에서 키워드가 'Image segmentation'인 논문
WITH pp AS
	(SELECT p.* FROM PAPER p, P_BOOKMARK pb
	WHERE pb.id = 'kkk' AND p.doi = pb.doi)
SELECT pp.doi, pp.title
FROM pp, KEYWORD k, HAS h
WHERE k.sub = 'Image segmentation'
AND k.k_id = h.k_id
AND pp.doi = h.doi;

-- -- TYPE 8 : Multi-way join + ORDER BY
-- doi가 1인 논문이 참고하는 논문을 제목 오름차순 정렬
SELECT p.doi, p.title FROM PAPER p, REFERENCE r
WHERE r.ing_doi = 1
AND p.doi = r.ed_doi
ORDER BY p.title asc;

-- TYPE 9 : Aggregation + multi-way + GROUP BY + ORDER BY
-- 북마크 수가 2 넘는 것을 기준으로 인기논문 보여주기
SELECT p.doi, p.title, count(*) FROM PAPER p, P_BOOKMARK pb
WHERE p.doi = pb.doi
GROUP BY (p.doi, p.title)
HAVING COUNT(p.doi) > 2
ORDER BY COUNT(p.doi) desc;

-- TYPE 10 : SET operation (UNION, SET DIFFERENCE, INTERSECT...)
-- 논문 검색 : 제목이 'Wireless' 포함, 저자가 'Alan' 포함, 키워드 'Computer' 포함하는 논문 검색
( SELECT p.title FROM PAPER p
 WHERE p.title LIKE '%Wireless%' )
INTERSECT
( SELECT p.title FROM PAPER p, AUTHOR a, WRITE w
 WHERE a.name LIKE '%Alan%'
 AND p.doi = w.doi
 AND a.r_number = w.r_number )
INTERSECT
( SELECT p.title FROM PAPER p, KEYWORD k, HAS h
 WHERE k.sub LIKE '%Computer%'
 AND p.doi = h.doi
 AND k.k_id = h.k_id );


-- TYPE 11 r_numbe가 400001인 저자가 작성한 논문들의 키워드들
SELECT DISTINCT k.sub FROM PAPER p, AUTHOR a, WRITE w, KEYWORD k, HAS h
WHERE p.doi = w.doi
AND a.r_number = w.r_number
AND p.doi = h.doi
AND k.k_id = h.k_id
AND a.r_number = 400001;


-- TYPE 12 doi가 111인 논문이 가진 키워드 출력
SELECT k.sub FROM KEYWORD k, PAPER p, HAS h
WHERE p.doi = 111
AND h.doi = p.doi
AND h.k_id = k.k_id;


-- TYPE 13 doi가 622인 논문의 인용횟수
SELECT COUNT(*) FROM REFERENCE r
WHERE r.ed_doi = 622;


-- TYPE 14 6번 포스트의 댓글
SELECT co.id, co.contents FROM COMMENTS co
WHERE co.p_no = 6;


-- TYPE 15 doi가 65인 논문의 분야
SELECT f.large, f.middle FROM FIELD f, JOURNAL j, PAPER p
WHERE p.doi = 65
AND p.j_number = j.j_number
AND j.ddc = f.ddc;


-- TYPE 16 150(Psychology) 분야의 (Journal에서 나온) 논문들이 가진 키워드들 갯수
SELECT k.sub, count(*) FROM JOURNAL j, PAPER p, HAS h, KEYWORD k
WHERE j.ddc = 150
AND p.j_number = j.j_number
AND h.doi = p.doi
AND k.k_id = h.k_id
GROUP BY (k.k_id, k.sub)
ORDER BY COUNT(k.k_id) desc;


-- TYPE 17 380(Commerce, communication & transportation) 분야의 (journal에서 나온) 논문들이 가진 키워드상위 5개
SELECT * FROM
(
SELECT k.sub, count(*) FROM JOURNAL j, PAPER p, HAS h, KEYWORD k
WHERE j.ddc = 380
AND p.j_number = j.j_number
AND h.doi = p.doi
AND k.k_id = h.k_id
GROUP BY (k.k_id, k.sub)
ORDER BY COUNT(k.k_id) desc
)
WHERE ROWNUM <= 5;


-- TYPE 18 'test2' 계정이 북마크한 키워드 리스트
SELECT k.sub FROM KEYWORD k, K_BOOKMARK kb
WHERE kb.id = 'test2'
AND k.k_id = kb.k_id;


-- TYPE 19 doi가 6인 논문의 발행년도
SELECT TO_CHAR(j.year, 'yyyy') AS YEAR FROM JOURNAL j, PAPER p
WHERE p.doi = 6
AND j.j_number = p.j_number;


-- TYPE 20 Accounting을 포함하는 저널 내 논문 검색
SELECT p.title FROM JOURNAL j, PAPER p
WHERE ( j.name LIKE '%Accounting%'
	OR j.publisher LIKE '%Accounting%' )
AND p.j_number = j.j_number;


-- TYPE 21 최신공지 확인 : 현재 날짜에서 어제랑 오늘 올라온 admin이 쓴 공지 title
SELECT po.title FROM POST po
WHERE po.id in (
	SELECT ac.id FROM ACCOUNT ac
	WHERE ac.kind = 'a' )
AND po.date_time >= TO_DATE(sysdate-1, 'yyyy-mm-dd');
