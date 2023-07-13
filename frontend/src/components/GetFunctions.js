
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

export default async function fetchGameTableObject(
    gametable_object_id, 
    setGameTableData, 
    setIsPlaying, 
    setCardDeckData, 
    setDealerHandData,
    setPlayerHandData,
    setConfirmed
    ) {

    const response = await getObject(gametable_object_id)
    console.log("game table",response);

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
            console.log("card deck", card_deck_response)
            setCardDeckData(card_deck_response.data.result.data.content.fields);
            const dealer_hand_response = await getObject(dealer_hand_id);
            console.log("dealer hand", dealer_hand_response)
            setDealerHandData(dealer_hand_response.data.result.data.content.fields);
            const player_hand_response = await getObject(player_hand_id);
            console.log("player hand", player_hand_response)
            setPlayerHandData(player_hand_response.data.result.data.content.fields);
        }
        setIsPlaying(is_playing);
        setConfirmed(true);
    } catch(err) {
        console.log("error for getting game table information");
        setConfirmed(false);
    }
}