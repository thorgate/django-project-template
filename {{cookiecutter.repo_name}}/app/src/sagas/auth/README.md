# JWT authentication logic

SPA uses Json Web Tokens to handle authentication

## Authentication flow is following:

- User goes to login page and enters correct username and password
- API returns valid tokens
    - Token is valid for 30minutes
    - Refresh token is valid for 7 days, until this expires valid token can be re-acquired
- Token storage
    - Client
        - Valid token is stored cookie with correct expire value and `localStorage`
        - Refresh token is stored in `localStorage`

## Client: App handling api requests with token and refresh token

- Route loading is started
- Token is verified
    - If token is valid, continue
    - Else try refresh token to get a new token, if valid token received, continue
      otherwise redirect user to login screen / show permission denied component

## Server-side: App handling api requests with token and refresh token

- Route loading is started
- Token is verified
    - If token is valid, continue
    - Redirect user to login screen / show permission denied component and
      frontend will handle the rest - hopefully no SSR / client mismatch happens
