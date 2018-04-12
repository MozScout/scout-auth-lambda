/*  Required environment variables for this Lambda function:
 *  CONSUMER_KEY - The Pocket Consumer key obtained from your Pocket developer
 *  account.
 *  SCOUT_REDIR_URI - The URL from the second lambda function.  Can be 
 *  Obtained from the second API Gateway staging section.
 *  
 *  The runtime used for this Lambda is Node.js 6.10.
 */

'use strict';
const rp = require('request-promise');

exports.handler = (event, context, callback) => {
  console.log('Query:', event.query);
  
  const oathRequestOptions = {
    uri: 'https://getpocket.com/v3/oauth/request',
    method: 'POST',
    body: '',
    headers: {'Content-Type': 'application/json; charset=UTF-8',
              'X-Accept': 'application/json'}
  };
  
  var oauthBody = {
    'consumer_key': process.env.CONSUMER_KEY,
    'redirect_uri': encodeURIComponent(process.env.SCOUT_REDIR_URI)
  };
  oathRequestOptions.body = JSON.stringify(oauthBody);

  rp(oathRequestOptions)
  .then(function(body) {
    let jsonBody = JSON.parse(body);
    
    let redir_uri = process.env.SCOUT_REDIR_URI +
      '?state=' + event.query.state + '&code=' + jsonBody.code +
      '&redirect_uri=' + event.query.redirect_uri; 

    var redir = 'https://getpocket.com/auth/authorize?request_token=' +
      jsonBody.code + '&redirect_uri=' + encodeURIComponent(redir_uri);
    console.log('formulating redirect: ' + redir);
    
      // This line sends the redirect back via API GW->Alexa Skill
    context.succeed({location : redir});
  });
};