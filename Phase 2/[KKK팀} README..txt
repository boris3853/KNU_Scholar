[SQL 환경]
1) 개요
개발환경과 운영서버를 분리하기 위해 	MS Azure 클라우드 환경을 이용하였다.
Azure 서비스 중 Linux Virtual Machine 서비스를 구독하였고, 해당 VM의 사양은 B2s[2 vcpus, 4 GiB memory]이다.
Oracle 11g Express 버전은 최소 1GB 최대 4GB 제약 사항이 있기에 최대 성능을 내기 위해 4GB VM 서버를 개발환경으로 선택하였다.

2) VM 정책 및 구축 환경
- 개발을 위한 ssh 포트와 oracle 포트를 Inbound rule을 허용해주었고, 차후에 웹서버 구축하게 되면 웹 서버에 대한 포트도 설정할 예정이다.
- VM내 Oracle Database 11g Express Edition 배포 이미지를 사용하기 위해 Docker "gvenzl/oracle-xe" 이미지를 받아 
  컨테이너 환경으로 Database 서버를 운영중이고, 개발자들은 가상 머신의 Oracle 포트에서 Oracle 계정으로 접속한다.

3) 실행방법
- VM 구동 후,

컨테이너를 새로 올리는 경우
>> sudo docker run -dit --name oracle -e ORACLE_PASSWORD=[PASSWD] -p 1521:1521 gvenzl/oracle-xe

이전 컨테이너를 재기동하는 경우
>> sudo docker restart [컨테이너 명]

이전 컨테이너를 중지 후 삭제한는 경우
>> sudo docker stop [컨테이너 명]
>> sudo docker rm [컨테이너 명]

컨테이너 동작 유무 확인
>> sudo docker ps

보통의 경우, 컨테이너를 재기동 하여 Oracle DB 서비스를 지원해야하기 때문에
>> sudo docker restart [컨테이너 명]
를 실행시키면 1~2분 후 KKK팀 Oracle DB에 접속할 수 있다.
