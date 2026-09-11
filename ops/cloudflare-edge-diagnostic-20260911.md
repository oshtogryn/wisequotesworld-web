# Cloudflare edge diagnostic — 2026-09-11

Same GitHub Actions runner and same CF Access service-token secrets were used for both domains.

## WQW /admin/ with service token

- URL: `https://wisequotesworld.com/admin/`
- Mode: `service`
- HTTP: `403`

Relevant response headers:
```text
HTTP/1.1 403 Forbidden
Content-Type: text/html; charset=UTF-8
Cf-Mitigated: challenge
Content-Security-Policy: default-src 'none'; script-src 'nonce-9KuvzYLbEXDrkjFDMJgsgf' 'unsafe-eval' https://challenges.cloudflare.com; script-src-attr 'none'; style-src 'unsafe-inline'; img-src 'self' https://challenges.cloudflare.com; connect-src 'self' https://challenges.cloudflare.com; frame-src 'self' https://challenges.cloudflare.com blob:; child-src 'self' https://challenges.cloudflare.com blob:; worker-src blob:; form-action http: https:; base-uri 'self'
Server: cloudflare
X-Frame-Options: SAMEORIGIN
CF-RAY: a395c4dfdc9872dd-SEA
```

Body fingerprint:
```text
<!DOCTYPE html><html lang="en-US"><head><title>Just a moment...</title><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=Edge"><meta name="robots" content="noindex,nofollow"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="content-security-policy" content="default-src &#39;none&#39;; script-src &#39;nonce-9KuvzYLbEXDrkjFDMJgsgf&#39; &#39;unsafe-eval&#39; https://challenges.cloudflare.com; script-src-attr &#39;none&#39;; style-src &#39;unsafe-inline&#39;; img-src &#39;self&#39; https://challenges.cloudflare.com; connect-src &#39;self&#39; https://challenges.cloudflare.com; frame-src &#39;self&#
```

## WQW /api/admin/health with service token

- URL: `https://wisequotesworld.com/api/admin/health`
- Mode: `service`
- HTTP: `403`

Relevant response headers:
```text
HTTP/1.1 403 Forbidden
Content-Type: text/html; charset=UTF-8
Cf-Mitigated: challenge
Content-Security-Policy: default-src 'none'; script-src 'nonce-lprsAf43VlKLgqLLkOl1aN' 'unsafe-eval' https://challenges.cloudflare.com; script-src-attr 'none'; style-src 'unsafe-inline'; img-src 'self' https://challenges.cloudflare.com; connect-src 'self' https://challenges.cloudflare.com; frame-src 'self' https://challenges.cloudflare.com blob:; child-src 'self' https://challenges.cloudflare.com blob:; worker-src blob:; form-action http: https:; base-uri 'self'
Server: cloudflare
X-Frame-Options: SAMEORIGIN
CF-RAY: a395c4e029dcebbe-SEA
```

Body fingerprint:
```text
<!DOCTYPE html><html lang="en-US"><head><title>Just a moment...</title><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=Edge"><meta name="robots" content="noindex,nofollow"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="content-security-policy" content="default-src &#39;none&#39;; script-src &#39;nonce-lprsAf43VlKLgqLLkOl1aN&#39; &#39;unsafe-eval&#39; https://challenges.cloudflare.com; script-src-attr &#39;none&#39;; style-src &#39;unsafe-inline&#39;; img-src &#39;self&#39; https://challenges.cloudflare.com; connect-src &#39;self&#39; https://challenges.cloudflare.com; frame-src &#39;self&#
```

## WQW /ops/ with service token

- URL: `https://wisequotesworld.com/ops/`
- Mode: `service`
- HTTP: `403`

Relevant response headers:
```text
HTTP/1.1 403 Forbidden
Content-Type: text/html; charset=UTF-8
Cf-Mitigated: challenge
Content-Security-Policy: default-src 'none'; script-src 'nonce-fJPVZ0dkFZhDRqIH56zCLK' 'unsafe-eval' https://challenges.cloudflare.com; script-src-attr 'none'; style-src 'unsafe-inline'; img-src 'self' https://challenges.cloudflare.com; connect-src 'self' https://challenges.cloudflare.com; frame-src 'self' https://challenges.cloudflare.com blob:; child-src 'self' https://challenges.cloudflare.com blob:; worker-src blob:; form-action http: https:; base-uri 'self'
Server: cloudflare
X-Frame-Options: SAMEORIGIN
CF-RAY: a395c4e07b297642-SEA
```

Body fingerprint:
```text
<!DOCTYPE html><html lang="en-US"><head><title>Just a moment...</title><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=Edge"><meta name="robots" content="noindex,nofollow"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="content-security-policy" content="default-src &#39;none&#39;; script-src &#39;nonce-fJPVZ0dkFZhDRqIH56zCLK&#39; &#39;unsafe-eval&#39; https://challenges.cloudflare.com; script-src-attr &#39;none&#39;; style-src &#39;unsafe-inline&#39;; img-src &#39;self&#39; https://challenges.cloudflare.com; connect-src &#39;self&#39; https://challenges.cloudflare.com; frame-src &#39;self&#
```

## SNS /admin/console/ with service token

- URL: `https://swedennosugar.com/admin/console/`
- Mode: `service`
- HTTP: `302`

Relevant response headers:
```text
HTTP/1.1 302 Found
Content-Type: text/html; charset=UTF-8
Location: https://empty-flower-5659.cloudflareaccess.com/cdn-cgi/access/login/swedennosugar.com?kid=bc49d59f968b1e43fb58ad16f7a44e920e2494cf8df3fe75029c80b77d2b5f29&meta=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IjEwZjljZTQwOTFiNzQ1ZGU0OWFhZDUyOGY0YjU5YjIxMDQyNDg2ODY1MjdhOGM0Y2FlMDhhNjViNmZmYTU5OWMifQ.eyJ0eXBlIjoibWV0YSIsImF1ZCI6ImJjNDlkNTlmOTY4YjFlNDNmYjU4YWQxNmY3YTQ0ZTkyMGUyNDk0Y2Y4ZGYzZmU3NTAyOWM4MGI3N2QyYjVmMjkiLCJob3N0bmFtZSI6InN3ZWRlbm5vc3VnYXIuY29tIiwicmVkaXJlY3RfdXJsIjoiL2FkbWluL2NvbnNvbGUvIiwic2VydmljZV90b2tlbl9zdGF0dXMiOmZhbHNlLCJpc193YXJwIjpmYWxzZSwiaXNfZ2F0ZXdheSI6ZmFsc2UsImV4cCI6MTc4OTEyMDUzNSwibmJmIjoxNzg5MTIwMjM1LCJpYXQiOjE3ODkxMjAyMzUsImF1dGhfc3RhdHVzIjoiTk9ORSIsIm10bHNfYXV0aCI6eyJjZXJ0X2lzc3Vlcl9kbiI6IiIsImNlcnRfc2VyaWFsIjoiIiwiY2VydF9pc3N1ZXJfc2tpIjoiIiwiY2VydF9wcmVzZW50ZWQiOmZhbHNlLCJjb21tb25fbmFtZSI6IiIsImF1dGhfc3RhdHVzIjoiTk9ORSJ9LCJyZWFsX2NvdW50cnkiOiJVUyIsImFwcF9zZXNzaW9uX2hhc2giOiI2YTFiZjZhOWNlYTg1MWJjYjVmMDc1ZGVmNmRkZTE2ZDEwZmQ5N2I5NDc2NGQwN2Q4Y2I5Y2Q3M2IxNzQwNTdkIn0.QrsoVi_PaK00EcPS3G9KKacbkTNh7VZhT0aQkAF8U2ajldmb2ujBCr-Csv1lOyuVmuPU8bzZRdc0c7baikjdLoZf169xfxvSbcGnOKDg9BGPMqHUA5AmXJGzyy-tufwuPsjnr4WSk13Tpa2-ERmB6FTo0r7pEK8dBXZ4xUH8wDCFR6_erYNo02CYYoEeOrTNZs0RlAziq7s7TJ2pSW-R6c02OntERoWtxXYBctDI8CfrUmpOiQOiMylInQ_558PI_zCBuHkAFjZ42j_sbxyLinawr7U4jYUcplvIo85kBQX984ZtAGTis402xF7DjVsoEXNJcMieA7ccej6hcKnf5g&redirect_url=%2Fadmin%2Fconsole%2F
Server: cloudflare
CF-RAY: a395c4e12bfe76ec-SEA
```

Body fingerprint:
```text
<html> <head><title>302 Found</title></head> <body> <center><h1>302 Found</h1></center> <hr><center>cloudflare</center> </body> </html> 
```

## WQW /admin/ anonymous

- URL: `https://wisequotesworld.com/admin/`
- Mode: `anonymous`
- HTTP: `403`

Relevant response headers:
```text
HTTP/1.1 403 Forbidden
Content-Type: text/html; charset=UTF-8
Cf-Mitigated: challenge
Content-Security-Policy: default-src 'none'; script-src 'nonce-xqEjEZfUkZHFsoIpuy4rFf' 'unsafe-eval' https://challenges.cloudflare.com; script-src-attr 'none'; style-src 'unsafe-inline'; img-src 'self' https://challenges.cloudflare.com; connect-src 'self' https://challenges.cloudflare.com; frame-src 'self' https://challenges.cloudflare.com blob:; child-src 'self' https://challenges.cloudflare.com blob:; worker-src blob:; form-action http: https:; base-uri 'self'
Server: cloudflare
X-Frame-Options: SAMEORIGIN
CF-RAY: a395c4e19e93ad2d-SEA
```

Body fingerprint:
```text
<!DOCTYPE html><html lang="en-US"><head><title>Just a moment...</title><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=Edge"><meta name="robots" content="noindex,nofollow"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="content-security-policy" content="default-src &#39;none&#39;; script-src &#39;nonce-xqEjEZfUkZHFsoIpuy4rFf&#39; &#39;unsafe-eval&#39; https://challenges.cloudflare.com; script-src-attr &#39;none&#39;; style-src &#39;unsafe-inline&#39;; img-src &#39;self&#39; https://challenges.cloudflare.com; connect-src &#39;self&#39; https://challenges.cloudflare.com; frame-src &#39;self&#
```

## SNS /admin/console/ anonymous

- URL: `https://swedennosugar.com/admin/console/`
- Mode: `anonymous`
- HTTP: `302`

Relevant response headers:
```text
HTTP/1.1 302 Found
Content-Type: text/html; charset=UTF-8
Location: https://empty-flower-5659.cloudflareaccess.com/cdn-cgi/access/login/swedennosugar.com?kid=bc49d59f968b1e43fb58ad16f7a44e920e2494cf8df3fe75029c80b77d2b5f29&meta=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IjEwZjljZTQwOTFiNzQ1ZGU0OWFhZDUyOGY0YjU5YjIxMDQyNDg2ODY1MjdhOGM0Y2FlMDhhNjViNmZmYTU5OWMifQ.eyJ0eXBlIjoibWV0YSIsImF1ZCI6ImJjNDlkNTlmOTY4YjFlNDNmYjU4YWQxNmY3YTQ0ZTkyMGUyNDk0Y2Y4ZGYzZmU3NTAyOWM4MGI3N2QyYjVmMjkiLCJob3N0bmFtZSI6InN3ZWRlbm5vc3VnYXIuY29tIiwicmVkaXJlY3RfdXJsIjoiL2FkbWluL2NvbnNvbGUvIiwic2VydmljZV90b2tlbl9zdGF0dXMiOmZhbHNlLCJpc193YXJwIjpmYWxzZSwiaXNfZ2F0ZXdheSI6ZmFsc2UsImV4cCI6MTc4OTEyMDUzNSwibmJmIjoxNzg5MTIwMjM1LCJpYXQiOjE3ODkxMjAyMzUsImF1dGhfc3RhdHVzIjoiTk9ORSIsIm10bHNfYXV0aCI6eyJjZXJ0X2lzc3Vlcl9kbiI6IiIsImNlcnRfc2VyaWFsIjoiIiwiY2VydF9pc3N1ZXJfc2tpIjoiIiwiY2VydF9wcmVzZW50ZWQiOmZhbHNlLCJjb21tb25fbmFtZSI6IiIsImF1dGhfc3RhdHVzIjoiTk9ORSJ9LCJyZWFsX2NvdW50cnkiOiJVUyIsImFwcF9zZXNzaW9uX2hhc2giOiI3YTAzZjAzZmZmZjkzZTIzMWM2M2FhZjlkNmFkNmY3ZTI2YjllMDA5Y2IyNWM3Mjg2ZTdkMzEyMjAxOGE5ODNkIn0.eV6oUOJov87fRlOaMxKkiekl1dtIX5Vc5sB9j1nz2m_wwYJx1-i2FZbzBYK2Lw2YgeUD7JYAK48M9_4bZHQWWLM8G9X0Sy_8EyOrjlK5jbmZdmF_HXMjuK-xclSp_hAz33bO338l7VWSU0RnKnDu3SUuPD8XiaF37F3pi9s0upFeor6qT62jaMEuO0HRkAOIS839SkHy4CvNPwOXCQDxqXeZFh40DE0zpwkguXv6dG5YaKHwXQp7ZU0RLpFVXg6xDvLRPsBpINAwprFwbIcO6G6pFxHB2rF5iOKQpW1tRithAVxe1B6KdR6E6YNn-zuMCl1AMO5Rtescty5m3dxj_Q&redirect_url=%2Fadmin%2Fconsole%2F
Server: cloudflare
CF-RAY: a395c4e1fcca6e7d-SEA
```

Body fingerprint:
```text
<html> <head><title>302 Found</title></head> <body> <center><h1>302 Found</h1></center> <hr><center>cloudflare</center> </body> </html> 
```

Diagnostic complete.
