# 백엔드 명세
## 기본 정보
백엔드는 프론트엔드와 WebSocket 을 통해서 통신을 함.
데이터는 JSON 형태로 주고 받으며, 'flag' 에 어떤 상황인지 담아서 통신을 함.

## flag 별 설명
프론트에서 받은 flag 를 기준으로 설명합니다.
### game start
start_game 이라는 Move Function 을 Call 하고, 종료되면, 프론트로 끝났다는 flag 를 전달해 주어야 함. flag 는 'game start done' 으로 함.
### shuffle
Card를 섞는 행위를 해야하며, 종료되면, 프론트로 끝났다는 flag를 전달해 주어야 함. flag는 'shuffle done' 으로 함.
백엔드에서 단순히 카드 숫자를 섞는 간단한 알고리즘을 만들어서 shuffle 을 진행한 후, moveCall 로 실제로 셔플된 카드로 만드는 것으로 함.
### card open
게임이 실행되는 첫번째 부분으로, player 1장, dealer 1장, player 1장, dealer 1장 카드를 받는 행위를 해야 함.
1장씩 카드를 받을때 마다 get_card 라는 Move Function 을 Call 하고, 종료되면, 프론트로 끝났다는 flag와 함께 뽑은 카드를 전달해 주어야 함. flag 는 'playerFirst done', 'dealerFirst done', 'playerSecond done', 'dealerSecond done' 으로 함.
### Go
player가 카드를 한 장 더 받아야 하므로, get_card 라는 Move Function 을 Call 하고, 종료되면, 프론트로 끝났다는 flag와 함께 뽑은 카드를 전달해 주어야 함. flag는 'Go done' 으로 함.
### Stop
player가 더이상 카드를 받지 않는다는 의미임. end_game 이라는 Move Function 을 Call 해야 함.
이부분은 태원님과 얘기를 해봐야 할 점이, 블랙잭에서 딜러는 17보다 숫자가 작으면 카드를 추가로 받아야 하며, 17이상이면 받지 않기에 dealer 가 카드를 받는 것도 프론트에서 구현을 해 줘야 함. 
그런데 그러려면 17점을 기준으로 딜러의 카드 점수가 적은지 많은지를 백엔드에서 판단을 해줘야할 것같다는 생각이 드는데, 딜러의 2번째 카드는 암호화 되어 있기 때문에 백엔드에서 어떤식으로 판단할 지 모르겠음.
아니면 end_game 이라는 Move Call 에서 이 행위를 다 해줄건지, 그렇다면 딜러가 카드를 받았다는 정보는 어떻게 전달을 할 것인지에 대해서 얘기를 해봐야 할 것같음.

결국 이부분은 아직 "게임을 끝내야 함" 이라는 목적을 가지고 있지만, 구현방법은 미정임.

# 현재 진행 상황
프론트와 socket 을 통해서 데이터를 주고받는 세팅은 끝난 상황이며, Move Call 을 하는 큰 틀의 함수도 작성이 완료된 상태임.
즉, Move Call이 완성 되어서 argument 와 같이 Move Call 을 하는데 필요한 값들이 정해지면, 함수 인자로 넘겨주면 되는 상태임.

# 향후 계획
Stop 부분을 태원님께 전달받아서 개블알 해야하고,
프론트로 보내주는 데이터의 형식을 어떻게 할지 정해서 프론트로 넘겨주는 코드를 작성해야 함.(Move 개발이 완료 되고, object 에 대한 정보과 완전해지면 쉽게 할 수 있을 듯)
