module test::test {
  use sui::tx_context::{Self, TxContext};
  use sui::transfer;
  use sui::object::{Self,ID, UID};
  use std::option::{Self, Option, none};
  use sui::dynamic_object_field;
  use std::vector;
  use std::bcs;

  struct TestObject has key {
    id : UID,
  }

  struct GameInfo has key {
    id: UID,
    admin: address
  }

  struct GameTable has key, store {
    id: UID,
    card_deck: ID,
    used_card_deck: ID,
    is_playing: u64,
    game_id: ID,
  }

  struct CardDeck has key, store {
    id: UID,
    cards: vector<Option<ID>>,
    total_cards_number: u64,
    game_id: ID,
  }

  struct Card has key, store {
    id: UID,
    card_number: vector<u8>,
    sequence_number: u64,
    is_open: bool,
    card_deck_id: ID,
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

  public entry fun create_game_table(game: &GameInfo, ctx: &mut TxContext) {
    let sender = tx_context::sender(ctx);
    let game_id = object::uid_to_inner(&game.id);
    let game_table_id = object::new(ctx);

    let number_of_cards : u64 = 5;
    let card_deck = create_card_deck(game, number_of_cards, ctx); 
    let card_deck_id = object::uid_to_inner(&card_deck.id);
    dynamic_object_field::add(&mut game_table_id, b"card_deck", card_deck);

    let used_card_deck = create_card_deck(game, 0, ctx); 
    let used_card_deck_id = object::uid_to_inner(&used_card_deck.id);
    dynamic_object_field::add(&mut game_table_id, b"used_card_deck", used_card_deck);

    let game_table = GameTable {
      id: game_table_id,
      card_deck: card_deck_id,
      used_card_deck: used_card_deck_id,
      is_playing : 0,
      game_id: game_id,
    };

    fill_card_deck(&mut game_table, ctx);

    transfer::transfer(
      game_table
      , sender);

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

  fun create_card(card_number: vector<u8>, sequence_number: u64, card_deck_id: ID, ctx: &mut TxContext) : Card {
    Card {
      id : object::new(ctx),
      card_number : card_number,
      sequence_number : sequence_number,
      is_open : true,
      card_deck_id : card_deck_id,
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

  fun get_card_deck(game_table: &mut GameTable, ctx: &mut TxContext) : CardDeck {
    let card_deck = dynamic_object_field::remove<vector<u8>, CardDeck> (&mut game_table.id, b"card_deck");
    card_deck
  }

  public entry fun test_repeat_transfer(game_table: &mut GameTable, repeat: u64, ctx: &mut TxContext){
    let sender = tx_context::sender(ctx);

    let card_deck = get_card_deck(game_table, ctx);
    let used_card_deck = dynamic_object_field::borrow_mut<vector<u8>, CardDeck> (&mut game_table.id, b"used_card_deck");

    let i : u64 = 0;
    let j : u64 = 0;

    while (j < repeat) {
      while (i < card_deck.total_cards_number) {
        let card_from_original = dynamic_object_field::remove<u64, Card> (&mut card_deck.id, i);
        let card_id = object::uid_to_inner(&card_from_original.id);

        vector::push_back<Option<ID>>(&mut used_card_deck.cards, option::some(card_id));
        dynamic_object_field::add(&mut used_card_deck.id, i, card_from_original);

        let card_from_new = dynamic_object_field::remove<u64, Card> (&mut used_card_deck.id, i);
        dynamic_object_field::add(&mut card_deck.id, i, card_from_new);

        i = i + 1;
      };

      j = j + 1;
    };

    
    dynamic_object_field::add(&mut game_table.id, b"card_deck", card_deck);
    // transfer::transfer(card_deck, sender);
    // dynamic_object_field::add(&mut game_table.id, b"used_card_deck",&mut used_card_deck);

  }


  public entry fun transfer_to (test_obj: TestObject, recipient: address, ctx: &mut TxContext) {
    // let sender = tx_context::sender(ctx);

    transfer::transfer(test_obj, recipient);

  }

  public entry fun test_parameter(vector_u64: vector<u64>) {

  }
}