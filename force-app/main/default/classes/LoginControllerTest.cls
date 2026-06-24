@isTest
private class LoginControllerTest {
    
    @testSetup
    static void setupTestData() {
        UserRole ur = new UserRole(DeveloperName = 'TestRole', Name = 'Test Role');
        insert ur;
        
        User thisUser = [SELECT Id, UserRoleId FROM User WHERE Id = :UserInfo.getUserId()];
        thisUser.UserRoleId = ur.Id;
        update thisUser;
        
        System.runAs(thisUser) {
            Account acc = new Account(Name = 'Test REST Account');
            insert acc;
            
            Contact con = new Contact(
                LastName = 'RestContact', 
                AccountId = acc.Id, 
                Email = 'restuser@example.com'
            );
            insert con;
            
            Profile p = [SELECT Id FROM Profile WHERE Name = 'Customer Community User' OR Name = 'Customer Community Login User' OR Name = 'External Identity User' LIMIT 1];
            
            User u = new User(
                Alias = 'regut',
                Email = 'restuser@example.com',
                EmailEncodingKey = 'UTF-8',
                LastName = 'RestUser',
                LanguageLocaleKey = 'en_US',
                LocaleSidKey = 'en_US',
                ProfileId = p.Id,
                TimeZoneSidKey = 'America/Los_Angeles',
                UserName = 'restusercomm@example.com',
                ContactId = con.Id
            );
            insert u;
        }
    }
    
    @isTest
    static void testHandleGet_AuthenticatedUser() {
        User portalUser = [SELECT Id FROM User WHERE UserName = 'restusercomm@example.com' LIMIT 1];
        System.runAs(portalUser) {
            RestRequest req = new RestRequest();
            RestResponse res = new RestResponse();
            req.requestURI = '/services/apexrest/uibundle/login';
            req.httpMethod = 'GET';
            RestContext.request = req;
            RestContext.response = res;
            
            String jsonResult = LoginController.handleGet();
            System.assertEquals(200, RestContext.response.statusCode);
            Map<String,Object> result = (Map<String,Object>)JSON.deserializeUntyped(jsonResult);
            System.assertEquals(true, result.get('authenticated'));
        }
    }
    
    @isTest
    static void testHandlePost_MissingBody() {
        RestRequest req = new RestRequest();
        RestResponse res = new RestResponse();
        req.requestURI = '/services/apexrest/uibundle/login';
        req.httpMethod = 'POST';
        RestContext.request = req;
        RestContext.response = res;
        
        String jsonResult = LoginController.handlePost();
        System.assertEquals(400, RestContext.response.statusCode);
        Map<String,Object> result = (Map<String,Object>)JSON.deserializeUntyped(jsonResult);
        System.assertEquals('Missing request body', result.get('error'));
    }
    
    @isTest
    static void testHandlePost_InvalidJson() {
        RestRequest req = new RestRequest();
        RestResponse res = new RestResponse();
        req.requestURI = '/services/apexrest/uibundle/login';
        req.httpMethod = 'POST';
        req.requestBody = Blob.valueOf('invalid json');
        RestContext.request = req;
        RestContext.response = res;
        
        String jsonResult = LoginController.handlePost();
        System.assertEquals(400, RestContext.response.statusCode);
        Map<String,Object> result = (Map<String,Object>)JSON.deserializeUntyped(jsonResult);
        System.assertEquals('Invalid JSON body', result.get('error'));
    }
    
    @isTest
    static void testHandlePost_SendLoginCode_EmailRequired() {
        RestRequest req = new RestRequest();
        RestResponse res = new RestResponse();
        req.requestURI = '/services/apexrest/uibundle/login';
        req.httpMethod = 'POST';
        req.requestBody = Blob.valueOf('{}');
        RestContext.request = req;
        RestContext.response = res;
        
        String jsonResult = LoginController.handlePost();
        System.assertEquals(400, RestContext.response.statusCode);
        Map<String,Object> result = (Map<String,Object>)JSON.deserializeUntyped(jsonResult);
        System.assertEquals('Email is required', result.get('error'));
    }
    
    @isTest
    static void testHandlePost_SendLoginCode_UserNotFound() {
        RestRequest req = new RestRequest();
        RestResponse res = new RestResponse();
        req.requestURI = '/services/apexrest/uibundle/login';
        req.httpMethod = 'POST';
        req.requestBody = Blob.valueOf('{"email":"nonexistent@example.com"}');
        RestContext.request = req;
        RestContext.response = res;
        
        String jsonResult = LoginController.handlePost();
        System.assertEquals(404, RestContext.response.statusCode);
        Map<String,Object> result = (Map<String,Object>)JSON.deserializeUntyped(jsonResult);
        System.assertEquals('User not found with this email', result.get('error'));
    }
    
    @isTest
    static void testHandlePost_SendLoginCode_SuccessFallback() {
        RestRequest req = new RestRequest();
        RestResponse res = new RestResponse();
        req.requestURI = '/services/apexrest/uibundle/login';
        req.httpMethod = 'POST';
        req.requestBody = Blob.valueOf('{"email":"restuser@example.com", "startUrl":"/home"}');
        RestContext.request = req;
        RestContext.response = res;
        
        String jsonResult = LoginController.handlePost();
        System.assertEquals(200, RestContext.response.statusCode);
        Map<String,Object> result = (Map<String,Object>)JSON.deserializeUntyped(jsonResult);
        String identifier = (String)result.get('identifier');
        System.assert(identifier.startsWith('MOCK-'));
        System.assertEquals('/home', result.get('startUrl'));
    }
    
    @isTest
    static void testHandlePost_VerifyLoginCode_MissingParams() {
        RestRequest req = new RestRequest();
        RestResponse res = new RestResponse();
        req.requestURI = '/services/apexrest/uibundle/login';
        req.httpMethod = 'POST';
        req.requestBody = Blob.valueOf('{"email":"restuser@example.com", "identifier":"MOCK-123"}');
        RestContext.request = req;
        RestContext.response = res;
        
        String jsonResult = LoginController.handlePost();
        System.assertEquals(400, RestContext.response.statusCode);
        Map<String,Object> result = (Map<String,Object>)JSON.deserializeUntyped(jsonResult);
        System.assertEquals('email, identifier and code are required', result.get('error'));
    }
    
    @isTest
    static void testHandlePost_VerifyLoginCode_MockSuccess() {
        RestRequest req = new RestRequest();
        RestResponse res = new RestResponse();
        req.requestURI = '/services/apexrest/uibundle/login';
        req.httpMethod = 'POST';
        req.requestBody = Blob.valueOf('{"email":"restuser@example.com", "startUrl":"/home"}');
        RestContext.request = req;
        RestContext.response = res;
        String initResult = LoginController.handlePost();
        Map<String,Object> initMap = (Map<String,Object>)JSON.deserializeUntyped(initResult);
        String identifier = (String)initMap.get('identifier');
        
        RestRequest reqVerify = new RestRequest();
        RestResponse resVerify = new RestResponse();
        reqVerify.requestURI = '/services/apexrest/uibundle/login';
        reqVerify.httpMethod = 'POST';
        reqVerify.requestBody = Blob.valueOf('{"email":"restuser@example.com", "identifier":"' + identifier + '", "code":"123456", "startUrl":"/home"}');
        RestContext.request = reqVerify;
        RestContext.response = resVerify;
        
        String verifyResult = LoginController.handlePost();
        System.assertEquals(200, RestContext.response.statusCode);
        Map<String,Object> verifyMap = (Map<String,Object>)JSON.deserializeUntyped(verifyResult);
        System.assertEquals(true, verifyMap.get('success'));
        System.assertEquals('/home', verifyMap.get('redirectUrl'));
    }
    
    @isTest
    static void testHandlePost_VerifyLoginCode_MockFailure() {
        RestRequest reqVerify = new RestRequest();
        RestResponse resVerify = new RestResponse();
        reqVerify.requestURI = '/services/apexrest/uibundle/login';
        reqVerify.httpMethod = 'POST';
        reqVerify.requestBody = Blob.valueOf('{"email":"restuser@example.com", "identifier":"MOCK-123", "code":"wrong", "startUrl":"/home"}');
        RestContext.request = reqVerify;
        RestContext.response = resVerify;
        
        String verifyResult = LoginController.handlePost();
        System.assertEquals(401, RestContext.response.statusCode);
        Map<String,Object> verifyMap = (Map<String,Object>)JSON.deserializeUntyped(verifyResult);
        System.assertEquals('Invalid or expired code (Mock code is 123456)', verifyMap.get('error'));
    }
}
