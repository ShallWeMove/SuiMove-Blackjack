# 프론트엔드 명세

## 기본 정보
프론트엔드는 백엔드와 WebSocket 을 통해서 통신을 함. 데이터는 JSON 형태로 주고 받으며, 'flag' 에 어떤 상황인지 담아서 통신을 함.
페이지 구성은 총 2개이며, 지갑연결 전 Landing Page 와 연결 후인 Game Page 로 나뉨

## 각 페이지 및 컴포넌트 별 기능
### Landing Page

다현님 디자인에 맞춰서 static 한 정보들만 보여줄 예정
간단하게 게임에 대한 소개가 들어가면 좋음

### Navbar

로고와 지갑 연결 (로그인 기능) 버튼이 존재
지갑을 연결하면 바로 게임 페이지로 이듕하게끔 라우팅 해주는 간단한 동작
연결 후, 유저가 지갑에 가지고 있는 토큰의 개수를 보여줌

### Game Page

Game Page 는 실제 게임 플레이 페이지와 Betting Amount 를 입력하는 컴포넌트 두개로 나뉨 (Betting Amount, BlackJack)

- Betting Amount 컴포넌트
    - 유저가 원하는 배팅 금액을 입력하게 해주는 창
    - 인풋 필터링 (잔액에 맞는 금액을 설정했는지, 제대로 된 정수 값을 입력했는지 등을 체크 후 (프론트 내부 로직으로) 서버에 리퀘스트를 보냄 -> 서버에서 컨펌을 받으면 BlackJack 컴포넌트로 넘어감)

- BlackJack 컴포넌트
    - 백엔드 개발 로직에 맞춰서 진행 예정
# 개발 현황:
- Landing page:
    - 디자인 미완성
- Navigation Bar:
    - 기능까지 완성
- Game Page:
    - Betting Amount page:
        - 거의 완성 (input verfication API 로 해줄 지 말지만 결정하면 됨)
    - Actual Game page:
        - 아직 시작 못함 (백엔드 structure 는 창민님이 완성해주심)

# 논의가 필요한 부분:
    - 게임에서 사용될 이미지들에 대한 정보
    - 게임 BGM (?) 같은거 넣을지
    - Landing Page 디자인 어떻게 할지