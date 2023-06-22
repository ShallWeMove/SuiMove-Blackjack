module blackjack_game::blackjack {
  use sui::object::{Self,ID, UID};
  use std::option::{Self, Option, none};
  use std::string::{Self, String};
  use sui::coin::{Self, Coin};
  use sui::balance::Balance;
  use sui::sui::SUI;
  use sui::tx_context::{Self, TxContext};
  use sui::transfer;
  use std::vector;

  
  // game identity
  struct GameInfo has key {
    id: UID,
    admin: address
  }

  // GameTable is essential object to play blackjack
  // it wrap objects like below
  struct GameTable has key, store {
    id: UID,
    player_hand: Option<Hand>,
    dealer_hand: Hand,
    card_deck: CardDeck,
    money_box: MoneyBox,
    is_playing: u64,
    game_id: ID,
  }

  // player and delear with Hand can hold some cards
  struct Hand has key, store {
    id: UID,
    account: address,
    cards: Option<vector<Card>>,
    game_id: ID,
  }

  // a set of cards, total_cards_number refers to the quantity of cards in a deck.
  struct CardDeck has key, store {
    id: UID,
    cards: vector<Option<Card>>,
    total_cards_number: u64,
    game_id: ID,
  }

  // When card is open, card number is number. 
  // In other hand, when card is flipped over, card number is some cryptogram
  struct Card has key, store {
    id: UID,
    // card_number: String,
    card_number: u64,
    sequence_number: u64,
    is_open: bool,
    card_deck_id: ID,
  }
  // TODO : sui -> casino chips
  struct MoneyBox has key, store {
    id: UID,
    stake: Option<vector<Coin<SUI>>>, 
    game_id: ID,
  }   

  // when package is published, init function will be executed
  fun init(ctx: &mut TxContext) {
    create_game(ctx);
  }

  // This function will be executed in the Backend
  // dealer or anyone who wanna be a dealer can create new game
  public entry fun new_game(ctx: &mut TxContext) {
    create_game(ctx);
  }

  // GameInfo object is essential to play game
  fun create_game(ctx: &mut TxContext) {
    let sender = tx_context::sender(ctx);
    let id = object::new(ctx);
    transfer::freeze_object(
      GameInfo {
      id,
      admin: sender,
    }
    );
  }

  // can create game table for blackjack game with game info object
  // create a card deck, a dealer hand and a money box
  // the objects created will be transfered to game table
  public entry fun create_game_table(game: &GameInfo, ctx: &mut TxContext) {
    let sender = tx_context::sender(ctx);
    let game_id = object::uid_to_inner(&game.id);

    let dealer_hand = create_hand(game, ctx);
    let card_deck = create_card_deck(game,1, ctx); 
    let money_box = create_money_box(game, ctx);
    
    // create game table and transfer to dealer(sender)
    transfer::transfer(
      GameTable {
        id: object::new(ctx),
        player_hand: option::none(),
        dealer_hand: dealer_hand,
        card_deck: card_deck,
        money_box: money_box,
        is_playing : 0,
        game_id: game_id,
      }
      , sender);
  }

  fun create_hand(game: &GameInfo, ctx: &mut TxContext) :Hand {
    let sender = tx_context::sender(ctx);
    let game_id = object::id(game);
    
    Hand {
      id : object::new(ctx),
      account: sender,
      cards: option::none(),
      game_id: game_id,
    }
  }

  fun create_card_deck(game: &GameInfo, number_of_cards: u64, ctx: &mut TxContext) : CardDeck {
    let id = object::new(ctx);
    let card_deck_id = object::uid_to_inner(&id);

    // create_cards
    // for number_of_cards { create_card(); encrypt_card(); }
    
    // let card = create_card(2, 1, card_deck_id, ctx);

    // let card_list = vector[card];

     CardDeck {
      id : id,
      cards : vector[option::none()] ,
      total_cards_number : number_of_cards,
      game_id : object::id(game),
     }
  }

  public entry fun fill_card_deck(game_table: GameTable, ctx: &mut TxContext) {
    let d = game_table.card_deck.total_cards_number;

    let i = 0;
    while (i < game_table.card_deck.total_cards_number) {
      let card = create_card(i, i, object::id(&game_table.card_deck), ctx);
      vector::push_back<Option<Card>>(&mut game_table.card_deck.cards, option::some(card));
      i = i + 1;
    };

    transfer::transfer(game_table, tx_context::sender(ctx));

  }

  fun create_card(card_number: u64, sequence_number: u64, card_deck_id: ID, ctx: &mut TxContext) : Card {
    // TODO : convert card_number to String
    // let str_card_number = card_number.to_string();

    Card {
      id : object::new(ctx),
      card_number : card_number,
      sequence_number : sequence_number,
      is_open : true,
      card_deck_id : card_deck_id,
    }
  }

  fun create_money_box(game: &GameInfo, ctx: &mut TxContext) : MoneyBox {
    MoneyBox {
      id : object::new(ctx),
      stake : option::none(),
      game_id : object::id(game),
    }
  }



// ------------------------------------------------------------------------------------------------------------

  public entry fun shuffle_cards(card_deck: &CardDeck, ctx: &mut TxContext) {

  }

  fun change_sequence_number(sequence_number: u64, ctx: &mut TxContext) {

  }

  // fun encrypt_card_deck(card_deck: CardDeck, ctx: &mut TxContext) {

  // }

  fun encrypt_card_number() {
  }

  fun decrypt_card_number() {
  }




  fun give_card_to() {
  }

 

  fun check_is_over_16() {
    // check that total of card number is over 16
  }

  fun check_is_over_21() {
    // check that total of card number is over 21
  }

  fun check_is_blackjack() {
    // check that total of card number is equal to 21
  }

  // check whether this is necessary
  // fun merge_sui_objects_in_moneybox() {}
  

  

  // dealer action from BE
  public entry fun start_game() {
  }
  
  public entry fun end_game() {
  }

  public entry fun get_card() {
     // bet()
     // next turn
  }
  

  // player action from FE
  public entry fun ready_game() {
    // transfer ready object to game table
    // transfer or share an object? (choose later)
    // bet some sui
  }

  public entry fun bet() {
    // transfer sui object to money box
  }

  
  public entry fun stop() {
     //next turn
  }

  fun next_turn() {
    
  }
  
}