/**
 * REST endpoint for Web Applications user login.
 *
 * Endpoint: POST /services/apexrest/auth/login
 *
 * Authenticates a user and returns a redirect URL for session creation.
 *
 * @see https://developer.salesforce.com/docs/atlas.en-us.apexref.meta/apexref/apex_classes_sites.htm#apex_System_Site_login
 */
@RestResource(urlMapping='/auth/login')
global without sharing class UIBundleLogin {
  /**
   * Authenticates a user and returns a redirect URL.
   * @param email User's email address (used as username).
   * @param password User's password.
   * @param startUrl Optional URL to redirect to after login.
   * @return LoginResponse with redirectUrl on success, or error message on failure.
   */
  @HttpPost
  global static LoginResponse doLogin(
    String email,
    String password,
    String startUrl
  ) {
    try {
      validateInput(email, password);

      String inputEmail = email.trim().toLowerCase();
      String username = inputEmail;

      List<User> users = [
        SELECT Username
        FROM User
        WHERE Email = :inputEmail AND IsActive = TRUE
        ORDER BY ContactId DESC NULLS LAST
        LIMIT 1
      ];
      if (!users.isEmpty()) {
        username = users[0].Username;
      }
      System.debug('username is ' + username);
      String pathPrefix = Site.getPathPrefix();
      String sanitizedStartUrl = UIBundleAuthUtils.getSanitizedStartUrl(
        startUrl,
        pathPrefix == null ? '' : pathPrefix
      );

      PageReference loginResult;
      try {
        loginResult = Site.login(username, password, sanitizedStartUrl);
        System.debug('loginresult is ' + loginResult);
      } catch (System.SecurityException loginEx) {
        RestContext.response.statusCode = 401;
        return new ErrorLoginResponse(loginEx.getMessage());
      } catch (Exception loginEx) {
        RestContext.response.statusCode = 500;
        return new ErrorLoginResponse(
          'Exception: ' + loginEx.getTypeName() + ': ' + loginEx.getMessage()
        );
      }

      if (loginResult != null) {
        List<User> loggedInUsers = [
          SELECT Id, FirstName, LastName, Email, Username, UserType
          FROM User
          WHERE Username = :username AND IsActive = TRUE
          LIMIT 1
        ];
        if (!loggedInUsers.isEmpty()) {
          return new SuccessLoginResponse(loginResult.getUrl(), loggedInUsers[0]);
        }
        return new SuccessLoginResponse(loginResult.getUrl());
      } else {
        RestContext.response.statusCode = 401;
        return new ErrorLoginResponse(
          'Your login attempt has failed. Make sure the username and password are correct.'
        );
      }
    } catch (UIBundleAuthUtils.AuthException ex) {
      RestContext.response.statusCode = ex.statusCode;
      return new ErrorLoginResponse(ex.messages);
    } catch (Exception ex) {
      UIBundleAuthUtils.debugLog(ex, LoggingLevel.ERROR);
      RestContext.response.statusCode = 500;
      return new ErrorLoginResponse(
        'An unexpected error occurred. Please contact your administrator.'
      );
    }
  }

  /**
   * Validates login input fields.
   * @param email The email to validate.
   * @param password The password to validate.
   * @throws UIBundleAuthUtils.AuthException if validation fails.
   */
  private static void validateInput(String email, String password) {
    List<String> errors = new List<String>();
    if (String.isBlank(email)) {
      errors.add('Email is required.');
    }
    if (String.isBlank(password)) {
      errors.add('Password is required.');
    }
    if (!errors.isEmpty()) {
      throw new UIBundleAuthUtils.AuthException(400, errors);
    }
  }

  /**
   * Base response class for login.
   */
  global abstract class LoginResponse {
  }

  global class UserPayload {
    global String id;
    global String name;
    global String email;
    global String username;
    global String firstName;
    global String lastName;
    global String userType;

    global UserPayload(User u) {
      this.id = u.Id;
      this.name = (u.FirstName == null ? '' : u.FirstName) + ' ' + (u.LastName == null ? '' : u.LastName);
      this.email = u.Email;
      this.username = u.Username;
      this.firstName = u.FirstName;
      this.lastName = u.LastName;
      this.userType = u.UserType;
    }
  }

  /**
   * Success response with redirect URL and user details.
   */
  global class SuccessLoginResponse extends LoginResponse {
    global Boolean success = true;
    global String redirectUrl;
    global UserPayload user;

    global SuccessLoginResponse(String redirectUrl) {
      this.redirectUrl = redirectUrl;
    }

    global SuccessLoginResponse(String redirectUrl, User u) {
      this.redirectUrl = redirectUrl;
      this.user = new UserPayload(u);
    }
  }

  /**
   * Error response with error messages.
   */
  global class ErrorLoginResponse extends LoginResponse {
    global List<String> errors;

    global ErrorLoginResponse(List<String> errors) {
      this.errors = new List<String>(errors);
    }

    global ErrorLoginResponse(String error) {
      this.errors = new List<String>{ error };
    }
  }
}
