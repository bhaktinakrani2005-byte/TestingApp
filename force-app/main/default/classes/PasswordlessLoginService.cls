public with sharing class PasswordlessLoginService {
    @AuraEnabled(cacheable=false)
    public static Map<String,Object> sendOtp(String email, String startUrl) {
        // Find active user (email verification not enforced in this org)
        List<User> users = [SELECT Id FROM User WHERE Email = :email AND IsActive = true LIMIT 1];
        if (users.isEmpty()) {
            throw new AuraHandledException('User not found with this email');
        }
        User u = users[0];
        // Email verification skipped; proceed with passwordless login
        // Initiate password‑less login (Guest User context is valid here)
        String identifier;
        try {
            identifier = UserManagement.initPasswordlessLogin(u.Id, Auth.VerificationMethod.EMAIL);
        } catch (Exception ex) {
            throw new AuraHandledException('Passwordless login initiation failed: ' + ex.getMessage());
        }
        return new Map<String,Object>{
            'identifier' => identifier,
            'startUrl'   => startUrl
        };
    }

    @AuraEnabled(cacheable=false)
    public static Map<String,Object> verifyOtp(String email, String identifier, String code, String startUrl) {
        List<User> users = [SELECT Id FROM User WHERE Email = :email AND IsActive = true LIMIT 1];
        if (users.isEmpty()) {
            throw new AuraHandledException('User not found');
        }
        User u = users[0];
        try {
            Auth.VerificationResult vr = UserManagement.verifyPasswordlessLogin(
                u.Id,
                Auth.VerificationMethod.EMAIL,
                identifier,
                code.trim(),
                startUrl
            );
            if (vr != null && vr.success) {
                String redirectUrl = vr.redirect != null ? vr.redirect.getUrl() : startUrl;
                return new Map<String,Object>{
                    'success'    => true,
                    'redirectUrl'=> redirectUrl
                };
            } else {
                return new Map<String,Object>{
                    'success' => false
                };
            }
        } catch (Exception ex) {
            throw new AuraHandledException('Verification failed: ' + ex.getMessage());
        }
    }
}
