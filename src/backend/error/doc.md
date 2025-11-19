# Error

This are the template of the errors you may get

|StatusCode|Instance|Message|
|:-----------|:-----------|-----------:|
|400|UserBadRequest|Invalid credentials|
|400|UserBadRequest|Missing data|
|||
|||
|500|DatabaseError|Connection error|
|500|DatabaseError|Connection Failed to save|
|500|DatabaseError|Connection Failed to remove|
|||
|||
|409|DuplicateData|User already exists|
|||
|||
|404|NotFound|User already exists|
|||
|||
|500|ServerError|Operation failed|
|||
|||
|403|Forbidden|Invalid account|
|||
|||

## Create a new error instance
```JavaScript
type TYPE = 'Possible message' | 'Possible message'
export const InstanceName = createError<TYPE>(CODE, 'InStanceName')

// USAGE EXAMPLE
throw new InstanceName('Message', 'Description')

// Then if you're using the error handler fn in controller you'll get a response like this

statusCode = CODE
{
  msg:'Message',
  description: 'Description'
  link: [
    { rel: '', href:'' }
  ]
}
```