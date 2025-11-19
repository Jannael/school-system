export interface IEnv {
  DB_URL_ENV: string
  JWT_ACCESS_TOKEN_ENV: string
  JWT_REFRESH_TOKEN_ENV: string
  JWT_DATABASE_ENV: string
  JWT_AUTH_ENV: string
  CRYPTO_ACCESS_TOKEN_ENV: string
  CRYPTO_REFRESH_TOKEN_ENV: string
  CRYPTO_DATABASE_ENV: string
  CRYPTO_AUTH_ENV: string
  EMAIL_ENV: string
  PASSWORD_ENV: string
  BCRYPT_SALT_HASH: string

  DB_URL_ENV_TEST: string
  TEST_PWD_ENV: string
}
