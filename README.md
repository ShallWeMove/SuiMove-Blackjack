# SuiMove-Blackjack

# Objects
## GameTable 
## Hand
## CardDeck
## Card
## MoneyBox    

# Functions
## - new_game()
// dealer action from BE <br>
// This function will be executed in the Backend <br>
// dealer or anyone who wanna be a dealer can create new game <br>
## - create_game_table()
// dealer action from BE <br>
// can create game table for blackjack game with game info object <br>
// create a card deck, a dealer hand and a money box <br>
// the objects created will be transfered to game table <br>
## - ready_game()
// player action from FE <br>
// transfer player hand to game table and bet some money <br>
## - start_game()
// dealer action from BE <br>
// transfer cards to player and dealer hand to play game <br>
## - go_card()
// dealer action from BE <br>
// tansfer a card to player hand <br>
## - stop_card()
// dealer action from BE <br>
// finish game <br>


# Dealer (Account, BE)
## GameTable 
- GameTable
    - PlayerHand
    - DealerHand
    - CardDeck
        - [Card...]
    - MoneyBox
        - [Coin<SUI>...]
## - new_game()
## - create_game_table()
# Player (Account, Client)
- PlayerHand
    - [Card...]

# Architecture
## FE
## BE
## MOVE