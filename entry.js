'use strict';

const $ = require('expose?$!expose?jQuery!jquery');
const bretonConjugator = require('../lib/breton-conjugator');
const queryString = require('query-string');

$("body").append(require('html!./main.html'));

const $resultDiv = $('#conjugation-results');
const $typeDiv = $('#conjugation-type');
const $errorDiv = $('#conjugation-error');

const tenses = {
    present : "Present",
    imperfect : "Imperfect",
    preterite : "Preterite",
    future : "Future",
    presentConditional : "Present conditional",
    pastConditional : "Past conditional",
    imperative : "Imperative"
};

const persons = {
    p1s : "1S",
    p2s : "2S",
    p3s : "3S",
    p3sm : "3Sm",
    p3sf : "3Sf",
    p1p : "1P",
    p2p : "2P",
    p3p : "3P",
    imp : "0"
};

function clearError() {
    $errorDiv.empty();
    $errorDiv.hide();
}

function clearConjugation() {
    $resultDiv.empty();
    $typeDiv.empty();
}

function clear() {
    clearError();
    clearConjugation();
}

function displayConjugation(conjugation) {
    clearConjugation();

    $resultDiv.append($('<p/>').text('Conjugation of “' + conjugation.forms.infinitive + '”:'));

    var $list = $('<ul/>');

    $list.append($('<li/>').text('Infinitive: ' + conjugation.forms.infinitive));
    $list.append($('<li/>').text('Past participle: ' + conjugation.forms.pastParticiple));

    for (var tense in tenses) {
        var $entry = $('<li/>').text(tenses[tense]);

        var tenseObject = conjugation.forms[tense];
        if (tenseObject) {
            var $formList = $('<ul/>');

            for (var person in persons) {
                var conjugatedForm = tenseObject[person];
                if (conjugatedForm) {
                    $formList.append($('<li/>').text(persons[person] + ': ' + conjugatedForm));
                }
            }
        }

        $entry.append($formList);
        $list.append($entry);
    }

    $resultDiv.append($list);

    $typeDiv.append($('<p/>').text('Conjugation type:'));

    var $typeList = $('<ul/>');
    for (var i = 0; i < conjugation.type.length; i++) {
        var $entry = $('<li/>').text(conjugation.type[i]);
        $typeList.append($entry);
    }
    
    $typeDiv.append($typeList);
}

function conjugate(verb, pushState) {
    clearError();
    
    var conjugationResults = bretonConjugator.conjugate(verb);

    if (conjugationResults.error) {
        $errorDiv.html('<p>' + conjugationResults.error + '</p>');
        $errorDiv.show();
        return;
    }

    $('#verb-form').trigger('reset');
    displayConjugation(conjugationResults.result);

    if (pushState) {
        var verb = conjugationResults.result.forms.infinitive;
        var state = { verb: verb };
        history.pushState(state, verb, '?verb=' + verb);
    }
}

function init() {
    clear();

    window.onpopstate = function(event) {
        if (event.state && event.state.verb) {
            conjugate(event.state.verb, false);
        } else {
            clear();
        }
    };

    $('#verb-form').on('submit', function() {
        var submittedVerb = $('#verb-input').val();
        conjugate(submittedVerb, true);
        return false;
    });

    var query = queryString.parse(window.location.search);
    if (query && query.verb) {
        conjugate(query.verb, true);
    }
}

init();
