/**
* @param context {WebtaskContext}
*/
const request = require('request');
module.exports = function (context, req, res) {
  if (req.method !== 'POST') {
    res.writeHead(400, { 'Access-Control-Allow-Origin': '*', "Content-Type": "application/json"});
    res.end('{"success": false}');
    return;
  }
  
  const body = [];
  req.on('data',  data => body.push(data));
  req.on('end', () => {
    const data = JSON.parse(body.join(''));
    request.post(
        'https://maker.ifttt.com/trigger/new_issue/with/key/' + context.secrets.iftttKey,
        { json: { value1: data.title, value2: data.body } },
        (error, response, body) => {
            res.writeHead(200, { 'Access-Control-Allow-Origin': '*', "Content-Type": "application/json"});
            if (!error && response.statusCode == 200) {
              res.end('{"success": true}');
            }
            else {
              res.end('{"success": false}');
            }
        }
    );
  });
};

