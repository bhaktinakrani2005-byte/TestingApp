@isTest
private class UIBundleChangePasswordTest {
    
    @isTest
    static void testChangePassword_Execution() {
        RestContext.response = new RestResponse();
        
        UIBundleChangePassword.PasswordChangeResponse response = UIBundleChangePassword.changePassword('newPassword123!', 'currentPassword123!');
        System.assert(response != null);
    }
}
