
import axios from 'axios';
import config from "../config.json";

export async function getObject(object_id) {
    const response = await axios.post(config.TESTNET_ENDPOINT, {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "sui_getObject",
        "params": [
            object_id,
            {
                "showType": true,
                "showOwner": true,
                "showPreviousTransaction": false,
                "showDisplay": false,
                "showContent": true,
                "showBcs": false,
                "showStorageRebate": false
            },
        ]
    });
    // console.log(response);
    return response;
}

// game table id 전부 가져오기
export async function getAllGames() {
    const response = await axios.post(config.TESTNET_ENDPOINT, {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "sui_multiGetObjects",
        "params": [
         config.GAME_TABLES,
          {
            "showType": true,
            "showOwner": true,
            "showPreviousTransaction": true,
            "showDisplay": false,
            "showContent": true,
            "showBcs": false,
            "showStorageRebate": true
          }
        ]
      
    });
    console.log("All Game Response: ", response);
    return response;
}

export async function fetchGameTableObject(
    gametable_object_id, 
    setGameTableData, 
    setIsPlaying, 
    setCardDeckData, 
    setDealerHandData,
    setPlayerHandData,
    setConfirmed,
    ) {

    const response = await getObject(gametable_object_id);

    try {
        setGameTableData(response.data.result.data.content.fields);
        const is_playing = response.data.result.data.content.fields.is_playing;
        
        const READY=1;
        if (is_playing >= READY) {
            const card_deck_id = await response.data.result.data.content.fields.card_deck;
            const dealer_hand_id = await response.data.result.data.content.fields.dealer_hand;
            const player_hand_id = await response.data.result.data.content.fields.player_hand;

            // setCardDeckObjectId(card_deck);
            const card_deck_response = await getObject(card_deck_id);
            setCardDeckData(card_deck_response.data.result.data.content.fields);

            // set Dealer Hand
            const dealer_hand_response = await getObject(dealer_hand_id);
            let dealer_hand = dealer_hand_response.data.result.data.content.fields;
            let dealer_cards = [];
            for (let i = 1; i < dealer_hand.cards.length; i++) {
                const card = await getObject(dealer_hand.cards[i]);
                dealer_cards.push(card.data.result.data.content.fields);
            }
            dealer_hand.cards = dealer_cards;
            setDealerHandData(dealer_hand);
            console.log("Dealer Hand: ", dealer_hand);

            // set Player Hand
            const player_hand_response = await getObject(player_hand_id);
            let player_hand = player_hand_response.data.result.data.content.fields;
            let player_cards = [];
            for (let i = 1; i < player_hand.cards.length; i++) {
                const card = await getObject(player_hand.cards[i]);
                player_cards.push(card.data.result.data.content.fields);
            }
            player_hand.cards = player_cards;
            setPlayerHandData(player_hand);
        }
        setIsPlaying(is_playing);
        setConfirmed(true);
    } catch(err) {
        console.log("error for getting game table information");
        setConfirmed(false);
    }
}

export async function fetchAllGameTables(
    setAllGameTables
) {
    const res = await getAllGames();
    
    try {
        setAllGameTables(res.data.result);
    }   catch(err) {
        console.log("error for getting all game tables");
    }
}
