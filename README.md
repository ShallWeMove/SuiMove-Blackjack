# SuiMove-Blackjack

# Architecture
<img width="1141" alt="Screenshot 2023-07-04 at 22 01 06" src="https://github.com/ShallWeMove/SuiMove-Blackjack/assets/62167347/dd62065a-29a9-41b3-ad70-8923d70e87cb">

## FE
## BE
## MOVE

# Objects
## GameTable 
// GameTable is essential object to play blackjack <br>
// it wrap objects like below <br>
// is_playing = 0 : not ready / 2 : game ready / 10 : game is playing<br>
## Hand
// player and delear with Hand can hold some cards<br>
## CardDeck
// a set of cards, total_cards_number refers to the quantity of cards in a deck.<br>
## Card
// When card is open, card number is number. <br>
// In other hand, when card is flipped over, card number is some cryptogram<br>
## MoneyBox
// place to store betting money<br>

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

