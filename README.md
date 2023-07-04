# SuiMove-Blackjack

# Objects
## GameTable 
## Hand
## CardDeck
## Card
## MoneyBox    

# Functions
## - new_game()
// dealer action from BE \n
// This function will be executed in the Backend \n
// dealer or anyone who wanna be a dealer can create new game \n
## - create_game_table()
// dealer action from BE \n
// can create game table for blackjack game with game info object \n
// create a card deck, a dealer hand and a money box \n
// the objects created will be transfered to game table \n
## - ready_game()
// player action from FE \n
// transfer player hand to game table and bet some money \n
## - start_game()
// dealer action from BE \n
// transfer cards to player and dealer hand to play game \n
## - go_card()
// dealer action from BE \n
// tansfer a card to player hand \n
## - stop_card()
// dealer action from BE \n
// finish game \n


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