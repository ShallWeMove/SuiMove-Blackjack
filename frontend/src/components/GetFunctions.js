
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

export async function getMultiObjects(object_id_array) {
    const response = await axios.post(config.TESTNET_ENDPOINT, {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "sui_multiGetObjects",
        "params": [
            object_id_array,
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
    // console.log("get multi objects: ",response);
    return response;
}

// game table id 전부 가져오기
export async function getAllGames() {
    const response = await getMultiObjects(config.GAME_TABLES);
    console.log("All Game Response: ", response);
    return response;
}


export async function pushCardsDataFrom(data) {
    let card_id_array = [];
    for (let i = 1; i < data.cards.length; i++) {
        if (data.cards[i] != null) {
            card_id_array.push(data.cards[i])
        }
    }
    const response = await getMultiObjects(card_id_array);
    let card_data_array = [];
    for (let i = 0; i < response.data.result.length; i++) {
        card_data_array.push(response.data.result[i].data.content.fields)
    }

    data.cards = card_data_array;
}

export async function fetchGameTableObject(
    gametable_object_id, 
    setGameTableData, 
    setIsPlaying, 
    setCardDeckData, 
    setDealerHandData,
    setPlayerHandData,
    setConfirmed,
    setLoading,
    setBettingAmount,
    ) {

    const response = await getObject(gametable_object_id);

    try {
        setGameTableData(response.data.result.data.content.fields);
        const is_playing = response.data.result.data.content.fields.is_playing;
        
        const READY=1;
        if (is_playing >= READY) {
            // console.log("This Game Table is ready or start ", is_playing);
            const card_deck_id = await response.data.result.data.content.fields.card_deck;
            const dealer_hand_id = await response.data.result.data.content.fields.dealer_hand;
            const player_hand_id = await response.data.result.data.content.fields.player_hand;

            // setCardDeckObjectId(card_deck);
            const card_deck_response = await getObject(card_deck_id);
            const dealer_hand_response = await getObject(dealer_hand_id);
            const player_hand_response = await getObject(player_hand_id);
            
            let card_deck = card_deck_response.data.result.data.content.fields
            let dealer_hand = dealer_hand_response.data.result.data.content.fields;
            let player_hand = player_hand_response.data.result.data.content.fields;
            
            // push card information to dealer, player hand from card object ids of dealer, player hand
            pushCardsDataFrom(dealer_hand)
            pushCardsDataFrom(player_hand)
            
            // set Card Deck, Dealer Hand, Player Hand
            setCardDeckData(card_deck);
            setDealerHandData(dealer_hand);
            setPlayerHandData(player_hand);
        }
        setIsPlaying(is_playing);
        setConfirmed(true);
        setLoading(false);
    } catch(err) {
        console.log("error for getting game table information");
        setConfirmed(false);
        setLoading(false);
    }
}

export async function fetchAllGameTables(
    setAllGameTables
) {
    const res = await getAllGames();
    console.log("fetchAllGameTables")
    
    try {
        setAllGameTables(res.data.result);
    }   catch(err) {
        console.log("error for getting all game tables");
    }
}
