## Generate JWT passwords

```javascript
  require('crypto').randomBytes(128).toString('hex')
```

## Generate CRYPTO passwords

```javascript
  require('crypto').randomBytes(32).toString('base64')
```
