@RestResource(urlMapping='/login')
global with sharing class LoginController {
    @HttpPost
    global static String login() {
        // Parse JSON payload
        RestRequest req = RestContext.request;
        if (req.requestBody == null) {
            RestContext.response.statusCode = 400;
            return JSON.serialize(new Map<String, Object>{'error' => 'Missing request body'});
        }
        Map<String, Object> params = (Map<String, Object>)JSON.deserializeUntyped(req.requestBody.toString());
        String username = (String)params.get('username');
        String password = (String)params.get('password');
        String startUrl = (String)params.get('startUrl');
        if (username == null || password == null) {
            RestContext.response.statusCode = 400;
            return JSON.serialize(new Map<String, Object>{'error' => 'Username and password required'});
        }
        // Perform login using Site.login which returns a PageReference on success
        PageReference pr = Site.login(username, password, startUrl);
        if (pr == null) {
            // Login failed
            RestContext.response.statusCode = 401;
            return JSON.serialize(new Map<String, Object>{'error' => 'Invalid credentials'});
        }
        // Optionally set session cookie (Salesforce handles this automatically for REST)
        RestContext.response.statusCode = 200;
        return JSON.serialize(new Map<String, Object>{
            'success' => true,
            'redirectUrl' => pr.getUrl()
        });
    }
}
