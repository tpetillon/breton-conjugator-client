'use strict';

const $ = require('expose?$!expose?jQuery!jquery');
const bretonConjugator = require('../lib/breton-conjugator');
const queryString = require('query-string');

$("body").append(require('html!./main.html'));
require("./stylesheet.css");

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
    $resultDiv.hide();
    
    $typeDiv.empty();
    $typeDiv.hide();
}

function clear() {
    clearError();
    clearConjugation();
}

function displayConjugation(conjugation) {
    clearConjugation();

    $resultDiv.append($('<p id="conjugation-title"/>').text('Conjugation of “' + conjugation.forms.infinitive + '”'));

    var $list = $('<ul id="tense-list"/>');

    $list.append($('<li/>').html(
        'Infinitive<table class="form-list"><tr><td>' + conjugation.forms.infinitive + '</td></tr></table>'));
    $list.append($('<li/>').html(
        'Past participle<table class="form-list"><tr><td>' + conjugation.forms.pastParticiple + '</td></tr></table>'));

    for (var tense in tenses) {
        var $entry = $('<li/>').text(tenses[tense]);

        var tenseObject = conjugation.forms[tense];
        if (tenseObject) {
            var $formList = $('<table class="form-list"/>');

            for (var person in persons) {
                var conjugatedForm = tenseObject[person];
                if (conjugatedForm) {
                    $formList.append($('<tr/>').html(
                        '<th>' + persons[person] + '</th>: ' +
                        '<td>' + conjugatedForm + '</td>'));
                }
            }
        }

        $entry.append($formList);
        $list.append($entry);
    }

    $resultDiv.append($list);
    
    $resultDiv.show();

    $typeDiv.append($('<p id="conjugation-type-title"/>').text('Conjugation type'));

    var $typeList = $('<ul id="conjugation-type-list"/>');
    for (var i = 0; i < conjugation.type.length; i++) {
        var $entry = $('<li/>').text(conjugation.type[i]);
        $typeList.append($entry);
    }
    
    $typeDiv.append($typeList);
    
    $typeDiv.show();
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
