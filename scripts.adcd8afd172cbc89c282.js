var __clientId=getCookie("gapi_clientid"),__apiKey=getCookie("gapi_apikey"),__restApiUrl="https://shapartha-android-zone.000webhostapp.com/accounts-tracker/api/",DISCOVERY_DOCS=["https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"],SCOPES="https://www.googleapis.com/auth/gmail.readonly",allFilterMappings=[],__debitConditions=[],__creditConditions=[];function handleClientLoad(e){allFilterMappings=e,gapi.load("client:auth2",async function(){await gapi.client.init({apiKey:__apiKey,clientId:__clientId,discoveryDocs:DISCOVERY_DOCS,scope:SCOPES}),gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);var e=await updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());""==getCookie("gapi_gmail_data")&&setCookie("gapi_gmail_data",JSON.stringify(e),3e4)})}function checkSignInStatus(){let e=!1;try{e=gapi.auth2.getAuthInstance().isSignedIn.get()}catch(e){}return e}async function updateSigninStatus(e){return e?await fetchAndProcessMails():void 0}function handleAuthClick(){gapi.auth2.getAuthInstance().signIn()}function handleSignoutClick(){gapi.auth2.getAuthInstance().signOut()}async function fetchAndProcessMails(){var e=allFilterMappings.map(e=>({filterValue:e.filter,accId:e.acc_id,debitConditions:e.debit_conditions_json,creditConditions:e.credit_conditions_json})),t=[];await new Promise(async(n,a)=>{var r=0;let s=[];for(var o=0;o<e.length;o++){let a=e[o];var l=allFilterMappings.filter(e=>e.filter==a.filterValue)[0],d=l.filter_function;r++;let p=s.filter(e=>e.filter==a.filterValue),h=null;null==p||0==p.length?(h=await gapi.client.gmail.users.messages.list({userId:"me",maxResults:20,labelIds:"INBOX",q:a.filterValue+" after:"+convertDate(datePlusMinus(-40),"yyyy-MM-dd")}),s.push({filter:a.filterValue,resp:h})):h=p[0].resp;var c=h.result.messages,g=void 0,f=[];if(c&&c.length>0){for(i=0;i<c.length;i++){if(g=c[i].id,null!=l.last_msg_id&&-1!=l.last_msg_id.indexOf(g))continue;const e=await gapi.client.gmail.users.messages.get({userId:"me",id:g,format:"full"});var u=e.result.snippet;let t;__debitConditions=JSON.parse(a.debitConditions),__creditConditions=JSON.parse(a.creditConditions),"searchForIciciAmazonCC"==d?t=searchForIciciAmazonCC(u,g,a.filterValue):"searchForPayzapp"==d?t=searchForPayzapp(u,g,a.filterValue,e.result.internalDate):"searchForTorrentPower"==d?t=searchForTorrentPower(e.result,g,a.filterValue):"searchForKotakTrans"==d?t=searchForKotakTrans(e.result,g,a.filterValue):"searchForHdfcTrans"==d&&(t=searchForHdfcTrans(e.result,g,a.filterValue)),null!=t&&null!=t&&f.push(t)}var _={filter:a.filterValue,data:f,accId:a.accId,menuLevel:"TOP"};t.push(_)}else console.info("No messages found for filter: "+a.filterValue);r==e.length&&n()}});return t}function searchForKotakTrans(e,t,n){json_object={};var i=e.payload.body,a=e.payload;let r=0;for(;0==i.size&&r<10;)a=a.parts[0],i=a.body,r++;try{i=atob(i.data.replace(/-/g,"+").replace(/_/g,"/"))}catch(e){console.error(e),i=void 0}var s=__debitConditions;null!=i&&(i=i.replace(/\r?\n|\r/g," "),s.forEach(e=>{if(e==s[0]){if(-1!=i.indexOf(e)){var a=i.indexOf(e)+e.length,r=i.indexOf(" ",a),o=i.substring(a,r),l=[(_=(u=i.substring(r+" on ".length)).substring(0,u.indexOf(" ")).split("-"))[0],_[1],"20"+_[2]].join("-"),d=o,c="DEBIT",g=i.substring(i.indexOf("Remarks:</b>")+"Remarks:</b>".length),f=g.substring(0,g.indexOf("<br>")).trim();json_object={trans_amt:d,trans_date:l,trans_type:c,trans_desc:f.replace("\\",""),google_msg_id:t,google_filter:n,menuLevel:"MAIN"}}}else if(e==s[1]){let s=i.replace(/(<([^>]+)>)/gi,"");if(-1!=s.indexOf(e)){a=s.indexOf(e),r=s.indexOf("Rs. "),o=s.substring(r+"Rs. ".length,a);var u,_=(u=s.substring(a+e.length)).substring(0,u.indexOf(" ")).split("-");l=convertDate(l=new Date([_[0],_[1],"20"+_[2]].join("-")));d=o.replace(",",""),c="DEBIT",f="Payment Gateway Transaction";json_object={trans_amt:d,trans_date:l,trans_type:c,trans_desc:f.replace("\\",""),google_msg_id:t,google_filter:n,menuLevel:"MAIN"}}}}));var o=__creditConditions;if(null!=i&&(i=i.replace(/\r?\n|\r/g," "),o.forEach(e=>{if(e==o[0]){if(-1!=i.indexOf(e)){var a=i.indexOf(e)+e.length,r=i.indexOf(" ",a),s=i.substring(a,r),l=(f=i.substring(r+" on ".length)).substring(0,f.indexOf(" "));u=convertDate(u=new Date(l));var d=s,c="CREDIT",g="Payment Received";json_object={trans_amt:d,trans_date:u,trans_type:c,trans_desc:g.replace("\\",""),google_msg_id:t,google_filter:n,menuLevel:"MAIN"}}}else if(e==o[1]){let o=i.replace(/(<([^>]+)>)/gi,"");if(-1!=o.indexOf(e)){a=o.indexOf(e),r=o.indexOf("Rs. "),s=o.substring(r+"Rs. ".length,a);var f,u,_=(l=(f=o.substring(a+e.length)).substring(0,f.indexOf(" "))).split("-");u=convertDate(u=new Date([_[0],_[1],"20"+_[2]].join("-")));d=s.replace(",",""),c="CREDIT",g="Payment Received";json_object={trans_amt:d,trans_date:u,trans_type:c,trans_desc:g.replace("\\",""),google_msg_id:t,google_filter:n,menuLevel:"MAIN"}}}})),!isEmpty(json_object))return json_object}function searchForHdfcTrans(e,t,n){json_object={};var i=e.payload.body,a=e.payload;let r=0;for(;0==i.size&&r<10;)a=a.parts[0],i=a.body,r++;try{i=atob(i.data.replace(/-/g,"+").replace(/_/g,"/"))}catch(e){console.error(e),i=void 0}let s=!1;var o=__debitConditions;if(null!=i){let e="Do not share your internet banking username/password or Credit/ Debit Card number/ CVV/ OTP via e-mail or over the phone. HDFC Bank will never ask for it";i=(i=(i=(i=i.replace(/\r?\n|\r/g," ")).replace(/(<([^>]+)>)/gi,"")).substring(0,i.indexOf(e))).replaceAll("on account of","onaccountof"),o.forEach(e=>{if(-1!=i.indexOf(e)){s=!0;let e=-1,l=0;-1!=i.indexOf("Rs. ")?(e=i.indexOf("Rs. "),l=4):-1!=i.indexOf("Rs.")?(e=i.indexOf("Rs."),l=3):-1!=i.indexOf("Rs ")?(e=i.indexOf("Rs "),l=3):-1!=i.indexOf("Rs")?(e=i.indexOf("Rs"),l=2):-1!=i.indexOf("INR ")?(e=i.indexOf("INR "),l=4):-1!=i.indexOf("INR")&&(e=i.indexOf("INR"),l=3);var a=i.substring(e+l,i.indexOf(" ",e+l));let d=i.indexOf(" on ")+4;var r=i.substring(d,i.indexOf(".",d));r.length>12&&(r=r.substring(0,r.indexOf(" ")));let c=r.split("-"),g=c[2];g=2==g.length?"20"+g:g;var o=convertDate([g,c[1],c[0]].join("-"),"yyyy-MM-dd");json_object={trans_amt:a.replaceAll(",",""),trans_date:o,trans_type:"DEBIT",trans_desc:"Enter transaction description",google_msg_id:t,google_filter:n,menuLevel:"MAIN"}}})}if(1!=s){var l=__creditConditions;null!=i&&(i=(i=i.replace(/\r?\n|\r/g," ")).replace(/(<([^>]+)>)/gi,""),l.forEach(e=>{if(-1!=i.indexOf(e)){let e=-1,o=0;-1!=i.indexOf("Rs. ")?(e=i.indexOf("Rs. "),o=4):-1!=i.indexOf("Rs.")?(e=i.indexOf("Rs."),o=3):-1!=i.indexOf("Rs ")?(e=i.indexOf("Rs "),o=3):-1!=i.indexOf("Rs")?(e=i.indexOf("Rs"),o=2):-1!=i.indexOf("INR ")?(e=i.indexOf("INR "),o=4):-1!=i.indexOf("INR")&&(e=i.indexOf("INR"),o=3);var a=i.substring(e+o,i.indexOf(" ",e+o));let l=i.indexOf(" on ")+4;var r=i.substring(l,i.indexOf(".",l));r.length>12&&(r=r.substring(0,r.indexOf(" ")));let d=r.split("-"),c=d[2];c=2==c.length?"20"+c:c;var s=convertDate([c,d[1],d[0]].join("-"),"yyyy-MM-dd");json_object={trans_amt:a.replaceAll(",",""),trans_date:s,trans_type:"CREDIT",trans_desc:"Enter transaction description",google_msg_id:t,google_filter:n,menuLevel:"MAIN"}}}))}if(!isEmpty(json_object))return json_object}function searchForTorrentPower(e,t,n){json_object={};var i=__debitConditions,a=e.payload.body,r=e.payload;let s=0;for(;0==a.size&&s<10;)r=r.parts[0],a=r.body,s++;try{a=atob(a.data)}catch(e){console.error(e),a=void 0}if(null!=a&&(a=a.replace(/\r?\n|\r/g," "),i.forEach(e=>{if(-1!=a.indexOf(e)){var i=a.indexOf("Bill Date");i=a.indexOf("-",i);var r=a.substr(i-2,8),s=r.split("-");r=[s[0],s[1],"20"+s[2]].join("-");var o=a.indexOf("Amount Upto Due Date"),l=a.indexOf("  ",o+"Amount Upto Due Date".length+3),d=a.indexOf("  ",l),c=a.substring(d,a.indexOf("  ",d+3)).trim(),g=a.indexOf("Bill Month"),f=a.indexOf("  ",g+"Bill Month".length+5),u=a.substring(g+"Bill Month".length,f).trim();json_object={trans_amt:c,trans_date:r,trans_type:"DEBIT",trans_desc:("Bill - "+u).replace("\\",""),google_msg_id:t,google_filter:n,menuLevel:"MAIN"}}})),!isEmpty(json_object))return json_object}function searchForPayzapp(e,t,n,i){let a=convertDate(parseInt(i));if(json_object={},__creditConditions.forEach(i=>{var r=e.indexOf(i);if(-1!=r){r+=i.length;var s=e.indexOf(". ",r)-2,o=e.substr(r,s-r+2);json_object={trans_amt:o,trans_date:a,trans_type:"CREDIT",trans_desc:"Cashback".replace("\\",""),google_msg_id:t,google_filter:n,menuLevel:"MAIN"}}}),!isEmpty(json_object))return json_object}function searchForIciciAmazonCC(e,t,n){return json_object={},__debitConditions.forEach(i=>{var a=e.indexOf(i);if(-1!=a){a+=i.length;var r=e.indexOf(" ",a)-1,s=e.substr(a,r-a+1),o=r+5,l=convertDate(e.substr(o,e.indexOf(".",o)-o).replace(";","")),d=e.indexOf("Info: ")+6,c=e.substr(d,e.indexOf(".",d)-d);json_object={trans_amt:s,trans_date:l,trans_type:"DEBIT",trans_desc:c.replace("\\",""),google_msg_id:t,google_filter:n,menuLevel:"MAIN"}}}),isEmpty(json_object)?(__creditConditions.forEach(i=>{var a=e.indexOf(i);if(e=e.replace("merchant credit refund on ","merchant credit refund in "),-1!=a){a+=i.length;var r=e.indexOf(" ",a)-1,s=e.substr(a,r-a+1),o=e.indexOf(" on ")+4,l=convertDate(e.substr(o,nthIndexOf(e," ",o,3)-o).replace(".",""));json_object={trans_amt:s,trans_date:l,trans_type:"CREDIT",trans_desc:"Refund / Payment".replace("\\",""),google_msg_id:t,google_filter:n,menuLevel:"MAIN"}}}),isEmpty(json_object)?void 0:json_object):json_object}function getCookie(e){for(var t=e+"=",n=document.cookie.split(";"),i=0;i<n.length;i++){for(var a=n[i];" "==a.charAt(0);)a=a.substring(1,a.length);if(0==a.indexOf(t))return a.substring(t.length,a.length)}return""}function setCookie(e,t,n){var i="";if(n){var a=new Date;a.setTime(a.getTime()+n),i="; expires="+a.toUTCString()}document.cookie=e+"="+(t||"")+i+"; path=/"}function nthIndexOf(e,t,n,i){for(var a=1;a<=i;)n=e.indexOf(t,n)+3,a++;return n-3}function isEmpty(e){for(var t in e)if(Object.prototype.hasOwnProperty.call(e,t))return!1;return JSON.stringify(e)===JSON.stringify({})}function padLeadingZero(e){return e<10?"0"+e:e}function convertDate(e,t){var n=new Date;return null!=e&&(n=new Date(e)),null==t&&(t="dd-MM-yyyy HH:mi:ss"),"dd-MM-yyyy HH:mi:ss"==t?[this.padLeadingZero(n.getDate()),this.padLeadingZero(n.getMonth()+1),n.getFullYear()].join("-")+" "+[this.padLeadingZero(n.getHours()),this.padLeadingZero(n.getMinutes()),this.padLeadingZero(n.getSeconds())].join(":"):"yyyy-MM-dd"==t?[n.getFullYear(),this.padLeadingZero(n.getMonth()+1),this.padLeadingZero(n.getDate())].join("-"):e}function datePlusMinus(e){var t=new Date,n=e,i=t.setDate(t.getDate()+n);return new Date(i)}