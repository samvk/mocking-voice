const { dialogflow, SimpleResponse } = require('actions-on-google');
const functions = require('firebase-functions');

const app = dialogflow({ debug: true });

const escapeXml = (str) => (
    str.replace(/[<>&'"]/g, (char) => ({
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        "'": '&apos;',
        '"': '&quot;',
    }[char]))
);

app.intent(['Default Fallback Intent', 'mock'], (conv, { phrase }) => {
    phrase = phrase || conv.query;

    const toggleCase = (() => {
        let makeUpperCase = false;
        // const isLetter = (char) => (/\p{L}/u).test(char);
        const isLetter = (char) => (/[a-zÀ-ÖØ-öø-ÿ]/i).test(char);

        return (char) => {
            if (isLetter(char)) {
                char = makeUpperCase ? char.toUpperCase() : char.toLowerCase();
                makeUpperCase = !makeUpperCase;
            }
            return char;
        };
    })();

    const textResponse = phrase.split('').map((char) => toggleCase(char)).join('');

    const speechResponse = `<speak>
    <par>
        <media end="phrase.end">
            <audio src="https://actions.google.com/sounds/v1/ambiences/barnyard_with_animals.ogg" />
        </media>
        <media xml:id="phrase">
            <prosody rate="fast">
                ${escapeXml(phrase).split(' ').map((word, i) => ((i % 2) === 0 ? (
        `<prosody pitch="+14%">${word}</prosody>`
    ) : (
        `<prosody pitch="-6%"><emphasis level="reduced">${word}</emphasis></prosody>`
    ))).join(' ')}
            </prosody>
        </media>
    </par>
</speak>`;

    conv.close(new SimpleResponse({
        speech: speechResponse,
        text: textResponse,
    }));
});

// Set the DialogflowApp object to handle the HTTPS POST request.
exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);
