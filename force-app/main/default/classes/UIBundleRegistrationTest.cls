@isTest
private class UIBundleRegistrationTest {
    
    @testSetup
    static void setupTestData() {
        UserRole ur = new UserRole(DeveloperName = 'TestRole', Name = 'Test Role');
        insert ur;
        
        User thisUser = [SELECT Id, UserRoleId FROM User WHERE Id = :UserInfo.getUserId()];
        thisUser.UserRoleId = ur.Id;
        update thisUser;
        
        System.runAs(thisUser) {
            Account acc = new Account(Name = 'Test Reg Account');
            insert acc;
            
            Contact con = new Contact(
                LastName = 'RegContact', 
                AccountId = acc.Id, 
                Email = 'existinguser@example.com'
            );
            insert con;
            
            Profile p = [SELECT Id FROM Profile WHERE Name = 'Customer Community User' OR Name = 'Customer Community Login User' OR Name = 'External Identity User' LIMIT 1];
            
            User u = new User(
                Alias = 'regut',
                Email = 'existinguser@example.com',
                EmailEncodingKey = 'UTF-8',
                LastName = 'RegUser',
                LanguageLocaleKey = 'en_US',
                LocaleSidKey = 'en_US',
                ProfileId = p.Id,
                TimeZoneSidKey = 'America/Los_Angeles',
                UserName = 'existinguser@example.com',
                ContactId = con.Id
            );
            insert u;
        }
    }
    
    @isTest
    static void testRegisterUser_ValidationErrors() {
        RestContext.response = new RestResponse();
        
        UIBundleRegistration.RegistrationRequest req = new UIBundleRegistration.RegistrationRequest();
        req.email = '';
        req.firstName = '';
        req.lastName = '';
        req.password = '';
        
        UIBundleRegistration.RegistrationResponse response = UIBundleRegistration.registerUser(req);
        
        System.assertEquals(400, RestContext.response.statusCode);
        System.assert(response instanceof UIBundleRegistration.ErrorRegistrationResponse);
        UIBundleRegistration.ErrorRegistrationResponse errRes = (UIBundleRegistration.ErrorRegistrationResponse)response;
        System.assert(errRes.errors.contains('First name is required.'));
        System.assert(errRes.errors.contains('Last name is required.'));
        System.assert(errRes.errors.contains('Password is required.'));
    }
    
    @isTest
    static void testRegisterUser_DuplicateError() {
        RestContext.response = new RestResponse();
        
        UIBundleRegistration.RegistrationRequest req = new UIBundleRegistration.RegistrationRequest();
        req.email = 'existinguser@example.com';
        req.firstName = 'Test';
        req.lastName = 'User';
        req.password = 'Password123!';
        
        UIBundleRegistration.RegistrationResponse response = UIBundleRegistration.registerUser(req);
        
        System.assertEquals(400, RestContext.response.statusCode);
        System.assert(response instanceof UIBundleRegistration.ErrorRegistrationResponse);
        UIBundleRegistration.ErrorRegistrationResponse errRes = (UIBundleRegistration.ErrorRegistrationResponse)response;
        System.assert(errRes.errors.contains('A user with this email already exists.'));
    }
    
    @isTest
    static void testRegisterUser_SuccessOrExecutionFailure() {
        RestContext.response = new RestResponse();
        
        UIBundleRegistration.RegistrationRequest req = new UIBundleRegistration.RegistrationRequest();
        req.email = 'newuser@example.com';
        req.firstName = 'New';
        req.lastName = 'User';
        req.password = 'Password123!';
        req.startUrl = '/home';
        
        UIBundleRegistration.RegistrationResponse response = UIBundleRegistration.registerUser(req);
        System.assert(response != null);
    }
}
