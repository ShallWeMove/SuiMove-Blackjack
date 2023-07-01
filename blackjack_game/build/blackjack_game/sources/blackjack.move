module blackjack_game::blackjack {
  use sui::object::{Self,ID, UID};
  use std::option::{Self, Option, none};
  use std::string::{Self, String};
  use sui::coin::{Self, Coin};
  use sui::pay;
  use sui::balance::Balance;
  use sui::sui::SUI;
  use sui::tx_context::{Self, TxContext};
  use sui::transfer;
  use std::vector;
  use sui::dynamic_object_field;
  use std::bcs;
  
  // game identity
  struct GameInfo has key {
    id: UID,
    admin: address
  }

  // GameTable is essential object to play blackjack
  // it wrap objects like below
  struct GameTable has key, store {
    id: UID,
    player_hand: Option<ID>,
    dealer_hand: ID,
    card_deck: ID,
    money_box: ID,
    is_playing: u64,
    game_id: ID,
  }

  // player and delear with Hand can hold some cards
  struct Hand has key, store {
    id: UID,
    account: address,
    cards: vector<Option<ID>>,
    is_my_turn: bool,
    game_id: ID,
  }

  // a set of cards, total_cards_number refers to the quantity of cards in a deck.
  struct CardDeck has key, store {
    id: UID,
    cards: vector<Option<ID>>,
    total_cards_number: u64,
    game_id: ID,
  }

  // When card is open, card number is number. 
  // In other hand, when card is flipped over, card number is some cryptogram
  struct Card has key, store {
    id: UID,
    card_number: vector<u8>,
    sequence_number: u64,
    is_open: bool,
    card_deck_id: ID,
  }
  // TODO : sui -> casino chips
  struct MoneyBox has key, store {
    id: UID,
    // stake: vector<Option<Coin<SUI>>>, 
    stake: vector<Option<ID>>, 
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
    let game_table_id = object::new(ctx);

    let dealer_hand = create_hand(game, ctx);
    let dealer_hand_id = object::uid_to_inner(&dealer_hand.id);
    dynamic_object_field::add(&mut game_table_id, b"dealer_hand", dealer_hand);

    let number_of_cards : u64 = 2;
    let card_deck = create_card_deck(game, number_of_cards, ctx); 
    let card_deck_id = object::uid_to_inner(&card_deck.id);
    dynamic_object_field::add(&mut game_table_id, b"card_deck", card_deck);

    let money_box = create_money_box(game, ctx);
    let money_box_id = object::uid_to_inner(&money_box.id);
    dynamic_object_field::add(&mut game_table_id, b"money_box", money_box);

    let game_table = GameTable {
        id: game_table_id,
        player_hand: option::none(),
        dealer_hand: dealer_hand_id,
        card_deck: card_deck_id,
        money_box: money_box_id,
        is_playing : 0,
        game_id: game_id,
      };

    // TODO : fill card deck
    fill_card_deck(&mut game_table, ctx);

    // TODO : suffle card deck
    // shuffle_card_deck(&mut game_table, ctx);

    
    // create game table and transfer to dealer(sender)
    transfer::transfer(
      game_table
      , sender);
  }

  fun create_hand(game: &GameInfo, ctx: &mut TxContext) :Hand {
    let sender = tx_context::sender(ctx);
    let game_id = object::id(game);
    
    Hand {
      id : object::new(ctx),
      account: sender,
      cards: vector[option::none()],
      is_my_turn: false,
      game_id: game_id,
    }
  }

  fun create_card_deck(game: &GameInfo, number_of_cards: u64, ctx: &mut TxContext) : CardDeck {
    let id = object::new(ctx);
    let game_id = object::id(game);

     CardDeck {
      id : id,
      cards : vector[option::none()] ,
      total_cards_number : number_of_cards,
      game_id : game_id,
     }
  }

  fun create_money_box(game: &GameInfo, ctx: &mut TxContext) : MoneyBox {
    MoneyBox {
      id : object::new(ctx),
      stake : vector[option::none()],
      game_id : object::id(game),
    }
  }

  fun fill_card_deck(game_table: &mut GameTable, ctx: &mut TxContext) {

    let card_deck = dynamic_object_field::borrow_mut<vector<u8>, CardDeck> (&mut game_table.id, b"card_deck");
 
    let i : u64 = 0;
    while (i < card_deck.total_cards_number) {
      // TODO : flip the card created and make is_opened false
      // insert encrypt_function(i) : vector<u8> {}
      let bytes_i = bcs::to_bytes(&i);
      // let bytes_i = bcs::to_bytes(&b"card_number");
      
      let card = create_card(bytes_i, i, object::uid_to_inner(&card_deck.id), ctx);
      let card_id = object::uid_to_inner(&card.id);
      dynamic_object_field::add(&mut card_deck.id, i, card);
      vector::push_back<Option<ID>>(&mut card_deck.cards, option::some(card_id));
      i = i + 1;
    }
  }

  fun create_card(card_number: vector<u8>, sequence_number: u64, card_deck_id: ID, ctx: &mut TxContext) : Card {
    Card {
      id : object::new(ctx),
      card_number : card_number,
      sequence_number : sequence_number,
      is_open : true,
      card_deck_id : card_deck_id,
    }
  }

  // TODO : encrypt card number with card number and timestamp
  // fun encrypt_card_number(card: Card, card_number_u64: u64, ctx: &mut TxContext) :Card {}

  // TODO : shuffle card deck
  // fun shuffle_card_dec(game_table: &mut GameTable, ctx: &mut TxContext) {}



  public entry fun change_card_number(card: &mut Card, card_number_want_to_change: vector<u8>, ctx: &mut TxContext) {
    card.card_number = card_number_want_to_change;
  }

  

  

  // player action from FE
  public entry fun create_player_hand(game: &GameInfo, ctx: &mut TxContext) {
    let sender = tx_context::sender(ctx);
    let game_id = object::id(game);

    transfer::transfer(
      Hand {
        id : object::new(ctx),
        account: sender,
        cards: vector[option::none()],
        is_my_turn: false,
        game_id: game_id,
      },
      sender
    );
  }

  // player action from FE
  // transfer player hand to game table and bet some money
  public entry fun ready_game(game: &GameInfo, game_table: &mut GameTable, player_hand: Hand, money: Coin<SUI>, ctx: &mut TxContext) {
    // check game id
    check_game_id(game, game_table.game_id);
    check_game_id(game, player_hand.game_id);

    // pass_hand(player_hand)
    pass_hand(game_table, player_hand, ctx);

    // TODO : split_money(player_money)
    // let money = pay::split(&mut coin, bet_amount, ctx);
    bet_player_money(game_table, money, ctx);
  }

  fun pass_hand(game_table: &mut GameTable, player_hand: Hand, ctx: &mut TxContext) {
    let player_hand_id = object::uid_to_inner(&player_hand.id);
    dynamic_object_field::add(&mut game_table.id, b"player_hand", player_hand);
    game_table.player_hand = option::some(player_hand_id);
  }

  fun bet_player_money(game_table: &mut GameTable, money: Coin<SUI>, ctx: &mut TxContext) {
    let money_box = dynamic_object_field::borrow_mut<vector<u8>,MoneyBox>(&mut game_table.id, b"money_box");
    let money_id = object::id(&money);
    vector::push_back<Option<ID>>(&mut money_box.stake, option::some(money_id));
    dynamic_object_field::add(&mut money_box.id, b"player_money", money);
  }

  fun check_game_id(game_info: &GameInfo, id: ID) {
    assert!(id(game_info) == id, 403); // TODO: error code
  }

  fun id(game_info: &GameInfo): ID {
    object::id(game_info)
  }

  // public entry fun cancel_ready_game() {}


  // dealer action from BE
  public entry fun start_game(game: &GameInfo, game_table: &mut GameTable, player_address: address,  ctx: &mut TxContext) {
    check_game_id(game, game_table.game_id);
    // check whether account address of player hand in the game table is equal to player address from parameter
    let player_hand = dynamic_object_field::borrow<vector<u8>, Hand>(&mut game_table.id, b"player_hand");
    check_address(player_hand.account, player_address);
    
    // from now game in progress
    game_table.is_playing = 1;
    // pass_money(dealer_money)

    // suffle_card(?)

    // open_card
    // pass_card_to(player)
    // open_card
    // pass_card_to(dealer)
    // open_card
    // pass_card_to(player)

    // pass_card_to(dealer)
    
  }

  fun check_address(a: address, b: address) {
    assert!(a == b, 403);
  }

  fun pass_card_to() {
  }
  
  // dealer action from BE
  public entry fun shuffle_cards(game_table: &mut GameTable, ctx: &mut TxContext) {

  }

  


// ------------------------------------------------------------------------------------------------------------

  

  fun change_sequence_number(sequence_number: u64, ctx: &mut TxContext) {

  }

  // fun encrypt_card_deck(card_deck: CardDeck, ctx: &mut TxContext) {

  // }

  fun encrypt_card_number() {
  }

  fun decrypt_card_number() {
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

  public entry fun end_game() {
    // remove player_hand
  }

  public entry fun get_card() {
     // transfer
  }
  

  // player action from FE
 
  public entry fun bet() {
    // transfer sui object to money box
  }

  
  public entry fun stop() {
     //next turn
  }

  fun next_turn() {
    
  }
  
}