# Cloudflare edge diagnostic — 2026-09-15

Current production probes from the same GitHub Actions runner.

## WQW public /en/ anonymous

- URL: `https://wisequotesworld.com/en/`
- Mode: `anonymous`
- HTTP: `403`

Relevant response headers:
```text
HTTP/1.1 403 Forbidden
Content-Type: text/html; charset=UTF-8
Cf-Mitigated: challenge
Content-Security-Policy: default-src 'none'; script-src 'nonce-hgo36xT9Lv6h7pQarAseCP' 'unsafe-eval' https://challenges.cloudflare.com; script-src-attr 'none'; style-src 'unsafe-inline'; img-src 'self' https://challenges.cloudflare.com; connect-src 'self' https://challenges.cloudflare.com; frame-src 'self' https://challenges.cloudflare.com blob:; child-src 'self' https://challenges.cloudflare.com blob:; worker-src blob:; form-action http: https:; base-uri 'self'
Server: cloudflare
X-Frame-Options: SAMEORIGIN
CF-RAY: a3b3b463282ee5b3-YYZ
```

Body fingerprint:
```text
<!DOCTYPE html><html lang="en-US"><head><title>Just a moment...</title><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=Edge"><meta name="robots" content="noindex,nofollow"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="content-security-policy" content="default-src &#39;none&#39;; script-src &#39;nonce-hgo36xT9Lv6h7pQarAseCP&#39; &#39;unsafe-eval&#39; https://challenges.cloudflare.com; script-src-attr &#39;none&#39;; style-src &#39;unsafe-inline&#39;; img-src &#39;self&#39; https://challenges.cloudflare.com; connect-src &#39;self&#39; https://challenges.cloudflare.com; frame-src &#39;self&#
```

## WQW public /en/start/ anonymous

- URL: `https://wisequotesworld.com/en/start/`
- Mode: `anonymous`
- HTTP: `403`

Relevant response headers:
```text
HTTP/1.1 403 Forbidden
Content-Type: text/html; charset=UTF-8
Cf-Mitigated: challenge
Content-Security-Policy: default-src 'none'; script-src 'nonce-0XQbur7VwDWsrjMRLF0uRN' 'unsafe-eval' https://challenges.cloudflare.com; script-src-attr 'none'; style-src 'unsafe-inline'; img-src 'self' https://challenges.cloudflare.com; connect-src 'self' https://challenges.cloudflare.com; frame-src 'self' https://challenges.cloudflare.com blob:; child-src 'self' https://challenges.cloudflare.com blob:; worker-src blob:; form-action http: https:; base-uri 'self'
Server: cloudflare
X-Frame-Options: SAMEORIGIN
CF-RAY: a3b3b463acfeac1e-YYZ
```

Body fingerprint:
```text
<!DOCTYPE html><html lang="en-US"><head><title>Just a moment...</title><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=Edge"><meta name="robots" content="noindex,nofollow"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="content-security-policy" content="default-src &#39;none&#39;; script-src &#39;nonce-0XQbur7VwDWsrjMRLF0uRN&#39; &#39;unsafe-eval&#39; https://challenges.cloudflare.com; script-src-attr &#39;none&#39;; style-src &#39;unsafe-inline&#39;; img-src &#39;self&#39; https://challenges.cloudflare.com; connect-src &#39;self&#39; https://challenges.cloudflare.com; frame-src &#39;self&#
```

## WQW /admin/ with service token

- URL: `https://wisequotesworld.com/admin/`
- Mode: `service`
- HTTP: `403`

Relevant response headers:
```text
HTTP/1.1 403 Forbidden
Content-Type: text/html; charset=UTF-8
Cf-Mitigated: challenge
Content-Security-Policy: default-src 'none'; script-src 'nonce-xZrP4PiOuRaDbzk0y6iEvA' 'unsafe-eval' https://challenges.cloudflare.com; script-src-attr 'none'; style-src 'unsafe-inline'; img-src 'self' https://challenges.cloudflare.com; connect-src 'self' https://challenges.cloudflare.com; frame-src 'self' https://challenges.cloudflare.com blob:; child-src 'self' https://challenges.cloudflare.com blob:; worker-src blob:; form-action http: https:; base-uri 'self'
Server: cloudflare
X-Frame-Options: SAMEORIGIN
CF-RAY: a3b3b4642b219108-YYZ
```

Body fingerprint:
```text
<!DOCTYPE html><html lang="en-US"><head><title>Just a moment...</title><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=Edge"><meta name="robots" content="noindex,nofollow"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="content-security-policy" content="default-src &#39;none&#39;; script-src &#39;nonce-xZrP4PiOuRaDbzk0y6iEvA&#39; &#39;unsafe-eval&#39; https://challenges.cloudflare.com; script-src-attr &#39;none&#39;; style-src &#39;unsafe-inline&#39;; img-src &#39;self&#39; https://challenges.cloudflare.com; connect-src &#39;self&#39; https://challenges.cloudflare.com; frame-src &#39;self&#
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
Content-Security-Policy: default-src 'none'; script-src 'nonce-9fkFTWGJzLsnX2xalEdIdT' 'unsafe-eval' https://challenges.cloudflare.com; script-src-attr 'none'; style-src 'unsafe-inline'; img-src 'self' https://challenges.cloudflare.com; connect-src 'self' https://challenges.cloudflare.com; frame-src 'self' https://challenges.cloudflare.com blob:; child-src 'self' https://challenges.cloudflare.com blob:; worker-src blob:; form-action http: https:; base-uri 'self'
Server: cloudflare
X-Frame-Options: SAMEORIGIN
CF-RAY: a3b3b464dc0aaa9a-YYZ
```

Body fingerprint:
```text
<!DOCTYPE html><html lang="en-US"><head><title>Just a moment...</title><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=Edge"><meta name="robots" content="noindex,nofollow"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="content-security-policy" content="default-src &#39;none&#39;; script-src &#39;nonce-9fkFTWGJzLsnX2xalEdIdT&#39; &#39;unsafe-eval&#39; https://challenges.cloudflare.com; script-src-attr &#39;none&#39;; style-src &#39;unsafe-inline&#39;; img-src &#39;self&#39; https://challenges.cloudflare.com; connect-src &#39;self&#39; https://challenges.cloudflare.com; frame-src &#39;self&#
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
Content-Security-Policy: default-src 'none'; script-src 'nonce-IMHMCDF1RHayrCB4tnzjgX' 'unsafe-eval' https://challenges.cloudflare.com; script-src-attr 'none'; style-src 'unsafe-inline'; img-src 'self' https://challenges.cloudflare.com; connect-src 'self' https://challenges.cloudflare.com; frame-src 'self' https://challenges.cloudflare.com blob:; child-src 'self' https://challenges.cloudflare.com blob:; worker-src blob:; form-action http: https:; base-uri 'self'
Server: cloudflare
X-Frame-Options: SAMEORIGIN
CF-RAY: a3b3b4655b218e83-YYZ
```

Body fingerprint:
```text
<!DOCTYPE html><html lang="en-US"><head><title>Just a moment...</title><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=Edge"><meta name="robots" content="noindex,nofollow"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="content-security-policy" content="default-src &#39;none&#39;; script-src &#39;nonce-IMHMCDF1RHayrCB4tnzjgX&#39; &#39;unsafe-eval&#39; https://challenges.cloudflare.com; script-src-attr &#39;none&#39;; style-src &#39;unsafe-inline&#39;; img-src &#39;self&#39; https://challenges.cloudflare.com; connect-src &#39;self&#39; https://challenges.cloudflare.com; frame-src &#39;self&#
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
Content-Security-Policy: default-src 'none'; script-src 'nonce-9LcREAhgypohThERYcWMiL' 'unsafe-eval' https://challenges.cloudflare.com; script-src-attr 'none'; style-src 'unsafe-inline'; img-src 'self' https://challenges.cloudflare.com; connect-src 'self' https://challenges.cloudflare.com; frame-src 'self' https://challenges.cloudflare.com blob:; child-src 'self' https://challenges.cloudflare.com blob:; worker-src blob:; form-action http: https:; base-uri 'self'
Server: cloudflare
X-Frame-Options: SAMEORIGIN
CF-RAY: a3b3b465dd5834dc-YYZ
```

Body fingerprint:
```text
<!DOCTYPE html><html lang="en-US"><head><title>Just a moment...</title><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=Edge"><meta name="robots" content="noindex,nofollow"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="content-security-policy" content="default-src &#39;none&#39;; script-src &#39;nonce-9LcREAhgypohThERYcWMiL&#39; &#39;unsafe-eval&#39; https://challenges.cloudflare.com; script-src-attr &#39;none&#39;; style-src &#39;unsafe-inline&#39;; img-src &#39;self&#39; https://challenges.cloudflare.com; connect-src &#39;self&#39; https://challenges.cloudflare.com; frame-src &#39;self&#
```

## SNS /admin/console/ with service token

- URL: `https://swedennosugar.com/admin/console/`
- Mode: `service`
- HTTP: `302`

Relevant response headers:
```text
HTTP/1.1 302 Found
Content-Type: text/html; charset=UTF-8
Location: https://empty-flower-5659.cloudflareaccess.com/cdn-cgi/access/login/swedennosugar.com?kid=bc49d59f968b1e43fb58ad16f7a44e920e2494cf8df3fe75029c80b77d2b5f29&meta=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IjEwZjljZTQwOTFiNzQ1ZGU0OWFhZDUyOGY0YjU5YjIxMDQyNDg2ODY1MjdhOGM0Y2FlMDhhNjViNmZmYTU5OWMifQ.eyJ0eXBlIjoibWV0YSIsImF1ZCI6ImJjNDlkNTlmOTY4YjFlNDNmYjU4YWQxNmY3YTQ0ZTkyMGUyNDk0Y2Y4ZGYzZmU3NTAyOWM4MGI3N2QyYjVmMjkiLCJob3N0bmFtZSI6InN3ZWRlbm5vc3VnYXIuY29tIiwicmVkaXJlY3RfdXJsIjoiL2FkbWluL2NvbnNvbGUvIiwic2VydmljZV90b2tlbl9zdGF0dXMiOmZhbHNlLCJpc193YXJwIjpmYWxzZSwiaXNfZ2F0ZXdheSI6ZmFsc2UsImV4cCI6MTc4OTQzNDQzMywibmJmIjoxNzg5NDM0MTMzLCJpYXQiOjE3ODk0MzQxMzMsImF1dGhfc3RhdHVzIjoiTk9ORSIsIm10bHNfYXV0aCI6eyJjZXJ0X2lzc3Vlcl9kbiI6IiIsImNlcnRfc2VyaWFsIjoiIiwiY2VydF9pc3N1ZXJfc2tpIjoiIiwiY2VydF9wcmVzZW50ZWQiOmZhbHNlLCJjb21tb25fbmFtZSI6IiIsImF1dGhfc3RhdHVzIjoiTk9ORSJ9LCJyZWFsX2NvdW50cnkiOiJVUyIsImFwcF9zZXNzaW9uX2hhc2giOiJjZTBmOGE1MjRhNTM3YjZlN2EwM2ZkZjQyMjEzYzZkMWE5MmY1YzQ5MmVhMzY1Mjk5YmI3NGY2YzI2NmQyNmI0In0.Re597uNvAgDqIg3OU4wlomTsb55_Rh1e76b82u80M8uPsURLXmcohvc-g0OEfMdnO4tNKiyUagesftSL3Ton46q2BLsZKDqR48wGGOow0PlH2RvFJtDxA4A1Zgy4r4vyZjuW0oWbOo0XmzzcIdY1hfE9W-IN5jCsRWss7kns-j119LW6Nw9a3EBMF6iICcs4p1E2gZnpqtCBuYzupzeliG2hbC4Uf8vTIMg3og6n8IE3dlOrJEhNqHm8cakberSt6aS-lAx89qXWq7lDvu-uDJRK00qfr6DhUrkKwX1acDChj2ure48MnBa81uFEMASd8qY51kWJmtwRhkacvRSfzQ&redirect_url=%2Fadmin%2Fconsole%2F
Server: cloudflare
CF-RAY: a3b3b466d9b436b3-YYZ
```

Body fingerprint:
```text
<html> <head><title>302 Found</title></head> <body> <center><h1>302 Found</h1></center> <hr><center>cloudflare</center> </body> </html> 
```

## SNS /admin/console/ anonymous

- URL: `https://swedennosugar.com/admin/console/`
- Mode: `anonymous`
- HTTP: `302`

Relevant response headers:
```text
HTTP/1.1 302 Found
Content-Type: text/html; charset=UTF-8
Location: https://empty-flower-5659.cloudflareaccess.com/cdn-cgi/access/login/swedennosugar.com?kid=bc49d59f968b1e43fb58ad16f7a44e920e2494cf8df3fe75029c80b77d2b5f29&meta=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IjEwZjljZTQwOTFiNzQ1ZGU0OWFhZDUyOGY0YjU5YjIxMDQyNDg2ODY1MjdhOGM0Y2FlMDhhNjViNmZmYTU5OWMifQ.eyJ0eXBlIjoibWV0YSIsImF1ZCI6ImJjNDlkNTlmOTY4YjFlNDNmYjU4YWQxNmY3YTQ0ZTkyMGUyNDk0Y2Y4ZGYzZmU3NTAyOWM4MGI3N2QyYjVmMjkiLCJob3N0bmFtZSI6InN3ZWRlbm5vc3VnYXIuY29tIiwicmVkaXJlY3RfdXJsIjoiL2FkbWluL2NvbnNvbGUvIiwic2VydmljZV90b2tlbl9zdGF0dXMiOmZhbHNlLCJpc193YXJwIjpmYWxzZSwiaXNfZ2F0ZXdheSI6ZmFsc2UsImV4cCI6MTc4OTQzNDQzMywibmJmIjoxNzg5NDM0MTMzLCJpYXQiOjE3ODk0MzQxMzMsImF1dGhfc3RhdHVzIjoiTk9ORSIsIm10bHNfYXV0aCI6eyJjZXJ0X2lzc3Vlcl9kbiI6IiIsImNlcnRfc2VyaWFsIjoiIiwiY2VydF9pc3N1ZXJfc2tpIjoiIiwiY2VydF9wcmVzZW50ZWQiOmZhbHNlLCJjb21tb25fbmFtZSI6IiIsImF1dGhfc3RhdHVzIjoiTk9ORSJ9LCJyZWFsX2NvdW50cnkiOiJVUyIsImFwcF9zZXNzaW9uX2hhc2giOiJjYTBlOGJjZmI5N2Q3MWYwZTMzZDk5NTUyODdhOWUzZGE4MTYxZjBiOTQ4NDkwMTg0NzZjOWY5M2E0OTVhN2IzIn0.g_ehnAGO0DXRtyZtjHXKkri3eofWKv_z2nUB0URaageGmOfWbRheTbBrj7RcChchz-6nVUkqXJzWQhOaNFs3OeTkEVh2rn37j5zYRmCmrogwpXRmw_1wbudV-p3Fbl8KJ_MFeCol44uoLPH_CssNDwxqBtfUqr1F1IhgLyaD1s4XzZpkjk1306wOUgtieHtiCqu07DEv9tMXSa-2oOtEdS45oOqOv_ZhiLs4pKF_JAD1i58ZasghxQRGhVLpeNQe4fPQBfs6QNXGOBIN0zPZNItw8FcSd4ugnaYTJFwFvHiLpNa5VH6IqFDosJRZyNmrTSeGcsXuLKRvO-A-QojmbQ&redirect_url=%2Fadmin%2Fconsole%2F
Server: cloudflare
CF-RAY: a3b3b4677c8936c2-YYZ
```

Body fingerprint:
```text
<html> <head><title>302 Found</title></head> <body> <center><h1>302 Found</h1></center> <hr><center>cloudflare</center> </body> </html> 
```

Diagnostic complete.
