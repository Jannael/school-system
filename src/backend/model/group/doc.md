# Group Model

## Get
gets the whole group information

### Parameters:
- id ObjectId
### Output:
```TypeScript
  _id: Types.ObjectId
  techLead?: Array<{
    account: string
    fullName: string
  }>
  name: string
  color: string
  repository?: string
  member?: Array<{
    account: string
    fullName: string
    role: string
  }>
```

### Error
|Instance|Error|Message|
|:-----------|:-----------|-----------:|
|NotFound|Group not found|The group you are trying to access does not exist|
|DatabaseError|Failed to access data|The group was not retrieved, something went wrong please try again|

## Exists
it has two different uses 
- to check if the group exists
- to check if the group exists and the user is techLead

### Parameters:
- groupId ObjectId
- techLeadAccount? string

### Output:
- boolean

### Error
|Instance|Error|Message|
|:-----------|:-----------|-----------:|
|NotFound|Group not found|The group you are trying to access does not exist|
|Forbidden|Access denied|The group exists but the user is not a techLead|
|DatabaseError|Failed to access data|The group existence could not be verified, something went wrong please try again|

## Create
to create a group
- if you do not add the techLead who is creating the group, it will add it for you
- for each techLead/member you add, it will send an invitation
- adds the group to user schema

### Functions
this function uses some other functions
- UserModel.invitation.create()
- UserModel.group.add()

### Parameters:
- data 
   ```TypeScript
     techLead?: Array<{
        account: string
        fullName: string
      }>
      name: string
      color: string
      repository?: string
      member?: Array<{
        account: string
        fullName: string
        role: string
      }>
   ```
- techLead 
  ```TypeScript
    { fullName: string, account: string }
  ```

### Output:
```TypeScript
  _id: Types.ObjectId
  techLead?: Array<{
    account: string
    fullName: string
  }>
  name: string
  color: string
  repository?: string
  member?: Array<{
    account: string
    fullName: string
    role: string
  }>
```

### Error
|Instance|Error|Message|
|:-----------|:-----------|-----------:|
|NotFound|User not found||
|Forbidden|Access denied|The user has reached the max number of groups|
|DatabaseError|Failed to save|The group was not created, something went wrong please try again|

## Update
to update a group, you only can update the name, color or repository
- it updates the group on user schema

### Functions:
this function uses some other functions
- UserModel.group.update()

### Parameters
- techLeadId: ObjectId
- groupId: ObjectId
- data: 
```TypeScript
  name: string
  color: string // hexadecimal
  repository: string //url
```

### Output
```TypeScript
  _id: ObjectId
  name: string
  color: string
  repository?: string
```

### Error
|Instance|Error|Message|
|:-----------|:-----------|-----------:|
|UserBadRequest|Invalid credentials|You can not change the _id|
|UserBadRequest|Invalid credentials|You can not change the member|
|UserBadRequest|Invalid credentials|You can not change the techLead|
|NotFound|User not found||
|NotFound|Group not found||
|NotFound|Group not found|The group you are trying to update does not exist|
|NotFound|Group not found|The group you are trying to update does not exist|
|DatabaseError|Failed to save|The group was not updated, something went wrong please try again|

## Delete
to delete a group
- it removes the group from user schema

### Functions:
this functions uses some other functions
- UserModel.group.remove()

### Parameters:
- techLeadAccount string
- groupId ObjectId

### Output
- boolean

### Error
|Instance|Error|Message|
|:-----------|:-----------|-----------:|
|NotFound|Group not found|The group you are trying to delete does not exist|
|Forbidden|Access denied|Only tech leads can delete a group|
|NotFound|Group not found|The group you are trying to delete does not exist|
|DatabaseError|Failed to remove|The group was not deleted, something went wrong please try again|

# Member

## Add
it adds a member to the groups, remember user's belong to the group unless they reject the invitation

### Parameters:
- groupId ObjectId
- member 
```TypeScript
  account: string
  fullName: string
  role: string
```

### Output
- boolean

### Error
|Instance|Error|Message|
|:-----------|:-----------|-----------:|
|Forbidden|Access denied|The group has reached the max number of members|
|NotFound|Group not found|The group you are trying to access was not found|
|DatabaseError|Failed to save|the member with the account ${member.account} was not added|


## Remove
to remove a user in group schema

### Functions:
- authModel.exists()

### Parameters:
- groupId ObjectId
- account string

### Output:
- boolean

### Errors
|Instance|Error|Message|
|:-----------|:-----------|-----------:|
|Forbidden|Access denied|You can not remove the last techLead|
|NotFound|Group not found|The group was not found|
|DatabaseError|Failed to remove|The member was not remove from the group please try again|

## Update
to update a user in group schema

### Parameters:
- groupId ObjectId
- data
```TypeScript
{ fullName: string, account: string }
```
- updateData
```TypeScript
{ fullName: string, account: string }
```

### Output
- boolean

### Errors
|Instance|Error|Message|
|:-----------|:-----------|-----------:|
|NotFound|Group not found||
|NotFound|User not found||
|DatabaseError|Failed to save|The user was not updated|