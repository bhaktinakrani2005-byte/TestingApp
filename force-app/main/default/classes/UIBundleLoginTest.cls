@isTest
private class UIBundleLoginTest {
    
    @isTest
    static void testDoLogin_ValidationErrors() {
        RestContext.response = new RestResponse();
        
        UIBundleLogin.LoginResponse response = UIBundleLogin.doLogin('', '', '/home');
        System.assertEquals(400, RestContext.response.statusCode);
        System.assert(response instanceof UIBundleLogin.ErrorLoginResponse);
        UIBundleLogin.ErrorLoginResponse errorRes = (UIBundleLogin.ErrorLoginResponse)response;
        System.assert(errorRes.errors.contains('Email is required.'));
        System.assert(errorRes.errors.contains('Password is required.'));
    }
    
    @isTest
    static void testDoLogin_ExecutionFailure() {
        RestContext.response = new RestResponse();
        
        UIBundleLogin.LoginResponse response = UIBundleLogin.doLogin('test@example.com', 'mypass', '/home');
        
        System.assert(RestContext.response.statusCode == 400 || RestContext.response.statusCode == 401 || RestContext.response.statusCode == 500 || RestContext.response.statusCode == null);
        System.assert(response instanceof UIBundleLogin.ErrorLoginResponse);
    }
}
