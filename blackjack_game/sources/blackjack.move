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
  // winner = 0 : nobody, game is playing / 1 : player win / 2 : dealer win
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
    winner: u64,
    game_id: ID,
  }

  // player and delear with Hand can hold some cards
  struct Hand has key, store {
    id: UID,
    account: address,
    cards: vector<Option<ID>>,
    number_of_cards: u64,
    total_card_numbers: u64,
    is_my_turn: bool,
    game_id: ID,
  }

  // a set of cards, total_cards_number refers to the quantity of cards in a deck.
  struct CardDeck has key, store {
    id: UID,
    cards: vector<Option<ID>>,
    number_of_cards: u64,
    is_filled: bool,
    game_id: ID,
  }

  // When card is open, card number is number. 
  // In other hand, when card is flipped over, card number is some cryptogram
  struct Card has key, store {
    id: UID,
    card_number: u64,
    sequence_number: u64,
    is_open: bool,
    card_deck_id: ID,
  }
  // TODO : sui -> casino chips
  // place to store betting money
  struct MoneyBox has key, store {
    id: UID,
    // stake: vector<Option<Coin<SUI>>>, 
    stake: vector<Option<ID>>,
    game_id: ID,
  }   
  
  const GAME_NOT_READY : u64 = 0;
  const GAME_READY_STATE : u64 = 1;
  const GAME_IS_PLAYING : u64 = 2;
  const TOTAL_CARD_NUMBER_IN_CARD_DECK : u64 = 26;


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
        winner : 0,
        game_id: game_id,
      };
    fill_card_deck(&mut game_table, ctx);

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
      number_of_cards: 0,
      total_card_numbers: 0,
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
      number_of_cards : number_of_cards,
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
  fun fill_card_deck(game_table: &mut GameTable, ctx: &mut TxContext) {
    check_is_dealer(game_table, ctx);

    let card_deck = dynamic_object_field::borrow_mut<vector<u8>, CardDeck> (&mut game_table.id, b"card_deck");
    assert!(card_deck.is_filled == false, 403);
    let shuffle_card : vector<u64> = vector<u64>[17,1,24,16,21,2,19,3,25,10,4,20,14,7,23,5,13,18,11,22,6,26,8,15,12,9];

    let i : u64 = 0;
    while (i < card_deck.number_of_cards) {
      let card_number = vector::pop_back<u64>(&mut shuffle_card);
      let sequence_number = TOTAL_CARD_NUMBER_IN_CARD_DECK - i;
      let encrypted_number = encrypt_card_number(card_number);
      let card = create_card(encrypted_number, sequence_number, object::uid_to_inner(&card_deck.id), ctx);
      let card_id = object::uid_to_inner(&card.id);
      dynamic_object_field::add(&mut card_deck.id, sequence_number, card);
      vector::push_back<Option<ID>>(&mut card_deck.cards, option::some(card_id));
      i = i + 1;
    };

    card_deck.is_filled = true;
  }

  fun create_card(card_number: u64, sequence_number: u64, card_deck_id: ID, ctx: &mut TxContext) : Card {
    Card {
      id : object::new(ctx),
      card_number : card_number,
      sequence_number : sequence_number,
      is_open : false,
      card_deck_id : card_deck_id,
    }
  }

  // let x : u64, y : u64
  // y = 123 * x + 12345 
  // x = (y - 12345)/123
  fun encrypt_card_number(card_number: u64): u64 {
    let encrypted_number = 123 * card_number + 12345;
    encrypted_number
  }
  

  // player action from FE
  // transfer player hand to game table and bet some money
  public entry fun ready_game(game: &GameInfo, game_table: &mut GameTable, money: Coin<SUI>, ctx: &mut TxContext) {
    // check game id
    check_game_id(game, game_table.game_id);
    // check_game_id(game, player_hand.game_id);
    let player_hand = create_hand(game, ctx);

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
  // public entry fun start_game(game_table: &mut GameTable, money: Coin<SUI>, player_address: address,  ctx: &mut TxContext) {
  //   // check if game is ready
  //   assert!(game_table.is_playing == GAME_READY_STATE, 403);
  //   // check whether player address in the game table is equal to player address from parameter
  //   assert!(game_table.player_address == option::some(player_address), 403);
  //   // check whether dealer address in the game table is equal to executor
  //   assert!(game_table.dealer_address == tx_context::sender(ctx), 403);
  //   // pass dealer money to money box
  //   bet_dealer_money(game_table, money, ctx);
  //   // from now game in progress
  //   game_table.is_playing = GAME_IS_PLAYING;

  //   let card_deck = dynamic_object_field::remove<vector<u8>, CardDeck> (&mut game_table.id, b"card_deck");
  //   let player_hand = dynamic_object_field::remove<vector<u8>, Hand> (&mut game_table.id, b"player_hand");
  //   let dealer_hand = dynamic_object_field::remove<vector<u8>, Hand> (&mut game_table.id, b"dealer_hand");

  //   // pass_card_to(player, sequence_number=0)
  //   let sequence_number = TOTAL_CARD_NUMBER_IN_CARD_DECK - (card_deck.number_of_cards - 1);
  //   let hand_sequence_number = player_hand.number_of_cards;
  //   let player_card_1 : Card = dynamic_object_field::remove(&mut card_deck.id, sequence_number);
  //   vector::pop_back<Option<ID>> (&mut card_deck.cards);
  //   player_card_1.is_open = true;
  //   let decrypted_card_number = decrypt_card_number(player_card_1.card_number);
  //   player_card_1.card_number = decrypted_card_number;
  //   vector::push_back<Option<ID>>(&mut player_hand.cards, option::some(object::id(&player_card_1)));
  //   dynamic_object_field::add(&mut player_hand.id, hand_sequence_number, player_card_1);
  //   player_hand.number_of_cards = player_hand.number_of_cards + 1;
  //   card_deck.number_of_cards = card_deck.number_of_cards - 1;
  //   player_hand.total_card_numbers = player_hand.total_card_numbers + decrypted_card_number;

  //   // pass_card_to(dealer, sequence_number=1)
  //   let sequence_number = TOTAL_CARD_NUMBER_IN_CARD_DECK - (card_deck.number_of_cards - 1);
  //   let hand_sequence_number = dealer_hand.number_of_cards;
  //   let dealer_card_1 : Card = dynamic_object_field::remove(&mut card_deck.id, sequence_number);
  //   vector::pop_back<Option<ID>> (&mut card_deck.cards);
  //   dealer_card_1.is_open = true;
  //   let decrypted_card_number = decrypt_card_number(dealer_card_1.card_number);
  //   dealer_card_1.card_number = decrypted_card_number;
  //   vector::push_back<Option<ID>>(&mut dealer_hand.cards, option::some(object::id(&dealer_card_1)));
  //   dynamic_object_field::add(&mut dealer_hand.id, hand_sequence_number, dealer_card_1);
  //   dealer_hand.number_of_cards = dealer_hand.number_of_cards + 1;
  //   card_deck.number_of_cards = card_deck.number_of_cards - 1;
  //   dealer_hand.total_card_numbers = dealer_hand.total_card_numbers + decrypted_card_number; 

  //   // pass_card_to(player, sequence_number=2)
  //   let sequence_number = TOTAL_CARD_NUMBER_IN_CARD_DECK - (card_deck.number_of_cards - 1);
  //   let hand_sequence_number = player_hand.number_of_cards;
  //   let player_card_2 : Card = dynamic_object_field::remove(&mut card_deck.id, sequence_number);
  //   vector::pop_back<Option<ID>> (&mut card_deck.cards);
  //   player_card_2.is_open = true;
  //   let decrypted_card_number = decrypt_card_number(player_card_2.card_number);
  //   player_card_2.card_number = decrypted_card_number;
  //   vector::push_back<Option<ID>>(&mut player_hand.cards, option::some(object::id(&player_card_2)));
  //   dynamic_object_field::add(&mut player_hand.id, hand_sequence_number, player_card_2);
  //   player_hand.number_of_cards = player_hand.number_of_cards + 1;
  //   card_deck.number_of_cards = card_deck.number_of_cards - 1;
  //   player_hand.total_card_numbers = player_hand.total_card_numbers + decrypted_card_number;

  //   // pass_card_to(dealer, sequence_number=3)
  //   let sequence_number = TOTAL_CARD_NUMBER_IN_CARD_DECK - (card_deck.number_of_cards - 1);
  //   let hand_sequence_number = dealer_hand.number_of_cards;
  //   let dealer_card_2 : Card = dynamic_object_field::remove(&mut card_deck.id, sequence_number);
  //   vector::pop_back<Option<ID>> (&mut card_deck.cards);
  //   // let decrypted_card_number = decrypt_card_number(dealer_card_2.card_number);
  //   // dealer_card_2.card_number = decrypted_card_number;
  //   vector::push_back<Option<ID>>(&mut dealer_hand.cards, option::some(object::id(&dealer_card_2)));
  //   dynamic_object_field::add(&mut dealer_hand.id, hand_sequence_number, dealer_card_2);
  //   dealer_hand.number_of_cards = dealer_hand.number_of_cards + 1;
  //   card_deck.number_of_cards = card_deck.number_of_cards - 1;

  //   player_hand.is_my_turn = true;

  //   dynamic_object_field::add(&mut game_table.id, b"card_deck", card_deck);
  //   dynamic_object_field::add(&mut game_table.id, b"player_hand", player_hand);
  //   dynamic_object_field::add(&mut game_table.id, b"dealer_hand", dealer_hand);    
  // }

  // dealer action from BE 
  public entry fun start_game(game_table: &mut GameTable, money: Coin<SUI>, player_address: address,  ctx: &mut TxContext) {
    // check if game is ready
    assert!(game_table.is_playing == GAME_READY_STATE, 403);
    // check whether player address in the game table is equal to player address from parameter
    assert!(game_table.player_address == option::some(player_address), 403);
    // check whether dealer address in the game table is equal to executor
    assert!(game_table.dealer_address == tx_context::sender(ctx), 403);
    // pass dealer money to money box
    bet_dealer_money(game_table, money, ctx);
    // from now game in progress
    game_table.is_playing = GAME_IS_PLAYING;

    pass_card_to_player(game_table, player_address, ctx);
    pass_card_to_dealer(game_table, ctx);
    pass_card_to_player(game_table, player_address, ctx);

    let card_deck = dynamic_object_field::remove<vector<u8>, CardDeck> (&mut game_table.id, b"card_deck");
    let player_hand = dynamic_object_field::remove<vector<u8>, Hand> (&mut game_table.id, b"player_hand");
    let dealer_hand = dynamic_object_field::remove<vector<u8>, Hand> (&mut game_table.id, b"dealer_hand");

    // pass_card_to(dealer, sequence_number=3)
    let sequence_number = TOTAL_CARD_NUMBER_IN_CARD_DECK - (card_deck.number_of_cards - 1);
    let hand_sequence_number = dealer_hand.number_of_cards;
    let dealer_card_2 : Card = dynamic_object_field::remove(&mut card_deck.id, sequence_number);
    vector::pop_back<Option<ID>> (&mut card_deck.cards);
    // let decrypted_card_number = decrypt_card_number(dealer_card_2.card_number);
    // dealer_card_2.card_number = decrypted_card_number;
    vector::push_back<Option<ID>>(&mut dealer_hand.cards, option::some(object::id(&dealer_card_2)));
    dynamic_object_field::add(&mut dealer_hand.id, hand_sequence_number, dealer_card_2);
    dealer_hand.number_of_cards = dealer_hand.number_of_cards + 1;
    card_deck.number_of_cards = card_deck.number_of_cards - 1;

    player_hand.is_my_turn = true;

    dynamic_object_field::add(&mut game_table.id, b"card_deck", card_deck);
    dynamic_object_field::add(&mut game_table.id, b"player_hand", player_hand);
    dynamic_object_field::add(&mut game_table.id, b"dealer_hand", dealer_hand);    
  }

  fun bet_dealer_money(game_table: &mut GameTable, money: Coin<SUI>, ctx: &mut TxContext) {
    let money_box = dynamic_object_field::borrow_mut<vector<u8>,MoneyBox>(&mut game_table.id, b"money_box");
    let money_id = object::id(&money);
    vector::push_back<Option<ID>>(&mut money_box.stake, option::some(money_id));
    dynamic_object_field::add(&mut money_box.id, b"dealer_money", money);
  }

  fun decrypt_card_number(encrypted_number: u64): u64 {
    let decrypted_number = (encrypted_number - 12345) / 123;
    decrypted_number
  }

  // player_or_dealer = 1 : player / 2 : dealer
  // public entry fun go_card(game_table: &mut GameTable, player_address: address, player_or_dealer: u64, ctx: &mut TxContext) {
  //   assert!(game_table.is_playing == GAME_IS_PLAYING, 403);
  //   // check whether player address in the game table is equal to player address from parameter
  //   assert!(game_table.player_address == option::some(player_address), 403);
  //   // check whether dealer address in the game table is equal to executor
  //   assert!(game_table.dealer_address == tx_context::sender(ctx), 403);

  //   if (player_or_dealer == 1) {
  //     // pass_card_to_player(game_table, ctx);
  //   }else if (player_or_dealer == 2){
  //     pass_card_to_dealer (game_table, ctx);
  //   };
  // }

  public entry fun pass_card_to_player(game_table: &mut GameTable, player_address: address, ctx: &mut TxContext){
    assert!(game_table.is_playing == GAME_IS_PLAYING, 403);
    // check whether player address in the game table is equal to player address from parameter
    assert!(game_table.player_address == option::some(player_address), 403);
    // check whether dealer address in the game table is equal to executor
    assert!(game_table.dealer_address == tx_context::sender(ctx), 403);

    let card_deck = dynamic_object_field::remove<vector<u8>, CardDeck> (&mut game_table.id, b"card_deck");

    let player_hand = dynamic_object_field::remove<vector<u8>, Hand> (&mut game_table.id, b"player_hand");
    let sequence_number = TOTAL_CARD_NUMBER_IN_CARD_DECK - (card_deck.number_of_cards - 1);
    let hand_sequence_number = player_hand.number_of_cards;
    
    let player_card : Card = dynamic_object_field::remove(&mut card_deck.id, sequence_number);
    vector::pop_back<Option<ID>> (&mut card_deck.cards);
    player_card.is_open = true;
    let decrypted_card_number = decrypt_card_number(player_card.card_number);
    player_card.card_number = decrypted_card_number;
    vector::push_back<Option<ID>>(&mut player_hand.cards, option::some(object::id(&player_card)));
    dynamic_object_field::add(&mut player_hand.id, hand_sequence_number, player_card);
    
    player_hand.number_of_cards = player_hand.number_of_cards + 1;
    card_deck.number_of_cards = card_deck.number_of_cards - 1;
    player_hand.total_card_numbers = player_hand.total_card_numbers + decrypted_card_number;

    
    dynamic_object_field::add(&mut game_table.id, b"player_hand", player_hand);
    dynamic_object_field::add(&mut game_table.id, b"card_deck", card_deck);

  }

  fun pass_card_to_dealer(game_table: &mut GameTable, ctx: &mut TxContext){
    assert!(game_table.is_playing == GAME_IS_PLAYING, 403);
    // check whether dealer address in the game table is equal to executor
    assert!(game_table.dealer_address == tx_context::sender(ctx), 403);
    let card_deck = dynamic_object_field::remove<vector<u8>, CardDeck> (&mut game_table.id, b"card_deck");
    
    let dealer_hand = dynamic_object_field::remove<vector<u8>, Hand> (&mut game_table.id, b"dealer_hand");
    let sequence_number = TOTAL_CARD_NUMBER_IN_CARD_DECK - (card_deck.number_of_cards - 1);
    let hand_sequence_number = dealer_hand.number_of_cards;
    
    let dealer_card : Card = dynamic_object_field::remove(&mut card_deck.id, sequence_number);
    vector::pop_back<Option<ID>> (&mut card_deck.cards);
    dealer_card.is_open = true;
    let decrypted_card_number = decrypt_card_number(dealer_card.card_number);
    dealer_card.card_number = decrypted_card_number;
    vector::push_back<Option<ID>>(&mut dealer_hand.cards, option::some(object::id(&dealer_card)));
    dynamic_object_field::add(&mut dealer_hand.id, hand_sequence_number, dealer_card);
    
    dealer_hand.number_of_cards = dealer_hand.number_of_cards + 1;
    card_deck.number_of_cards = card_deck.number_of_cards - 1;
    dealer_hand.total_card_numbers = dealer_hand.total_card_numbers + decrypted_card_number;

    dynamic_object_field::add(&mut game_table.id, b"dealer_hand", dealer_hand);
    dynamic_object_field::add(&mut game_table.id, b"card_deck", card_deck);
  }

  public entry fun stop_card(game_table: &mut GameTable, ctx: &mut TxContext) {
    // calculate player total card numbers
    // decrypt dealer card 2
    // loop : dealer get more card still total card numbers of dealer become more than 17, 
    // check winner
    // end game : transfer used cards to usedCardDeck, coin to winner account, 
    // and transfer player hand to player account
    
  }

  fun check_win_or_lose() {

  }

  fun end_game() {

  }

  public fun keep<T>(c: Coin<T>, ctx: &TxContext) {
    transfer::public_transfer(c, tx_context::sender(ctx));
  }

  public entry fun split<T>( self: &mut Coin<T>, split_amount: u64, ctx: &mut TxContext ) {
    keep(coin::split(self, split_amount, ctx), ctx);
  }




  


// ------------------------------------------------------------------------------------------------------------

  

  fun change_sequence_number(sequence_number: u64, ctx: &mut TxContext) {

  }

  // fun encrypt_card_deck(card_deck: CardDeck, ctx: &mut TxContext) {

  // }






  

 

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

  // public entry fun end_game() {
  //   // remove player_hand
  // }

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

  // dealer action from BE
  // can execute this function only when game is ready
  // public entry fun shuffle_card_deck(game_table: &mut GameTable, sequence_number_array: vector<u8>, ctx: &mut TxContext) {
  //   check_is_dealer(game_table, ctx);
  //   let card_deck = dynamic_object_field::borrow_mut<vector<u8>, CardDeck> (&mut game_table.id, b"card_deck");
  //   assert!(card_deck.is_filled == true, 403);
  //   vector::reverse<u8>(&mut sequence_number_array);

  //   let i : u64 = 0;
  //   while (i < card_deck.total_cards_number) {
  //     // TODO : pop_back -> from back to front
  //     // consider this part
  //     let sequence_number = (vector::pop_back(&mut sequence_number_array) as u64);
  //     let card = dynamic_object_field::borrow_mut<u64, Card> (&mut card_deck.id, i);
  //     card.sequence_number = sequence_number;

  //     i = i + 1;
  //   }
 
  // }

  // dealer action from BE
  // public entry fun change_card_number(game_table: &mut GameTable, card: &mut Card, card_number_want_to_change: vector<u8>, ctx: &mut TxContext) {
  //   check_is_dealer(game_table, ctx);
  //   card.card_number = card_number_want_to_change;
  // }

  // player action from FE
  // public entry fun create_player_hand(game: &GameInfo, ctx: &mut TxContext) {
  //   let sender = tx_context::sender(ctx);
  //   let game_id = object::id(game);

  //   transfer::transfer(
  //     Hand {
  //       id : object::new(ctx),
  //       account: sender,
  //       cards: vector[option::none()],
  //       total_cards_number: 0,
  //       is_my_turn: false,
  //       game_id: game_id,
  //     },
  //     sender
  //   );
  // }
  
}