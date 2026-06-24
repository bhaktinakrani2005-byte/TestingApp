@isTest
private class PasswordlessLoginServiceTest {
    
    @testSetup
    static void setupTestData() {
        UserRole ur = new UserRole(DeveloperName = 'TestRole', Name = 'Test Role');
        insert ur;
        
        User thisUser = [SELECT Id, UserRoleId FROM User WHERE Id = :UserInfo.getUserId()];
        thisUser.UserRoleId = ur.Id;
        update thisUser;
        
        System.runAs(thisUser) {
            Account acc = new Account(Name = 'Test Portal Account');
            insert acc;
            
            Contact con = new Contact(
                LastName = 'PortalContact', 
                AccountId = acc.Id, 
                Email = 'portaluser@example.com'
            );
            insert con;
            
            Profile p = [SELECT Id FROM Profile WHERE Name = 'Customer Community User' OR Name = 'Customer Community Login User' OR Name = 'External Identity User' LIMIT 1];
            
            User u = new User(
                Alias = 'portut',
                Email = 'portaluser@example.com',
                EmailEncodingKey = 'UTF-8',
                LastName = 'PortalUser',
                LanguageLocaleKey = 'en_US',
                LocaleSidKey = 'en_US',
                ProfileId = p.Id,
                TimeZoneSidKey = 'America/Los_Angeles',
                UserName = 'portalusercomm@example.com',
                ContactId = con.Id
            );
            insert u;
        }
    }
    
    @isTest
    static void testSendOtp_SuccessAndFallback() {
        Map<String,Object> result = PasswordlessLoginService.sendOtp('portaluser@example.com', '/home');
        System.assertNotEquals(null, result.get('identifier'));
        System.assertEquals('/home', result.get('startUrl'));
        
        String identifier = (String)result.get('identifier');
        System.assert(identifier.startsWith('MOCK-'));
    }
    
    @isTest
    static void testSendOtp_UserNotFound() {
        try {
            PasswordlessLoginService.sendOtp('nonexistent@example.com', '/home');
            System.assert(false, 'Should have thrown AuraHandledException');
        } catch (AuraHandledException e) {
            System.assertEquals('User not found with this email', e.getMessage());
        }
    }
    
    @isTest
    static void testVerifyOtp_MockSuccess() {
        Map<String,Object> sendResult = PasswordlessLoginService.sendOtp('portaluser@example.com', '/home');
        String identifier = (String)sendResult.get('identifier');
        
        Map<String,Object> verifyResult = PasswordlessLoginService.verifyOtp('portaluser@example.com', identifier, '123456', '/home');
        System.assertEquals(true, verifyResult.get('success'));
        System.assertEquals('/home', verifyResult.get('redirectUrl'));
    }
    
    @isTest
    static void testVerifyOtp_MockFailure() {
        Map<String,Object> sendResult = PasswordlessLoginService.sendOtp('portaluser@example.com', '/home');
        String identifier = (String)sendResult.get('identifier');
        
        Map<String,Object> verifyResult = PasswordlessLoginService.verifyOtp('portaluser@example.com', identifier, '000000', '/home');
        System.assertEquals(false, verifyResult.get('success'));
    }
    
    @isTest
    static void testVerifyOtp_UserNotFound() {
        try {
            PasswordlessLoginService.verifyOtp('nonexistent@example.com', 'MOCK-123', '123456', '/home');
            System.assert(false, 'Should have thrown AuraHandledException');
        } catch (AuraHandledException e) {
            System.assertEquals('User not found', e.getMessage());
        }
    }
}
