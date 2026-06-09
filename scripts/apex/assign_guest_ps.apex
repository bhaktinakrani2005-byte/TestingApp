User guestUser = [SELECT Id FROM User WHERE UserType = 'Guest' AND Name LIKE '%TestingApp%' LIMIT 1];
PermissionSet ps = [SELECT Id FROM PermissionSet WHERE Name = 'TestingAppGuest' LIMIT 1];
insert new PermissionSetAssignment(AssigneeId = guestUser.Id, PermissionSetId = ps.Id);
System.debug('Permission Set assigned to Guest User: ' + guestUser.Id);