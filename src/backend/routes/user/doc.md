# /user/v1/

## /get/ 
_Method: GET_
### Input
    this endpoint does not actually need an input but accessToken, so make sure to ask for one
    if you already have a refreshToken you can get an accessToken from /auth/v1/request/accessToken/

### Output
- `fullName`
- `account`
- `nickName`
- `complete`: boolean

`complete` field its to help frontend developer to handle the response its in error output as well

### Error
`output`

    _body: 
        msg: '',
        complete: false,
        `link`: here you will get all the routes you need to make the operation correctly in case something is missing
|StatusCode|Instance|Message|Description|
|:-----------|:-----------|:-----------|-----------:|
|400|UserBadRequest|Invalid credentials|Missing accessToken|

### Explanation
this endpoint returns the public user info containing in the accessToken


## /create/ 
_Method: POST_
### Input
    first you need to verify your account,
    get code: /auth/v1/request/code/
    verify code: /auth/v1/verify/code/

- `fullName`
- `account`
- `pwd`
- `nickName`

### Output
- `fullName`
- `account`
- `nickName`
- `complete`: boolean

`complete` field its to help frontend developer to handle the response its in error output as well

### Error
`output`

    _body: 
        msg: '',
        complete: false,
        `link`: here you will get all the routes you need to make the operation correctly in case something is missing

|StatusCode|Instance|Message|Description|
|:-----------|:-----------|:-----------|-----------:|
|400|UserBadRequest|Invalid credentials|Account not verified|
|400|UserBadRequest|Invalid credentials|The token is invalid|
|400|UserBadRequest|Invalid credentials|Verified account does not match the sent account|
|400|UserBadRequest|Invalid credentials|This message will tell if something in your request body is wrong|
|500|Server error||My bad|

### Explanation
this endpoint returns an accessToken and refreshToken, none of them are available for you, but for me


## /update/ 
_Method: PUT_
### Input
    first you need to verify your account,
    get code: /auth/v1/request/code/
    verify code: /auth/v1/verify/code/

Here you only can update this fields
- `fullName`
- `nickName`

### Output
- `user`:
  - `fullName`
  - `account`
  - `nickName`
- `complete`: boolean

`complete` field its to help frontend developer to handle the response its in error output as well

### Error
`output`

    _body: 
        msg: '',
        complete: false,
        `link`: here you will get all the routes you need to make the operation correctly in case something is missing

|StatusCode|Instance|Message|Description|
|:-----------|:-----------|:-----------|-----------:|
|400|UserBadRequest|Missing data|The\'res missing credentials, make sure to get them before update|
|400|UserBadRequest|Invalid credentials|The account verified and your account does not match|
|400|UserBadRequest|Missing data|No data to update or invalid data|
|500|Server error|My bad|

### Explanation
this endpoint returns a new accessToken and refreshToken with the new data, and updates it as well, and the account cookie is clear so you can use it again, if you want to ensure the data has been updated, you can use the /get/ route

## /delete/ 
_Method: DELETE_
### Input
    first you need to verify your account,
    get code: /auth/v1/request/code/
    verify code: /auth/v1/verify/code/

### Output
- `complete`: boolean

`complete` field its to help frontend developer to handle the response its in error output as well

### Error
`output`

    _body: 
        msg: '',
        complete: false,
        `link`: here you will get all the routes you need to make the operation correctly in case something is missing

|StatusCode|Instance|Message|Description|
|:-----------|:-----------|:-----------|-----------:|
|400|UserBadRequest|Missing data|Account not verified|
|400|UserBadRequest|Invalid credentials|The verified account and yours does not match|
|500|Server error|My bad|

### Explanation
this endpoint has a simple output, but remember that you need to ask for a code, then verify that code, and then you can delete the account, works the same update


## /update/account/ 
_Method: DELETE_
### Input
realize that the only way to change the account its been logged In

    first you need to verify your account,
    get code: /auth/v1/account/request/code/
    verify code: /auth/v1/account/verify/code/


### Output
- `user`
    - `fullName`
    - `account`
    - `nickName`
- `complete`: boolean

`complete` field its to help frontend developer to handle the response its in error output as well

### Error
`output`

    _body: 
        msg: '',
        complete: false,
        `link`: here you will get all the routes you need to make the operation correctly in case something is missing

|StatusCode|Instance|Message|Description|
|:-----------|:-----------|:-----------|-----------:|
|400|UserBadRequest|Missing data|Make sure yo follow the auth flow for this operation|
|500|Server error|My bad|

### Explanation
this endpoint only executes the update-account fn, does not authorized or authenticates, it only makes the operation


## /update/password/ 
_Method: DELETE_
### Input

    first you need to verify your account,
    get code: /auth/v1/password/request/code/
    verify code: /auth/v1/password/verify/code/

### Output
- `complete`: boolean

`complete` field its to help frontend developer to handle the response its in error output as well

### Error
`output`

    _body: 
        msg: '',
        complete: false,
        `link`: here you will get all the routes you need to make the operation correctly in case something is missing

|StatusCode|Instance|Message|Description|
|:-----------|:-----------|:-----------|-----------:|
|400|UserBadRequest|Missing data|Make sure to follow the auth flow for this operation|
|500|Server error|My bad|

### Explanation
this is the endpoint that will update your password in case you forgot yours
