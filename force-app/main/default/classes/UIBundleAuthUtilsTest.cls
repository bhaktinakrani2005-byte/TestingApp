@isTest
private class UIBundleAuthUtilsTest {
    
    @isTest
    static void testGetSanitizedStartUrl_EmptyAndSlash() {
        System.assertEquals('', UIBundleAuthUtils.getSanitizedStartUrl(null, null));
        System.assertEquals('', UIBundleAuthUtils.getSanitizedStartUrl('', ''));
        System.assertEquals('/s/home', UIBundleAuthUrl_default('/s/home'));
    }
    
    @isTest
    static void testGetSanitizedStartUrl_ValidSafeUrls() {
        System.assertEquals('/s/home', UIBundleAuthUtils.getSanitizedStartUrl('/s/home', '/s'));
        System.assertEquals('/TestingApp/dashboard', UIBundleAuthUtils.getSanitizedStartUrl('/TestingApp/dashboard', '/s'));
    }
    
    @isTest
    static void testGetSanitizedStartUrl_InvalidUnsafeUrls() {
        System.assertEquals('/s', UIBundleAuthUtils.getSanitizedStartUrl('//evil.com', '/s'));
        System.assertEquals('/s', UIBundleAuthUtils.getSanitizedStartUrl('/path\\sub', '/s'));
        System.assertEquals('/s', UIBundleAuthUtils.getSanitizedStartUrl('/user@evil.com', '/s'));
        System.assertEquals('/s', UIBundleAuthUtils.getSanitizedStartUrl('/path:port', '/s'));
        String urlWithControl = '/path' + String.fromCharArray(new List<Integer>{10});
        System.assertEquals('/s', UIBundleAuthUtils.getSanitizedStartUrl(urlWithControl, '/s'));
    }
    
    @isTest
    static void testGetSanitizedStartUrl_PrefixAddition() {
        System.assertEquals('/s/home', UIBundleAuthUtils.getSanitizedStartUrl('/home', '/s'));
    }

    private static String UIBundleAuthUrl_default(String defaultVal) {
        return UIBundleAuthUtils.getSanitizedStartUrl('/', defaultVal);
    }
}
