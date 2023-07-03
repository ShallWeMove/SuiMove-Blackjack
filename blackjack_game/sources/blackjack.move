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
  // is_playing = 0 : not ready / 2 : game ready / 10 : game is playing
  struct GameTable has key, store {
    id: UID,
    player_address: Option<address>,
    dealer_address: address,
    player_hand: Option<ID>,
    dealer_hand: ID,
    card_deck: ID,
    used_card_deck: ID,
    money_box: ID,
    is_playing: u64,
    game_id: ID,
  }

  // player and delear with Hand can hold some cards
  struct Hand has key, store {
    id: UID,
    account: address,
    cards: vector<Option<ID>>,
    total_cards_number: u64,
    is_my_turn: bool,
    game_id: ID,
  }

  // a set of cards, total_cards_number refers to the quantity of cards in a deck.
  struct CardDeck has key, store {
    id: UID,
    cards: vector<Option<ID>>,
    total_cards_number: u64,
    is_filled: bool,
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
  
  const GAME_NOT_READY : u64 = 0;
  const GAME_READY_STATE : u64 = 1;
  const GAME_IS_PLAYING : u64 = 2;
  const TOTAL_CARD_NUMBER_IN_CARD_DECK : u64 = 5;


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
    let dealer = tx_context::sender(ctx);
    let game_id = object::uid_to_inner(&game.id);
    let game_table_id = object::new(ctx);

    let dealer_hand = create_hand(game, ctx);
    let dealer_hand_id = object::uid_to_inner(&dealer_hand.id);
    dynamic_object_field::add(&mut game_table_id, b"dealer_hand", dealer_hand);

    let card_deck = create_card_deck(game, TOTAL_CARD_NUMBER_IN_CARD_DECK, ctx); 
    let card_deck_id = object::uid_to_inner(&card_deck.id);
    dynamic_object_field::add(&mut game_table_id, b"card_deck", card_deck);

    let used_card_deck = create_card_deck(game, 0, ctx); 
    let used_card_deck_id = object::uid_to_inner(&used_card_deck.id);
    dynamic_object_field::add(&mut game_table_id, b"used_card_deck", used_card_deck);

    let money_box = create_money_box(game, ctx);
    let money_box_id = object::uid_to_inner(&money_box.id);
    dynamic_object_field::add(&mut game_table_id, b"money_box", money_box);

    let game_table = GameTable {
        id: game_table_id,
        player_address: option::none(),
        dealer_address: dealer,
        player_hand: option::none(),
        dealer_hand: dealer_hand_id,
        card_deck: card_deck_id,
        used_card_deck: used_card_deck_id,
        money_box: money_box_id,
        is_playing : 0,
        game_id: game_id,
      };

    // create game table and transfer to dealer(sender)
    transfer::share_object(game_table);
  }

  fun create_hand(game: &GameInfo, ctx: &mut TxContext) :Hand {
    let sender = tx_context::sender(ctx);
    let game_id = object::id(game);
    
    Hand {
      id : object::new(ctx),
      account: sender,
      cards: vector[option::none()],
      total_cards_number: 0,
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
      is_filled : false,
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

  fun check_is_dealer(game_table: &mut GameTable, ctx: &mut TxContext) {
    let sender = tx_context::sender(ctx);
    assert!(game_table.dealer_address == sender, 403);

  }

  // TODO : vector<vector<u8>>? vector<u8> ? select one
  // dealer action from BE
  // when fill card deck cards must be encrypted
  public entry fun fill_card_deck(game_table: &mut GameTable, encrypted_number_array: vector<u8>, ctx: &mut TxContext) {
    check_is_dealer(game_table, ctx);

    let card_deck = dynamic_object_field::borrow_mut<vector<u8>, CardDeck> (&mut game_table.id, b"card_deck");
    assert!(card_deck.is_filled == false, 403);

    vector::reverse<u8>(&mut encrypted_number_array);
    let number_of_characters_of_encrypted_number = 5;

    let i : u64 = 0;
    while (i < card_deck.total_cards_number) {
      // For vector<u8>
      let j : u64 = 0;
      let encrypted_number = vector<u8>[];
      while (j < number_of_characters_of_encrypted_number) {
        let character = vector::pop_back<u8>(&mut encrypted_number_array);
        vector::push_back<u8>(&mut encrypted_number,character);
        j = j + 1;
      };

      let sequence_number = i;
      let card = create_card(encrypted_number, sequence_number, object::uid_to_inner(&card_deck.id), ctx);
      let card_id = object::uid_to_inner(&card.id);
      dynamic_object_field::add(&mut card_deck.id, i, card);
      vector::push_back<Option<ID>>(&mut card_deck.cards, option::some(card_id));
      i = i + 1;
    };

    card_deck.is_filled = true;
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

  // dealer action from BE
  // can execute this function only when game is ready
  public entry fun shuffle_card_deck(game_table: &mut GameTable, sequence_number_array: vector<u8>, ctx: &mut TxContext) {
    check_is_dealer(game_table, ctx);
    let card_deck = dynamic_object_field::borrow_mut<vector<u8>, CardDeck> (&mut game_table.id, b"card_deck");
    assert!(card_deck.is_filled == true, 403);
    vector::reverse<u8>(&mut sequence_number_array);

    let i : u64 = 0;
    while (i < card_deck.total_cards_number) {
      // TODO : pop_back -> from back to front
      // consider this part
      let sequence_number = (vector::pop_back(&mut sequence_number_array) as u64);
      let card = dynamic_object_field::borrow_mut<u64, Card> (&mut card_deck.id, i);
      card.sequence_number = sequence_number;

      i = i + 1;
    }
 
  }

  // dealer action from BE
  public entry fun change_card_number(game_table: &mut GameTable, card: &mut Card, card_number_want_to_change: vector<u8>, ctx: &mut TxContext) {
    check_is_dealer(game_table, ctx);
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
        total_cards_number: 0,
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

    // pass player hand to the game table
    pass_hand(game_table, player_hand, ctx);

    bet_player_money(game_table, money, ctx);

    game_table.is_playing = GAME_READY_STATE;
  }

  fun pass_hand(game_table: &mut GameTable, player_hand: Hand, ctx: &mut TxContext) {
    let sender = tx_context::sender(ctx);
    let player_hand_id = object::uid_to_inner(&player_hand.id);
    dynamic_object_field::add(&mut game_table.id, b"player_hand", player_hand);
    game_table.player_hand = option::some(player_hand_id);
    game_table.player_address = option::some(sender);
  }

  fun bet_player_money(game_table: &mut GameTable, money: Coin<SUI>, ctx: &mut TxContext) {
    let money_box = dynamic_object_field::borrow_mut<vector<u8>,MoneyBox>(&mut game_table.id, b"money_box");
    let money_id = object::id(&money);
    vector::push_back<Option<ID>>(&mut money_box.stake, option::some(money_id));
    dynamic_object_field::add(&mut money_box.id, b"player_money", money);
  }
  
  fun check_game_id(game: &GameInfo, id: ID) {
    assert!(id(game) == id, 403); // TODO: error code
  }

  fun id(game: &GameInfo): ID {
    object::id(game)
  }

  // public entry fun cancel_ready_game() {}


  // dealer action from BE
  public entry fun start_game(game_table: &mut GameTable, money: Coin<SUI>, player_address: address,  ctx: &mut TxContext) {
    // check if game is ready
    assert!(game_table.is_playing == GAME_READY_STATE, 403);
    // check whether player address in the game table is equal to player address from parameter
    assert!(game_table.player_address == option::some(player_address), 403);
    
    // from now game in progress
    game_table.is_playing = GAME_IS_PLAYING;

    // pass dealer money to money box
    bet_delear_money(game_table, money, ctx);


    // open_card
    // pass_card_to(player, sequence_number=1)

    // open_card
    // pass_card_to(dealer, sequence_number=2)
    // open_card
    // pass_card_to(player, sequence_number=3)

    // pass_card_to(dealer, sequence_number=4)
    
  }

  fun bet_delear_money(game_table: &mut GameTable, money: Coin<SUI>, ctx: &mut TxContext) {
    let money_box = dynamic_object_field::borrow_mut<vector<u8>,MoneyBox>(&mut game_table.id, b"money_box");
    let money_id = object::id(&money);
    vector::push_back<Option<ID>>(&mut money_box.stake, option::some(money_id));
    dynamic_object_field::add(&mut money_box.id, b"delear_money", money);
  }


  // fun pass_card_to(hand: Hand, card_deck: CardDeck, sequence_number: u64, ctx: &mut TxContext) {
  // }
  


  


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