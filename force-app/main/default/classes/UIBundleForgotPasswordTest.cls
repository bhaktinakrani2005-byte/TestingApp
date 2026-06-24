@isTest
private class UIBundleForgotPasswordTest {
    
    @isTest
    static void testForgotPassword_ValidationError() {
        RestContext.response = new RestResponse();
        
        UIBundleForgotPassword.ForgotPasswordResponse response = UIBundleForgotPassword.forgotPassword('');
        System.assertEquals(400, RestContext.response.statusCode);
        System.assert(response instanceof UIBundleForgotPassword.ErrorForgotPasswordResponse);
    }
    
    @isTest
    static void testForgotPassword_Execution() {
        RestContext.response = new RestResponse();
        
        UIBundleForgotPassword.ForgotPasswordResponse response = UIBundleForgotPassword.forgotPassword('testuser@example.com');
        System.assert(response != null);
    }
}
