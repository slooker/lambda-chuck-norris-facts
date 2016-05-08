var fetch = require('node-fetch');
/**
 * This is a sample example of a lambda function that requests data from an api
 * to demo for a talk at Node PDX.
 */

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        /**
         * Populate with your skill's application ID to * prevent someone
         * else from configuring a skill that sends requests to this function.
         * Keep in mind that your lambda function will use a different id Thank
         * AWS will when echo makes a request.
         */
        if (event.session.application.applicationId !== "amzn1.echo-sdk-ams.app.10549580-3661-4854-a3b4-49ac57e0d6f1" && // lambda
          event.session.application.applicationId !== "amzn1.echo-sdk-ams.app.0c65a62d-04be-4baa-8de5-c941e66909d9") { // Echo
             context.fail("Invalid Application ID");
        }

        // if (event.session.new) {
        //     onSessionStarted({requestId: event.request.requestId}, event.session);
        // }

        if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log("onIntent requestId=" + intentRequest.requestId +
        ", sessionId=" + session.sessionId);

    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;

    // Dispatch to your skill's intent handlers
    console.log(intentName);
    if ("chuck" === intentName) {
        getChuckNorrisFact(intent, session, callback);
    } else {
        throw "Invalid intent";
    }
}

function getChuckNorrisFact(intent, session, callback) {
    var repromptText = null;
    var sessionAttributes = {};
    var shouldEndSession = false;
    var speechOutput = "";

    var chuckUrl = 'http://api.icndb.com/jokes/random';
    console.log("Getting chuck url 8");

    fetch(chuckUrl)
      .then((response) => { return response.json(); })
      .then(body => {
        speechOutput = body.value.joke;
        shouldEndSession = true;

        // Setting repromptText to null signifies that we do not want to reprompt the user.
        // If the user does not respond or says something that is not understood, the session
        // will end.
        callback(sessionAttributes,
          buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
      });
}

// --------------- Helpers that build all of the responses -----------------------

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: "SessionSpeechlet - " + title,
            content: "SessionSpeechlet - " + output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}
