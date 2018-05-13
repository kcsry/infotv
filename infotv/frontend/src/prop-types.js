import { PropTypes } from "react";

export default {
    data: PropTypes.shape({
        decks: PropTypes.object,
        defaultDeck: PropTypes.array,
        eep: PropTypes.string
    }),
    deckName: PropTypes.string,
    slide: PropTypes.shape({
        src: PropTypes.string,
        config: PropTypes.string,
        id: PropTypes.string,
    }),
    tv: PropTypes.shape({
        forceUpdate: PropTypes.func.isRequired,
        viewSlideById: PropTypes.func.isRequired,
    }),
};
