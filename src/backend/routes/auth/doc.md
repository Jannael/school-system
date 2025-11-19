# /auth/v1/

## /request/code/ 
_Method: POST_
### Input
    `account`
    `TEST_PWD`: this is pwd for test env, it avoids no send the emails, and the code to 'verify', it always will be '1234'

### Output
- `complete`: boolean

`complete`: this say if the email was send and the info to verify it its saved

### Error
`output`

    _body: 
        msg: ''
        complete: boolean

|StatusCode|Instance|Message|Description|
|:-----------|:-----------|:-----------|-----------:|
|400|UserBadRequest|Invalid credentials|Missing or invalid account, the account must match the following pattern example@service.ext|
|500|ServerError||My bad|

### Explanation
this endpoint send and email to verify the account, and make some operations like delete or update de user, check the doc for user-routes

## /verify/code/ 
_Method: POST_
### Input
    first you need to ask for a code
    /auth/v1/request/code/

    `account`
    `code`: if you used the correct TEST_PWD, it always will be '1234'

### Output
- `complete`: boolean

`complete`: it says if the user account was verified

### Error
`output`

    _body: 
        msg: ''
        complete: boolean

|StatusCode|Instance|Message|Description|
|:-----------|:-----------|:-----------|-----------:|
|400|UserBadRequest|Missing data|Missing code you need to ask for one|
|400|UserBadRequest|Invalid credentials|The token is invalid|
|400|UserBadRequest|Invalid credentials|Wrong code|
|400|UserBadRequest|Invalid credentials|You tried to change the account now your banned forever|
|500|ServerError||My bad|

### Explanation
this endpoint verify the code you're sending its the same the server sent and the account also must match with the one you asked to verify for

## /request/refreshToken/code/ 
_Method: POST_
### Input
    `account`
    `pwd`
    `TEST_PWD`: this endpoint ask for a code to the user email, to MFA, if the TEST_PWD, its the correct one, it wont send the code, and the code will always be '1234',if its wrong it wont send it but the code to verify will be random

### Output
- `complete`: boolean

`complete`: it says if the code was sent and saved to verify it

### Error
`output`

    _body: 
        msg: ''
        complete: boolean

|StatusCode|Instance|Message|Description|
|:-----------|:-----------|:-----------|-----------:|
|400|UserBadRequest|Invalid credentials|Missing or invalid data the account must match the following pattern example@service.ext|
|400|UserBadRequest|Invalid credentials|Incorrect password|
|404|NotFound|User not found|undefined|
|500|ServerError||My bad|

### Explanation
this endpoint its the first step to log in


## /request/refreshToken/ 
_Method: POST_
### Input
    first you need to ask for a code
    /auth/v1/request/refreshToken/code/
    'code'

### Output
- `complete`: boolean

`complete`: it says if you got the refreshToken

### Error
`output`

    _body: 
        msg: ''
        complete: boolean

|StatusCode|Instance|Message|Description|
|:-----------|:-----------|:-----------|-----------:|
|400|UserBadRequest|Missing data|You need to use MFA for login|
|400|UserBadRequest|Invalid credentials|The token is invalid|
|400|UserBadRequest|Invalid credentials|Wrong code|
|500|Server Error||My bad|

### Explanation
this endpoint its the second and last step to log in

## /request/accessToken/
_Method: GET_
### Input
    doesn't need an input but you to have a valid refreshToken
    ask code for refreshToken: /request/refreshToken/code/
    verify code for refreshToken: /request/refreshToken/

### Output
- `complete`: boolean

`complete`: it says if you got a new accessToken the server handles all the tokens, so you wont get them but this field tells you if everything went right

### Error
`output`

    _body: 
        msg: ''
        complete: boolean

|StatusCode|Instance|Message|Description|
|:-----------|:-----------|:-----------|-----------:|
|400|UserBadRequest|Missing data|You need to login|
|500|Server Error||My bad|

### Explanation
this endpoint it's to keep the access to server resource with an accessToken


## /account/request/code/
_Method: PATCH_
### Input
    you need an accessToken 
    /auth/v1/request/accessToken/
    `newAccount`,
    `TEST_PWD`: for test environment

### Output
- `complete`: boolean

`complete`: it says if the code for verifying the account was send and saved

### Error
`output`

    _body: 
        msg: ''
        complete: boolean

|StatusCode|Instance|Message|Description|
|:-----------|:-----------|:-----------|-----------:|
|400|UserBadRequest|Missing data|Missing or invalid data you may be not logged in|
|400|UserBadRequest|Invalid credentials|The token is invalid|
|500|Server Error||My bad|

### Explanation
this endpoint it helps when you want to change your account but you need to be log in its the only way to change the account, this is the first step

## /account/verify/code/
_Method: PATCH_
### Input
    you need an accessToken 
    /auth/v1/request/accessToken/
    you also need to ask for a code
    /auth/v1/account/request/code/
    `codeCurrentAccount`
    `codeNewAccount`

### Output
- `complete`: boolean

`complete`: it says if the both account were verified

### Error
`output`

    _body: 
        msg: ''
        complete: boolean

|StatusCode|Instance|Message|Description|
|:-----------|:-----------|:-----------|-----------:|
|400|UserBadRequest|Invalid credentials|You need to ask for verification codes|
|400|UserBadRequest|Invalid credentials|The token is invalid|
|400|UserBadRequest|Invalid credentials|Current account code is wrong|
|400|UserBadRequest|Invalid credentials|New account code is wrong|
|500|Server Error||My bad|

### Explanation
this endpoint its the second step to change the account, once you get the complete true, from here you can ask for change it, in /user/v1/update/account/

## /password/request/code/
_Method: PATCH_
### Input
    `account`
    `TEST_PWD`: for test environment

### Output
- `complete`: boolean

`complete`: it says if the code to the account was sent

### Error
`output`

    _body: 
        msg: ''
        complete: boolean

|StatusCode|Instance|Message|Description|
|:-----------|:-----------|:-----------|-----------:|
|400|UserBadRequest|Missing data|Missing or invalid account it must match example@service.ext|
|404|NotFound|User not found|undefined|
|500|Server Error|My bad|

### Explanation
this endpoint its for when you want to change the password of the account without been log in, `forgot password`

## /password/verify/code/
_Method: PATCH_
### Input
    you need to ask for a code
    /auth/v1/password/request/code/
    `code`
    `account`
    `newPwd`

### Output
- `complete`: boolean

`complete`: it says if you can change the pwd

### Error
`output`

    _body: 
        msg: ''
        complete: boolean

|StatusCode|Instance|Message|Description|
|:-----------|:-----------|:-----------|-----------:|
|400|UserBadRequest|Missing data|undefined|
|400|UserBadRequest|Invalid credentials|The token is invalid|
|400|UserBadRequest|Invalid credentials|Wrong code|
|400|UserBadRequest|Invalid credentials|You tried to change the account now your banned forever|
|500|Server Error|My bad|

### Explanation
with this endpoint you verify the account its yours, and you can change the pwd in /user/v1/update/password/

## /request/logout/
_Method: PATCH_
### Input

### Output
- `complete`: boolean

`complete`: it says if you are logout

### Error
`output`

    _body: 
        msg: ''
        complete: boolean

|StatusCode|Instance|Message|Description|
|:-----------|:-----------|:-----------|-----------:|
|500|ServerError||My bad|

### Explanation
to logout xd