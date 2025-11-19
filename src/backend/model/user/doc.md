# User Model


## Get
to get specific fields of the user with the _id

### Parameters
- account string
- projection
you can choose this fields, by putting them with the value "1"
```TypeScript
  _id?: Types.ObjectId
  fullName: string
  account: string
  pwd: string
  nickName?: string
  refreshToken?: string[]
  invitation?: IUserInvitation[]
  group?: IUserGroup[]
```
### Output
returns the fields tou asked for
- Partial<IRefreshToken>
### Error
|Instance|Error|Message|
|:-----------|:-----------|-----------:|
|NotFound|User not found||
|DatabaseError|Failed to access data||
|UserBadRequest|Invalid credentials|The account ${account} is invalid|

## Create
to create a user

### Parameters:
- data
```TypeScript
  fullName: string
  account: string
  pwd: string
  nickName?: string | null
```
### Output
- IRefreshToken
```TypeScript
  fullName: string
  account: string
  pwd: string
  nickName?: string | null
  invitation?: IUserInvitation[] | null
  group?: IUserGroup[] | null
```
### Error
|Instance|Error|Message|
|:-----------|:-----------|-----------:|
|UserBadRequest|Invalid credentials|You can not put the _id yourself|
|UserBadRequest|Invalid credentials|You can not put the refreshToken yourself|
|DuplicateData|User already exists|This account belongs to an existing user|
|NotFound|User not found|The user appears to be created but it was not found|
|UserBadRequest|Invalid credentials|x|
|DatabaseError|Failed to save|The user was not created, something went wrong please try again|

## Update
to update a user the next fields are the ones you can update here
### Functions:
- groupModel.member.update()
### Parameters:
- data 
```TypeScript
  fullName: string
  account: string
  pwd: string
  nickName: string
```
- userId ObjectId
### Output
- IRefreshToken
```TypeScript
  fullName: string
  account: string
  pwd: string
  nickName?: string | null
  invitation?: IUserInvitation[] | null
  group?: IUserGroup[] | null
```
### Error
|Instance|Error|Message|
|:-----------|:-----------|-----------:|
|UserBadRequest|Invalid credentials|The _id is invalid|
|UserBadRequest|Invalid credentials|You can not change the account here|
|UserBadRequest|Invalid credentials|You can not change the _id|
|UserBadRequest|Invalid credentials|You can not update the refreshToken|
|NotFound|User not found||
|DatabaseError|Failed to save|The user was not updated, something went wrong please try again|

## Delete
to eliminate a user
### Functions
- groupModel.member.remove()
### Parameters
- userId ObjectId
### Output
- boolean
### Error
|Instance|Error|Message|
|:-----------|:-----------|-----------:|
|UserBadRequest|Invalid credentials|The _id is invalid|
|NotFound|User not found||
|DatabaseError|Failed to remove|The user was not deleted, something went wrong please try again|

## Account Update
to update user account

### Functions
- groupModel.member.update()
### Parameters:
- userId ObjectId
- account string
### Output
- IRefreshToken
```TypeScript
  fullName: string
  account: string
  pwd: string
  nickName?: string | null
  invitation?: IUserInvitation[] | null
  group?: IUserGroup[] | null
```
### Errors
|Instance|Error|Message|
|:-----------|:-----------|-----------:|
|UserBadRequest|Invalid credentials|The _id is invalid|
|UserBadRequest|Invalid credentials|The account must match example@service.ext|
|DuplicateData|User already exists|This account belongs to an existing user|
|NotFound|User not found|
|DatabaseError|Failed to save|The account was not updated, something went wrong please try again|

## Password Update
to update user pwd

### Parameters:
- account string
- pwd string
### Output
- boolean
### Errors
|Instance|Error|Message|
|:-----------|:-----------|-----------:|
|UserBadRequest|Invalid credentials|The account must match example@service.ext|
|NotFound|User not found|
|DatabaseError|Failed to save|The password was not updated, something went wrong please try again|

# Invitation

## Get
to get user's invitations

### Parameters:
- userId ObjectId
### Output
- IUserInvitation[]
```TypeScript
  _id: Types.ObjectId
  color: string
  name: string
```
### Errors
|Instance|Error|Message|
|:-----------|:-----------|-----------:|
|UserBadRequest|Invalid credentials|The _id is invalid|
|NotFound|User not found|
|DatabaseError|Failed to access data|The invitations were not retrieved, something went wrong please try again|

## Create
to create an invitation to an specific user
### Functions
- groupModel.exists()
- groupModel.member.add()
### Parameters:
- user
```TypeScript
    account: string
    fullName: string
    role: string
```
- invitation
```TypeScript
  _id: Types.ObjectId
  color: string
  name: string
```
- techLeadAccount string
### Output
- boolean
### Errors
|Instance|Error|Message|
|:-----------|:-----------|-----------:|
|UserBadRequest|Invalid credentials|The account must match example@service.com|
|NotFound|User not found|TechLead does not exists|
|NotFound|User not found||
|Forbidden|Access denied|The user with the account ${user.account} already belongs to the group|
|Forbidden|Access denied|The user with the account ${user.account} already has an invitation for the group|
|Forbidden|Access denied|The user with the account ${user.account} has reached the maximum number of invitations|
|NotFound|User not found||
|DatabaseError|Failed to save|The user was not invited, something went wrong please try again|

## Reject
to reject an invitation

### Functions
- groupModel.member.remove()
### Parameters:
- userAccount string
- invitationId ObjectId
### Output
- boolean
### Errors
|Instance|Error|Message|
|:-----------|:-----------|-----------:|
|UserBadRequest|Invalid credentials|The invitation _id is invalid|
|NotFound|User not found|
|DatabaseError|Failed to remove|The invitation was not removed from the user, something went wrong please try again|

## Remove

to remove an invitation
### Parameters
- userAccount string
- invitationId ObjectId
### Output 
- boolean
### Errors
|Instance|Error|Message|
|:-----------|:-----------|-----------:|
|UserBadRequest|Invalid credentials|The invitation _id is invalid|
|NotFound|User not found||
|DatabaseError|Failed to remove|The invitation was not removed from the user, something went wrong please try again|

# Group
## Get
to get all the groups the user is in
### Parameters
- userId ObjectId
### Output
- IUserGroup[]
```TypeScript
  _id: Types.ObjectId
  color: string
  name: string
```
### Errors
|Instance|Error|Message|
|:-----------|:-----------|-----------:|
|UserBadRequest|Invalid credentials|The _id is invalid|
|NotFound|User not found|
|DatabaseError|Failed to access data|The groups were not retrieved, something went wrong please try again|

## Add
to add a group to the user
- if its an invitation it will remove it
### Functions
- groupModel.exists()
- model.invitation.remove()
### Parameters:
- account string
- group
```TypeScript
  _id: Types.ObjectId
  color: string
  name: string
```
### Output:
- boolean
### Errors
|Instance|Error|Message|
|:-----------|:-----------|-----------:|
|NotFound|User not found|The user with the account ${account} was not found|
|UserBadRequest|Invalid credentials|x|
|Forbidden|Access denied|The user with the account ${account} already belongs to the group|
|Forbidden|Access denied|The user with the account ${account} has reached the maximum number of groups|
|NotFound|User not found|The user with the account ${account} was not found|
|DatabaseError|Failed to save|The group was not added to the user, something went wrong please try again|

## Remove
to remove a group from the user
- if the group you are trying to remove is an invitation it will remove it as well
- removeMember: indicates if you want to remove the user from the group, ik its sound weird, but this function its called by the delete group fn, that means its no the same, removing a group from the user, because the user wants out and because the group its been deleted

### Functions
- model.invitation.remove()
### Parameters
- account string
- groupId ObjectId
- removeMember boolean
### Output
- boolean
### Errors
|Instance|Error|Message|
|:-----------|:-----------|-----------:|
|UserBadRequest|Invalid credentials|The account is invalid|
|UserBadRequest|Invalid credentials|The group _id is invalid|
|NotFound|User not found|The user with the account ${account} was not found|
|DatabaseError|Failed to remove|The group was not removed from the user, something went wrong please try again|

## Update
to update a group the user is in 
- if the group you are trying to update it is still an invitation it will update it as well
### Parameters
- userAccount string
- groupId ObjectId
- data
```TypeScript
  { name: string, color: string }
```
### Output
- boolean
### Errors
|Instance|Error|Message|
|:-----------|:-----------|-----------:|
|NotFound|Group not found|The user it\'s in the group|
|DatabaseError|Failed to save|The user was not updated|
