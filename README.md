# SuiMove-Blackjack

# Objects
## GameTable 
## Hand
## CardDeck
## Card
## MoneyBox    

# Functions
## - new_game()
// dealer action from BE
// This function will be executed in the Backend
// dealer or anyone who wanna be a dealer can create new game
## - create_game_table()
// dealer action from BE
// can create game table for blackjack game with game info object
// create a card deck, a dealer hand and a money box
// the objects created will be transfered to game table
## - ready_game()
// player action from FE
// transfer player hand to game table and bet some money
## - start_game()
// dealer action from BE
// transfer cards to player and dealer hand to play game
## - go_card()
// dealer action from BE
// tansfer a card to player hand
## - stop_card()
// dealer action from BE
// finish game


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