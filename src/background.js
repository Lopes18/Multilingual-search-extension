//When I click with the right button on the mouse, an option to search on jisho appears
chrome.contextMenus.create({
    title: "Search on Jisho",
    contexts: ["selection"],
    onclick: function(info, tab) {
        chrome.tabs.create({
            url: "https://jisho.org/search/" + encodeURIComponent(info.selectionText),
            active: true,
            index: tab.index + 1
        });
    },
});

class Dicionario {
    constructor(name, searchURL, basicURL, id, language_code2) {
        this.name = name;
        this.searchURL = searchURL;
        this.basicURL = basicURL;
        this.id = id;
        this.language_code2 = language_code2;
    }
    searchURL2 = '';
}

var Jisho = new Dicionario('Jisho',
    'https://jisho.org/search/','*://jisho.org/*', 0,'ja');
var Collins = new Dicionario('Collins',
    'https://www.collinsdictionary.com/dictionary/french-english/','*://www.collinsdictionary.com/*', 3,'fr');
var Pons = new Dicionario('Pons',
    'https://de.pons.com/%C3%BCbersetzung?q=','*://de.pons.com/*', 5,'de');
var Line = new Dicionario('Line',
    'https://dict.naver.com/linedict/zhendict/dict.html#/cnen/example?query=','*://dict.naver.com/*',6,'zh-CN');
var WeblioEJJE = new Dicionario('WeblioEJJE',
    'https://ejje.weblio.jp/content/','*://ejje.weblio.jp/*', 1,'ja');
var Goo = new Dicionario('Goo',
    'https://dictionary.goo.ne.jp/word/','*://dictionary.goo.ne.jp/*', 2,'ja');
var Kotobank = new Dicionario('Kotobank','https://kotobank.jp/word/','*://kotobank.jp/*',2,'ja');
var SpanishDict = new Dicionario('SpanishDict',
    'https://www.spanishdict.com/traductor/','*://www.spanishdict.com/*', 7,'es');
var CNRTL = new Dicionario('CNTRL', 'https://www.cnrtl.fr/definition/','*://www.cnrtl.fr/*',4,'fr');

Pons.searchURL2 = '&l=deen&in=&lf=de';
//Goo.searchURL2 = '/m0u/';
var Dicts = [Jisho, WeblioEJJE, Kotobank, Collins, CNRTL, Pons, Line, SpanishDict];

for (i=0;i<Dicts.length;i++) {
    a = Dicts
}

function responseCallBack(responseObject) {}

//this is the function that prompts the creation of a new tab with the word search
function searchOnDict(Dictionary, word) {
    var queryInfo = {
        url: Dictionary.basicURL
    };
    var pageProperties = {
        url: Dictionary.searchURL + word + Dictionary.searchURL2,
        active: true
        //removed encode uricomponent()
    };

    chrome.tabs.query(queryInfo, function(tabs) {
        console.log(tabs);
        //if there is an open tab on jisho already, we search on that tab instaed of creating a new one
        if (tabs.length >= 1) {
            chrome.tabs.update(tabs[0].id, pageProperties)
        } else if (tabs.length == 0) {
            //otherwise we create a new tab with the properties in pageProperties
            chrome.tabs.create(pageProperties);
        }
    });
}

// creates an array with the "history" of the tabs based on tab id
chrome.tabs.onActivated.addListener(function(activeInfo) {

    if (typeof window.tabHistory === 'undefined') {

        window.tabHistory = [activeInfo.tabId];
    } else {
        var currentTab = activeInfo.tabId;
        var holder = window.tabHistory;
        window.tabHistory = holder.concat(currentTab);
    }

});
//
//chrome.runtime.onStartup.addListener( function(){
//    var newID = 0 ;
//    console.log('im listening')
//    chrome.storage.local.set({dictID: newID})
//})

//this function will make it go back to the page you were before after clicking the command again
chrome.commands.onCommand.addListener( function(command) {

    chrome.storage.local.get(['dictID'], function(out) {
        ID = out.dictID;
        if (ID == undefined) {
            console.log('ID value was set to zero');
            ID = 0;
        }


        var Dictionary = Dicts[ID];


        if (command == 'Search_word') {
            var currentDictTab = {
                //url: Dictionary.searchURL + '',
                url: Dictionary.basicURL + '',
                active: true
            };
            // first checks if the current tab is jisho already
            chrome.tabs.query(currentDictTab, function(tabs) {

                if (tabs.length >= 1) {
                    // this removes the page if it's on Jisho; now we want to have it go back to
                    // the previous tab
                    var previousTabId = window.tabHistory[window.tabHistory.length - 2];
                    console.log('detected there is a page on line');
                    chrome.tabs.get(previousTabId, function(tab) {
                        console.log('went back to preivous page');
                        chrome.tabs.highlight({ 'tabs': tab.index }, function() {});
                    });
                }
            });
            //whether current tab is jisho or not, searches the word upon command ctrl x
            chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {

                chrome.tabs.sendMessage(tabs[0].id, 'search', function(response) {

                    if (response != undefined && response.length >= 1) {
                        searchOnDict(Dictionary, response);
                    }
                });
            });
        }
        //when the command crtl z is given, we want to change the variable Dictionary
        if (command == "Change_dictionary") {
            //here i can implement code to make some sort of pop up indicating the change in dictionary
            var newID = ((ID+1) % Dicts.length);
            chrome.storage.local.set({dictID: newID }, function(){
               console.log('value changed ' + newID);
            });
        }
        if (command == "Change_dictionary_backward") {
            var newID = (((ID-1) % Dicts.length) + Dicts.length)%Dicts.length;
            chrome.storage.local.set({dictID: newID }, function(){
               console.log('value changed ' + newID);
            });
        }
    });
});
//changes language dictionary automatically when the tab changes
/*chrome.tabs.onActivated.addListener(function(selectInfo) {
    chrome.tabs.detectLanguage(function(lang) {
        //languages japanese ja deutsch de francais fr spanish es chinese zh-CN
        chrome.storage.local.get(['dictID'], function(out) {
            var ID = out.dictID;

            if (Dicts[ID].language_code2 != lang) {

                for (i=0;i<Dicts.length;i++) {
                    if (Dicts[i].language_code2 == lang) {
                        var newID = Dicts[i].id;
                        chrome.storage.local.set({dictID: newID}, function(){});
                        break;
                    }
                }

            }
        }); }); }); */
