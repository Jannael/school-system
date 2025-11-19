## Generate JWT passwords

```bash
  require('crypto').randomBytes(128).toString('hex')
```

## Generate CRYPTO passwords

```bash
  require('crypto').randomBytes(32).toString('base64')
```
