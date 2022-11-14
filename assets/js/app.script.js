var __clientId = getCookie('gapi_clientid');
var __apiKey = getCookie('gapi_apikey');
var __restApiUrl = "https://shapartha-android-zone.000webhostapp.com/accounts-tracker/api/";

var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"];
var SCOPES = 'https://www.googleapis.com/auth/gmail.readonly';

var allFilterMappings = [];
var __debitConditions = [];
var __creditConditions = [];

function handleClientLoad(filterMappings) {
    allFilterMappings = filterMappings;
    gapi.load('client:auth2', async function () {
        await gapi.client.init({
            apiKey: __apiKey,
            clientId: __clientId,
            discoveryDocs: DISCOVERY_DOCS,
            scope: SCOPES
        })
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
        var outputData = await updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        if (getSessionStorageData('gapi_gmail_data') == null) {
            setSessionStorageData('gapi_gmail_data', JSON.stringify(outputData));
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
    const filterArray = allFilterMappings.map((item) => {
        return {
            filterValue: item.filter,
            accId: item.acc_id,
            debitConditions: item.debit_conditions_json,
            creditConditions: item.credit_conditions_json
        };
    });
    var gmail_filters = filterArray;
    var apiResponse = [];
    const workAction = await new Promise(async (res, err) => {
        var cntr = 0;
        let _processedFilters = [];
        var _allProcessedMsgs = "";
        for (var x = 0; x < gmail_filters.length; x++) {
            let filter = gmail_filters[x];
            var _currFilterMapObj = allFilterMappings.filter(val => val.filter == filter.filterValue && val.acc_id == filter.accId)[0];
            var __function__ = _currFilterMapObj.filter_function;
            _allProcessedMsgs += "," + _currFilterMapObj.last_msg_id;
            cntr++;
            let _existFilter = _processedFilters.filter(_itm => _itm.filter == filter.filterValue);
            let response = null;
            if (_existFilter == null || _existFilter.length == 0) {
                try {
                    response = await gapi.client.gmail.users.messages.list({
                        'userId': 'me',
                        'maxResults': 20,
                        'labelIds': 'INBOX',
                        'q': filter.filterValue + ' after:' + convertDate(datePlusMinus(filter_date_interval), "yyyy-MM-dd")
                    });
                } catch (e) {
                    console.error(e);
                    continue;
                }
                _processedFilters.push({
                    filter: filter.filterValue,
                    resp: response
                });
            } else {
                response = _existFilter[0].resp;
            }
            var msgs = response.result.messages;
            var msgId = undefined;
            var apiInnerResponse = [];
            if (msgs && msgs.length > 0) {
                for (i = 0; i < msgs.length; i++) {
                    msgId = msgs[i].id;
                    if (_currFilterMapObj.last_msg_id != null && _currFilterMapObj.last_msg_id.indexOf(msgId) != -1 && _allProcessedMsgs.indexOf(msgId) != -1) {
                        continue;
                    }
                    const dataResp = await gapi.client.gmail.users.messages.get({
                        'userId': 'me',
                        'id': msgId,
                        'format': 'full'
                    });
                    var emailMsgText = dataResp.result.snippet;
                    let __processingResult__ = undefined;
                    __debitConditions = JSON.parse(filter.debitConditions);
                    __creditConditions = JSON.parse(filter.creditConditions);
                    if (__function__ == 'searchForIciciAmazonCC') {
                        __processingResult__ = searchForIciciAmazonCC(emailMsgText, msgId, filter.filterValue);
                    } else if (__function__ == 'searchForPayzapp') {
                        __processingResult__ = searchForPayzapp(emailMsgText, msgId, filter.filterValue, dataResp.result.internalDate);
                    } else if (__function__ == 'searchForTorrentPower') {
                        __processingResult__ = searchForTorrentPower(dataResp.result, msgId, filter.filterValue);
                    } else if (__function__ == 'searchForKotakTrans') {
                        __processingResult__ = searchForKotakTrans(dataResp.result, msgId, filter.filterValue);
                    } else if (__function__ == 'searchForHdfcTrans') {
                        __processingResult__ = searchForHdfcTrans(dataResp.result, msgId, filter.filterValue);
                    } else if (__function__ == 'searchForZeta') {
                        __processingResult__ = searchForZeta(dataResp.result, msgId, filter.filterValue);
                    }
                    if (__processingResult__ != undefined && __processingResult__ != null) {
                        apiInnerResponse.push(__processingResult__);
                        _allProcessedMsgs += "," + msgId;
                    }
                }
                var outerJsonObj = {
                    "filter": filter.filterValue,
                    "data": apiInnerResponse,
                    "accId": filter.accId,
                    "menuLevel": "TOP"
                }
                apiResponse.push(outerJsonObj);
            } else {
                console.info("No messages found for filter: " + filter.filterValue);
            }
            if (cntr == gmail_filters.length) {
                res();
            }
        };
    });
    return apiResponse;
}

function searchForKotakTrans(messageObj, msgId, filter) {
    json_object = {};

    var messageText = messageObj.payload.body;
    var messageBody = messageObj.payload;
    let c_counter = 0;
    while (messageText.size == 0 && c_counter < 10) {
        messageBody = messageBody.parts[0];
        messageText = messageBody.body;
        c_counter++;
    }
    try {
        messageText = atob(messageText.data.replace(/-/g, '+').replace(/_/g, '/'));
    } catch (e) {
        console.error(e);
        messageText = undefined;
    }

    var debitConditions = __debitConditions;
    if (messageText != undefined) {
        messageText = messageText.replace(/\r?\n|\r/g, " ");
        debitConditions.forEach(item => {
            if (item == debitConditions[0]) {
                var conditionIdx = messageText.indexOf(item);
                if (conditionIdx != -1) {
                    var amtIdx = messageText.indexOf(item) + item.length;
                    var amtValx = messageText.indexOf(" ", amtIdx);
                    var amtVal = messageText.substring(amtIdx, amtValx);
                    var dateIdx = messageText.substring(amtValx + " on ".length);
                    var dateVal = dateIdx.substring(0, dateIdx.indexOf(' '));
                    var transDateArr = dateVal.split("-");
                    var trans_date = [transDateArr[0], transDateArr[1], "20" + transDateArr[2]].join("-");
                    var trans_amt = amtVal;
                    var trans_type = "DEBIT";
                    var descIdx = messageText.substring(messageText.indexOf('Remarks:</b>') + 'Remarks:</b>'.length);
                    var descVal = descIdx.substring(0, descIdx.indexOf('<br>')).trim();
                    json_object = {
                        "trans_amt": trans_amt,
                        "trans_date": trans_date,
                        "trans_type": trans_type,
                        "trans_desc": descVal.replace("\\", ""),
                        "google_msg_id": msgId,
                        "google_filter": filter,
                        "menuLevel": "MAIN"
                    };
                }
            } else if (item == debitConditions[1]) {
                let s_messageText = messageText.replace(/(<([^>]+)>)/ig, '');
                var conditionIdx = s_messageText.indexOf(item);
                if (conditionIdx != -1) {
                    var amtIdx = s_messageText.indexOf(item);
                    var amtValx = s_messageText.indexOf("Rs. ");
                    var amtVal = s_messageText.substring(amtValx + "Rs. ".length, amtIdx);
                    var dateIdx = s_messageText.substring(amtIdx + item.length);
                    var dateVal = dateIdx.substring(0, dateIdx.indexOf(' '));
                    var transDateArr = dateVal.split("-");
                    var trans_date = new Date([transDateArr[0], transDateArr[1], "20" + transDateArr[2]].join("-"));
                    trans_date = convertDate(trans_date);
                    var trans_amt = amtVal.replace(',', '');
                    var trans_type = "DEBIT";
                    var descVal = "Payment Gateway Transaction";
                    json_object = {
                        "trans_amt": trans_amt,
                        "trans_date": trans_date,
                        "trans_type": trans_type,
                        "trans_desc": descVal.replace("\\", ""),
                        "google_msg_id": msgId,
                        "google_filter": filter,
                        "menuLevel": "MAIN"
                    };
                }
            }
        });
    }

    var creditConditions = __creditConditions;
    if (messageText != undefined) {
        messageText = messageText.replace(/\r?\n|\r/g, " ");
        creditConditions.forEach(item => {
            if (item == creditConditions[0]) {
                var conditionIdx = messageText.indexOf(item);
                if (conditionIdx != -1) {
                    var amtIdx = messageText.indexOf(item) + item.length;
                    var amtValx = messageText.indexOf(" ", amtIdx);
                    var amtVal = messageText.substring(amtIdx, amtValx);
                    var dateIdx = messageText.substring(amtValx + " on ".length);
                    var dateVal = dateIdx.substring(0, dateIdx.indexOf(' '));
                    var trans_date = new Date(dateVal);
                    trans_date = convertDate(trans_date);
                    var trans_amt = amtVal;
                    var trans_type = "CREDIT";
                    var descVal = "Payment Received";
                    json_object = {
                        "trans_amt": trans_amt,
                        "trans_date": trans_date,
                        "trans_type": trans_type,
                        "trans_desc": descVal.replace("\\", ""),
                        "google_msg_id": msgId,
                        "google_filter": filter,
                        "menuLevel": "MAIN"
                    };
                }
            } else if (item == creditConditions[1]) {
                let s_messageText = messageText.replace(/(<([^>]+)>)/ig, '');
                var conditionIdx = s_messageText.indexOf(item);
                if (conditionIdx != -1) {
                    var amtIdx = s_messageText.indexOf(item);
                    var amtValx = s_messageText.indexOf("Rs. ");
                    var amtVal = s_messageText.substring(amtValx + "Rs. ".length, amtIdx);
                    var dateIdx = s_messageText.substring(amtIdx + item.length);
                    var dateVal = dateIdx.substring(0, dateIdx.indexOf(' '));
                    var transDateArr = dateVal.split("-");
                    var trans_date = new Date([transDateArr[0], transDateArr[1], "20" + transDateArr[2]].join("-"));
                    trans_date = convertDate(trans_date);
                    var trans_amt = amtVal.replace(',', '');
                    var trans_type = "CREDIT";
                    var descVal = "Payment Received";
                    json_object = {
                        "trans_amt": trans_amt,
                        "trans_date": trans_date,
                        "trans_type": trans_type,
                        "trans_desc": descVal.replace("\\", ""),
                        "google_msg_id": msgId,
                        "google_filter": filter,
                        "menuLevel": "MAIN"
                    };
                }
            }
        });
    }
    if (!isEmpty(json_object)) {
        return json_object;
    }
}

function searchForHdfcTrans(messageObj, msgId, filter) {
    json_object = {};

    var messageText = messageObj.payload.body;
    var messageBody = messageObj.payload;
    let c_counter = 0;
    while (messageText.size == 0 && c_counter < 10) {
        messageBody = messageBody.parts[0];
        messageText = messageBody.body;
        c_counter++;
    }
    try {
        messageText = atob(messageText.data.replace(/-/g, '+').replace(/_/g, '/'));
    } catch (e) {
        console.error(e);
        messageText = undefined;
    }

    let msgProcessed = false;

    var debitConditions = __debitConditions;
    if (messageText != undefined) {
        messageText = messageText.replace(/\r?\n|\r/g, " ");
        messageText = messageText.replace(/(<([^>]+)>)/ig, '');
        let messageTextEndMatch = "Do not share your internet banking username/password or Credit/ Debit Card number/ CVV/ OTP via e-mail or over the phone. HDFC Bank will never ask for it";
        messageText = messageText.substring(0, messageText.indexOf(messageTextEndMatch));
        messageText = messageText.replaceAll('on account of', 'onaccountof');
        debitConditions.forEach(item => {
            if (messageText.indexOf(item) != -1) {
                msgProcessed = true;
                let amtIdx = -1;
                let lngt = 0;
                if (messageText.indexOf('Rs. ') != -1) {
                    amtIdx = messageText.indexOf('Rs. ');
                    lngt = 4;
                } else if (messageText.indexOf('Rs.') != -1) {
                    amtIdx = messageText.indexOf('Rs.');
                    lngt = 3;
                } else if (messageText.indexOf('Rs ') != -1) {
                    amtIdx = messageText.indexOf('Rs ');
                    lngt = 3;
                } else if (messageText.indexOf('Rs') != -1) {
                    amtIdx = messageText.indexOf('Rs');
                    lngt = 2;
                } else if (messageText.indexOf('INR ') != -1) {
                    amtIdx = messageText.indexOf('INR ');
                    lngt = 4;
                } else if (messageText.indexOf('INR') != -1) {
                    amtIdx = messageText.indexOf('INR');
                    lngt = 3;
                }
                var amt = messageText.substring(amtIdx + lngt, messageText.indexOf(' ', amtIdx + lngt));
                let dateIdx = messageText.indexOf(' on ') + 4;
                var __date = messageText.substring(dateIdx, messageText.indexOf('.', dateIdx));
                if (__date.length > 12) {
                    __date = __date.substring(0, __date.indexOf(' '));
                }
                let __dateSplit = __date.split("-");
                let __yearPart = __dateSplit[2];
                __yearPart = (__yearPart.length == 2) ? "20" + __yearPart : __yearPart;
                var dte = convertDate([__yearPart, __dateSplit[1], __dateSplit[0]].join('-'), 'yyyy-MM-dd');
                json_object = {
                    "trans_amt": amt.replaceAll(',', ''),
                    "trans_date": dte,
                    "trans_type": "DEBIT",
                    "trans_desc": "Enter transaction description",
                    "google_msg_id": msgId,
                    "google_filter": filter,
                    "menuLevel": "MAIN"
                };
            }
        });
    }
    if (msgProcessed != true) {
        var creditConditions = __creditConditions;
        if (messageText != undefined) {
            messageText = messageText.replace(/\r?\n|\r/g, " ");
            messageText = messageText.replace(/(<([^>]+)>)/ig, '');
            creditConditions.forEach(item => {
                if (messageText.indexOf(item) != -1) {
                    let amtIdx = -1;
                    let lngt = 0;
                    if (messageText.indexOf('Rs. ') != -1) {
                        amtIdx = messageText.indexOf('Rs. ');
                        lngt = 4;
                    } else if (messageText.indexOf('Rs.') != -1) {
                        amtIdx = messageText.indexOf('Rs.');
                        lngt = 3;
                    } else if (messageText.indexOf('Rs ') != -1) {
                        amtIdx = messageText.indexOf('Rs ');
                        lngt = 3;
                    } else if (messageText.indexOf('Rs') != -1) {
                        amtIdx = messageText.indexOf('Rs');
                        lngt = 2;
                    } else if (messageText.indexOf('INR ') != -1) {
                        amtIdx = messageText.indexOf('INR ');
                        lngt = 4;
                    } else if (messageText.indexOf('INR') != -1) {
                        amtIdx = messageText.indexOf('INR');
                        lngt = 3;
                    }
                    var amt = messageText.substring(amtIdx + lngt, messageText.indexOf(' ', amtIdx + lngt));
                    let dateIdx = messageText.indexOf(' on ') + 4;
                    var __date = messageText.substring(dateIdx, messageText.indexOf('.', dateIdx));
                    if (__date.length > 12) {
                        __date = __date.substring(0, __date.indexOf(' '));
                    }
                    let __dateSplit = __date.split("-");
                    let __yearPart = __dateSplit[2];
                    __yearPart = (__yearPart.length == 2) ? "20" + __yearPart : __yearPart;
                    var dte = convertDate([__yearPart, __dateSplit[1], __dateSplit[0]].join('-'), 'yyyy-MM-dd');
                    json_object = {
                        "trans_amt": amt.replaceAll(',', ''),
                        "trans_date": dte,
                        "trans_type": "CREDIT",
                        "trans_desc": "Enter transaction description",
                        "google_msg_id": msgId,
                        "google_filter": filter,
                        "menuLevel": "MAIN"
                    };
                }
            });
        }
    }
    if (!isEmpty(json_object)) {
        return json_object;
    }
}

function searchForTorrentPower(messageObj, msgId, filter) {
    json_object = {};

    var debitConditions = __debitConditions;
    var messageText = messageObj.payload.body;
    var messageBody = messageObj.payload;
    let c_counter = 0;
    while (messageText.size == 0 && c_counter < 10) {
        messageBody = messageBody.parts[0];
        messageText = messageBody.body;
        c_counter++;
    }
    try {
        messageText = atob(messageText.data);
    } catch (e) {
        console.error(e);
        messageText = undefined;
    }
    if (messageText != undefined) {
        messageText = messageText.replace(/\r?\n|\r/g, " ");
        debitConditions.forEach(item => {
            var conditionIdx = messageText.indexOf(item);
            if (conditionIdx != -1) {
                var dateIdx = messageText.indexOf("Bill Date");
                dateIdx = messageText.indexOf("-", dateIdx);
                var trans_date = messageText.substr(dateIdx - 2, 8);
                var transDateArr = trans_date.split("-");
                trans_date = [transDateArr[0], transDateArr[1], "20" + transDateArr[2]].join("-");
                var amtIdx = messageText.indexOf("Amount Upto Due Date");
                var amtValx = messageText.indexOf("  ", amtIdx + "Amount Upto Due Date".length + 3);
                var amtDueValx = messageText.indexOf("  ", amtValx);
                var amtVal = messageText.substring(amtDueValx, messageText.indexOf("  ", amtDueValx + 3)).trim();
                var trans_amt = amtVal;
                var trans_type = "DEBIT";
                var descIdx = messageText.indexOf("Bill Month");
                var descValx = messageText.indexOf("  ", descIdx + "Bill Month".length + 5);
                var descVal = messageText.substring(descIdx + "Bill Month".length, descValx).trim();
                var trans_desc = "Bill - " + descVal;
                json_object = {
                    "trans_amt": trans_amt,
                    "trans_date": trans_date,
                    "trans_type": trans_type,
                    "trans_desc": trans_desc.replace("\\", ""),
                    "google_msg_id": msgId,
                    "google_filter": filter,
                    "menuLevel": "MAIN"
                };
            }
        });
    }
    if (!isEmpty(json_object)) {
        return json_object;
    }
}

function searchForPayzapp(messageText, msgId, filter, rcvdDateInMilis) {
    let mailDate = convertDate(parseInt(rcvdDateInMilis));
    json_object = {};
    var creditConditions = __creditConditions;
    creditConditions.forEach(item => {
        var conditionIdx = messageText.indexOf(item);
        if (conditionIdx != -1) {
            conditionIdx += item.length;
            var amtSeparatorIdx = messageText.indexOf(". ", conditionIdx) - 2;
            var trans_amt = messageText.substr(conditionIdx, amtSeparatorIdx - conditionIdx + 2);
            var trans_type = "CREDIT";
            var trans_desc = "Cashback";
            json_object = {
                "trans_amt": trans_amt,
                "trans_date": mailDate,
                "trans_type": trans_type,
                "trans_desc": trans_desc.replace("\\", ""),
                "google_msg_id": msgId,
                "google_filter": filter,
                "menuLevel": "MAIN"
            };
        }
    });
    if (!isEmpty(json_object)) {
        return json_object;
    }
}

function searchForIciciAmazonCC(messageText, msgId, filter) {
    var debitConditions = __debitConditions;
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
                "trans_desc": trans_desc.replace("\\", ""),
                "google_msg_id": msgId,
                "google_filter": filter,
                "menuLevel": "MAIN"
            };
        }
    });
    if (!isEmpty(json_object)) {
        return json_object;
    }

    var creditConditions = __creditConditions;
    creditConditions.forEach(item => {
        var conditionIdx = messageText.indexOf(item);
        messageText = messageText.replace("merchant credit refund on ", "merchant credit refund in ");
        if (conditionIdx != -1) {
            conditionIdx += item.length;
            var amtSeparatorIdx = messageText.indexOf(" ", conditionIdx) - 1;
            var trans_amt = messageText.substr(conditionIdx, amtSeparatorIdx - conditionIdx + 1);
            if (isNaN(parseFloat(trans_amt))) {
                amtSeparatorIdx = messageText.indexOf('INR ') + 4;
                trans_amt = messageText.substring(amtSeparatorIdx, messageText.indexOf(' ', amtSeparatorIdx));
            }
            var trans_type = "CREDIT";
            var dateTimeIdx = messageText.indexOf(" on ") + 4;
            var trans_date = convertDate(messageText.substr(dateTimeIdx, nthIndexOf(messageText, " ", dateTimeIdx, 3) - dateTimeIdx).replace(".", ""));
            var trans_desc = "Refund / Payment";
            json_object = {
                "trans_amt": trans_amt,
                "trans_date": trans_date,
                "trans_type": trans_type,
                "trans_desc": trans_desc.replace("\\", ""),
                "google_msg_id": msgId,
                "google_filter": filter,
                "menuLevel": "MAIN"
            };
        }
    });
    if (!isEmpty(json_object)) {
        return json_object;
    }
}

function searchForZeta(messageText, msgId, filter) {
    console.log(messageText);
    console.log(msgId);
    //TODO
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

function getSessionStorageData(key) {
    return sessionStorage.getItem(key);
}

function setSessionStorageData(key, value) {
    return sessionStorage.setItem(key, value);
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