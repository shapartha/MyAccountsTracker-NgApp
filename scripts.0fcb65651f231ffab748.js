var __clientId=getCookie("gapi_clientid"),__apiKey=getCookie("gapi_apikey"),__restApiUrl="https://shapartha-android-zone.000webhostapp.com/accounts-tracker/api/",DISCOVERY_DOCS=["https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"],SCOPES="https://www.googleapis.com/auth/gmail.readonly",allFilterMappings=[];function handleClientLoad(e){allFilterMappings=e,gapi.load("client:auth2",async function(){await gapi.client.init({apiKey:__apiKey,clientId:__clientId,discoveryDocs:DISCOVERY_DOCS,scope:SCOPES}),gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);var e=await updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());""==getCookie("gapi_gmail_data")&&setCookie("gapi_gmail_data",JSON.stringify(e),3e4)})}function checkSignInStatus(){let e=!1;try{e=gapi.auth2.getAuthInstance().isSignedIn.get()}catch(e){}return e}async function updateSigninStatus(e){return e?await fetchAndProcessMails():void 0}function handleAuthClick(){gapi.auth2.getAuthInstance().signIn()}function handleSignoutClick(){gapi.auth2.getAuthInstance().signOut()}async function fetchAndProcessMails(){var e=["from:credit_cards@icicibank.com"],t=[];await new Promise((n,a)=>{var r=0;e.forEach(async a=>{r++;var s=(await gapi.client.gmail.users.messages.list({userId:"me",maxResults:20,labelIds:"INBOX",q:a+" after:"+convertDate(datePlusMinus(-40),"yyyy-MM-dd")})).result.messages,o=void 0,c=[];if(!(s&&s.length>0))return{error:"No Messages found."};for(i=0;i<s.length;i++){if(o=s[i].id,-1!=allFilterMappings.filter(e=>e.filter==a)[0].last_msg_id.indexOf(o))continue;const e=await gapi.client.gmail.users.messages.get({userId:"me",id:o,format:"full"});var d=atob(e.result.payload.parts[0].body.data.replace(/-/g,"+").replace(/_/g,"/"));c.push(searchForIciciAmazonCC(d,o,a))}var g={filter:a,data:c};t.push(g),r==e.length&&n()})});return t}function searchForIciciAmazonCC(e,t,n){if(json_object={},["Your ICICI Bank Credit Card XX0005 has been used for a transaction of INR "].forEach(a=>{var i=e.indexOf(a);if(-1!=i){i+=a.length;var r=e.indexOf(" ",i)-1,s=e.substr(i,r-i+1),o=r+5,c=convertDate(e.substr(o,e.indexOf(".",o)-o).replace(";","")),d=e.indexOf("Info: ")+6,g=e.substr(d,e.indexOf(".",d)-d);json_object={trans_amt:s,trans_date:c,trans_type:"DEBIT",trans_desc:g,google_msg_id:t,google_filter:n}}}),!isEmpty(json_object))return json_object;return["refund on your ICICI Bank Credit Card XX0005 for INR ","Payment of INR "].forEach(a=>{var i=e.indexOf(a);if(e=e.replace("merchant credit refund on ","merchant credit refund in "),-1!=i){i+=a.length;var r=e.indexOf(" ",i)-1,s=e.substr(i,r-i+1),o=e.indexOf(" on ")+4,c=convertDate(e.substr(o,nthIndexOf(e," ",o,3)-o).replace(".",""));json_object={trans_amt:s,trans_date:c,trans_type:"CREDIT",trans_desc:"Refund / Payment",google_msg_id:t,google_filter:n}}}),isEmpty(json_object)?void 0:json_object}function getCookie(e){for(var t=e+"=",n=document.cookie.split(";"),a=0;a<n.length;a++){for(var i=n[a];" "==i.charAt(0);)i=i.substring(1,i.length);if(0==i.indexOf(t))return i.substring(t.length,i.length)}return""}function setCookie(e,t,n){var a="";if(n){var i=new Date;i.setTime(i.getTime()+n),a="; expires="+i.toUTCString()}document.cookie=e+"="+(t||"")+a+"; path=/"}function nthIndexOf(e,t,n,a){for(var i=1;i<=a;)n=e.indexOf(t,n)+3,i++;return n-3}function isEmpty(e){for(var t in e)if(Object.prototype.hasOwnProperty.call(e,t))return!1;return JSON.stringify(e)===JSON.stringify({})}function padLeadingZero(e){return e<10?"0"+e:e}function convertDate(e,t){var n=new Date;return null!=e&&(n=new Date(e)),null==t&&(t="dd-MM-yyyy HH:mi:ss"),"dd-MM-yyyy HH:mi:ss"==t?[this.padLeadingZero(n.getDate()),this.padLeadingZero(n.getMonth()+1),n.getFullYear()].join("-")+" "+[this.padLeadingZero(n.getHours()),this.padLeadingZero(n.getMinutes()),this.padLeadingZero(n.getSeconds())].join(":"):"yyyy-MM-dd"==t?[n.getFullYear(),this.padLeadingZero(n.getMonth()+1),this.padLeadingZero(n.getDate())].join("-"):e}function datePlusMinus(e){var t=new Date,n=e,a=t.setDate(t.getDate()+n);return new Date(a)}