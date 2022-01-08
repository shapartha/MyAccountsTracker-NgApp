var __clientId = getCookie('gapi_clientid');
var __apiKey = getCookie('gapi_apikey');

var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"];
var SCOPES = 'https://www.googleapis.com/auth/gmail.readonly';

function handleClientLoad() {
    gapi.load('client:auth2', async function () {
        await gapi.client.init({
            apiKey: __apiKey,
            clientId: __clientId,
            discoveryDocs: DISCOVERY_DOCS,
            scope: SCOPES
        })
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
        var outputData = await updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        if (getCookie('gapi_gmail_data') == "") {
            setCookie('gapi_gmail_data', JSON.stringify(outputData), 30000);
        }
    });
}

function checkSignInStatus() {
    let respVal = false;
    try {
        respVal = gapi.auth2.getAuthInstance().isSignedIn.get();
    } catch (e) { }
    return respVal;
}

async function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        var mailData = await fetchAndProcessMails();
        return mailData;
    } else {
        return undefined;
    }
}

function handleAuthClick() {
    gapi.auth2.getAuthInstance().signIn();
}

function handleSignoutClick() {
    gapi.auth2.getAuthInstance().signOut();
}

async function fetchAndProcessMails() {
    var filter_date_interval = -40;
    var gmail_filters = [
        "from:credit_cards@icicibank.com"
    ];
    var apiResponse = [];
    const workAction = await new Promise((res, err) => {
        var cntr = 0;
        gmail_filters.forEach(async filter => {
            cntr++;
            var response = await gapi.client.gmail.users.messages.list({
                'userId': 'me',
                'maxResults': 20,
                'labelIds': 'INBOX',
                'q': filter + ' after:' + convertDate(datePlusMinus(filter_date_interval), "yyyy-MM-dd")
            });
            var msgs = response.result.messages;
            var msgId = undefined;
            var apiInnerResponse = [];
            if (msgs && msgs.length > 0) {
                for (i = 0; i < msgs.length; i++) {
                    msgId = msgs[i].id;
                    //TODO: if msgId == lastProcessedId, then skip
                    const dataResp = await gapi.client.gmail.users.messages.get({
                        'userId': 'me',
                        'id': msgId,
                        'format': 'full'
                    });
                    var emailMsgText = atob(dataResp.result.payload.parts[0].body.data.replace(/-/g, '+').replace(/_/g, '/'));
                    apiInnerResponse.push(searchForIciciAmazonCC(emailMsgText, msgId));
                }
                var outerJsonObj = {
                    "filter": filter,
                    "data": apiInnerResponse
                }
                apiResponse.push(outerJsonObj);
            } else {
                return {
                    "error": 'No Messages found.'
                }
            }
            if (cntr == gmail_filters.length) {
                res();
            }
        });
    });
    return apiResponse;
}

function searchForIciciAmazonCC(messageText, msgId) {
    var debitConditions = [
        "Your ICICI Bank Credit Card XX0005 has been used for a transaction of INR "
    ];
    json_object = {};
    debitConditions.forEach(item => {
        var conditionIdx = messageText.indexOf(item);
        if (conditionIdx != -1) {
            conditionIdx += item.length;
            var amtSeparatorIdx = messageText.indexOf(" ", conditionIdx) - 1;
            var trans_amt = messageText.substr(conditionIdx, amtSeparatorIdx - conditionIdx + 1);
            var trans_type = "DEBIT";
            var dateTimeIdx = amtSeparatorIdx + 5;
            var trans_date = convertDate(messageText.substr(dateTimeIdx, messageText.indexOf(".", dateTimeIdx) - dateTimeIdx).replace(";", ""));
            var descIdx = messageText.indexOf("Info: ") + 6;
            var trans_desc = messageText.substr(descIdx, messageText.indexOf(".", descIdx) - descIdx);
            json_object = {
                "trans_amt": trans_amt,
                "trans_date": trans_date,
                "trans_type": trans_type,
                "trans_desc": trans_desc,
                "google_msg_id": msgId
            };
        }
    });
    if (!isEmpty(json_object)) {
        return json_object;
    }

    var creditConditions = [
        "refund on your ICICI Bank Credit Card XX0005 for INR ",
        "Payment of INR "
    ];
    creditConditions.forEach(item => {
        var conditionIdx = messageText.indexOf(item);
        messageText = messageText.replace("merchant credit refund on ", "merchant credit refund in ");
        if (conditionIdx != -1) {
            conditionIdx += item.length;
            var amtSeparatorIdx = messageText.indexOf(" ", conditionIdx) - 1;
            var trans_amt = messageText.substr(conditionIdx, amtSeparatorIdx - conditionIdx + 1);
            var trans_type = "CREDIT";
            var dateTimeIdx = messageText.indexOf(" on ") + 4;
            var trans_date = convertDate(messageText.substr(dateTimeIdx, nthIndexOf(messageText, " ", dateTimeIdx, 3) - dateTimeIdx).replace(".", ""));
            var trans_desc = "Refund / Payment";
            json_object = {
                "trans_amt": trans_amt,
                "trans_date": trans_date,
                "trans_type": trans_type,
                "trans_desc": trans_desc
            };
        }
    });
    if (!isEmpty(json_object)) {
        return json_object;
    }
}

function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return "";
}

function setCookie(name, value, milliseconds) {
    var expires = "";
    if (milliseconds) {
        var date = new Date();
        date.setTime(date.getTime() + milliseconds);
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function nthIndexOf(str, search_str, offset, n) {
    var cnt = 1;
    while (cnt <= n) {
        offset = str.indexOf(search_str, offset) + 3;
        cnt++;
    }
    return offset - 3;
}

function isEmpty(obj) {
    for (var prop in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, prop)) {
            return false;
        }
    }

    return JSON.stringify(obj) === JSON.stringify({});
}

function padLeadingZero(s) {
    return (s < 10) ? '0' + s : s;
}

function convertDate(_date, format) {
    var d = new Date();
    if (_date !== undefined && _date !== null) {
        d = new Date(_date);
    }
    if (format == undefined) {
        format = "dd-MM-yyyy HH:mi:ss";
    }
    if (format == "dd-MM-yyyy HH:mi:ss") {
        return [this.padLeadingZero(d.getDate()), this.padLeadingZero(d.getMonth() + 1), d.getFullYear()].join('-') + " " +
            [this.padLeadingZero(d.getHours()), this.padLeadingZero(d.getMinutes()), this.padLeadingZero(d.getSeconds())].join(':');
    } else if (format == "yyyy-MM-dd") {
        return [d.getFullYear(), this.padLeadingZero(d.getMonth() + 1), this.padLeadingZero(d.getDate())].join('-')
    } else {
        return _date;
    }
}

function datePlusMinus(dayCount) {
    var someDate = new Date();
    var numberOfDaysToAdd = dayCount;
    var result = someDate.setDate(someDate.getDate() + numberOfDaysToAdd);
    return new Date(result);
}