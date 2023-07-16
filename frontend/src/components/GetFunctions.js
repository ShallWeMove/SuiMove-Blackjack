
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
    setWinner,
    setCardDeckData, 
    setDealerHandData,
    setPlayerHandData,
    setConfirmed,
    setLoading,
    ) {

    const response = await getObject(gametable_object_id);

    try {
        setGameTableData(gametable_response.data.result.data.content.fields);
        const is_playing = gametable_response.data.result.data.content.fields.is_playing;
        const winner = gametable_response.data.result.data.content.fields.winner;
        
        const READY=1;
        if (is_playing >= READY) {
            // console.log("This Game Table is ready or start ", is_playing);
            const card_deck_id = await response.data.result.data.content.fields.card_deck;
            const dealer_hand_id = await response.data.result.data.content.fields.dealer_hand;
            const player_hand_id = await response.data.result.data.content.fields.player_hand;

            const all_response = await getMultiObjects([card_deck_id, dealer_hand_id, player_hand_id])
            let card_deck = all_response.data.result[0].data.content.fields; 
            let dealer_hand = all_response.data.result[1].data.content.fields;
            let player_hand = all_response.data.result[2].data.content.fields;
            
            // push card information to dealer, player hand from card object ids of dealer, player hand
            pushCardsDataFrom(dealer_hand)
            pushCardsDataFrom(player_hand)
            
            // set Card Deck, Dealer Hand, Player Hand
            setCardDeckData(card_deck);
            setDealerHandData(dealer_hand);
            setPlayerHandData(player_hand);
        } else if (is_playing < READY) {
            setPlayerHandData({}); 
        }
        setIsPlaying(is_playing);
<<<<<<< HEAD
        setConfirmed(true);
=======
        setWinner(winner);
        setGameTableConfirmed(true);
>>>>>>> 371ef9e (refactor get balance from BetAmount.js to Game.js)
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
