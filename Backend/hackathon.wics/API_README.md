# WICS Backend API

Frontend integration guide for the deployed backend.

Base URL:

```text
https://<your-backend-host>
```

Local URL:

```text
http://localhost:8080
```

## Auth model

This backend uses a cookie-based session.

- Login sets an `auth` cookie
- Protected endpoints require that cookie on later requests
- Frontend requests must use `credentials: "include"`
- Cookie attributes currently include `HttpOnly`, `Secure`, `SameSite=None`, and `Partitioned`

Example frontend fetch:

```js
fetch(`${BASE_URL}/api/posts`, {
  method: "GET",
  credentials: "include"
});
```

## Status code notes

- `200 OK`: success
- `201 Created`: resource created
- `204 No Content`: delete success
- `401 Unauthorized`: invalid or expired session cookie
- `403 Forbidden`: request is missing authentication for a protected route
- `404 Not Found`: resource not found

Current error shape for handled `404`s:

```json
{
  "timestamp": "2026-03-22T08:00:00Z",
  "status": 404,
  "errorMsg": "Resource not found"
}
```

## Public vs protected endpoints

Public endpoints:

- `POST /api/users`
- `POST /api/users/login`

Protected endpoints:

- everything else in this file

## Users

### Create user

`POST /api/users`

Request body:

```json
{
  "email": "name@example.com",
  "username": "birdlover",
  "password": "secret123"
}
```

Success response:

- Status: `200 OK`
- Body: empty

Frontend note:

- This route does not log the user in automatically
- Call login after creating the account

### Login

`POST /api/users/login`

Request body:

```json
{
  "username": "birdlover",
  "password": "secret123"
}
```

Success response:

- Status: `200 OK`
- Body:

```json
"login successful"
```

Response headers:

- `Set-Cookie: auth=...; Path=/; HttpOnly; Secure; SameSite=None; Partitioned`

Frontend note:

- Always send `credentials: "include"` on login and every protected request after login

### Get user by ID

`GET /api/users/{id}`

Auth required: yes

Path params:

- `id`: user UUID

Success response:

```json
{
  "id": "93f7a3b8-8f32-4d18-b5c0-6c4f492a7a4a",
  "email": "name@example.com",
  "username": "birdlover",
  "password": "$2a$10$hashed-value",
  "points": 0
}
```

Important note:

- As currently implemented, this endpoint returns the `password` field too
- Frontend should ignore that field

### Delete user

`DELETE /api/users/{id}`

Auth required: yes

Success response:

- Status: `204 No Content`
- Body: empty

## Posts

### Get all posts

`GET /api/posts`

Auth required: yes

Success response:

```json
[
  {
    "postId": "74db17a1-687a-47e7-afcd-22505dd32f8d",
    "imageUrl": "https://storage.googleapis.com/...",
    "contentType": "image/jpeg",
    "latitude": 30.4515,
    "longitude": -91.1871
  }
]
```

### Get post by ID

`GET /api/posts/{id}`

Auth required: yes

Path params:

- `id`: post UUID

Success response:

```json
{
  "postId": "74db17a1-687a-47e7-afcd-22505dd32f8d",
  "imageUrl": "https://storage.googleapis.com/...",
  "contentType": "image/jpeg",
  "latitude": 30.4515,
  "longitude": -91.1871
}
```

### Get my posts

`GET /api/posts/user/me`

Auth required: yes

Success response:

```json
[
  {
    "postId": "74db17a1-687a-47e7-afcd-22505dd32f8d",
    "imageUrl": "https://storage.googleapis.com/...",
    "contentType": "image/jpeg",
    "latitude": 30.4515,
    "longitude": -91.1871
  }
]
```

### Get my posts by species

`GET /api/posts/posts/species/{species}`

Auth required: yes

Path params:

- `species`: species name string

Example:

```text
/api/posts/posts/species/Blue%20Jay
```

Success response:

```json
[
  {
    "postId": "74db17a1-687a-47e7-afcd-22505dd32f8d",
    "imageUrl": "https://storage.googleapis.com/...",
    "contentType": "image/jpeg",
    "latitude": 30.4515,
    "longitude": -91.1871
  }
]
```

### Create post

`POST /api/posts`

Auth required: yes

Content type:

```text
multipart/form-data
```

Form fields:

- `latitude`: number
- `longtitude`: number
- `file`: image file

Example using `FormData`:

```js
const formData = new FormData();
formData.append("latitude", 30.4515);
formData.append("longtitude", -91.1871);
formData.append("file", fileInput.files[0]);

fetch(`${BASE_URL}/api/posts`, {
  method: "POST",
  credentials: "include",
  body: formData
});
```

Success response:

- Status: `201 Created`

```json
{
  "postId": "74db17a1-687a-47e7-afcd-22505dd32f8d",
  "imageUrl": "https://storage.googleapis.com/...",
  "contentType": "image/jpeg",
  "latitude": 30.4515,
  "longitude": -91.1871
}
```

Frontend note:

- `imageUrl` is already a signed URL ready to display in an `<img>` tag

### Delete post

`DELETE /api/posts/{id}`

Auth required: yes

Path params:

- `id`: post UUID

Success response:

- Status: `204 No Content`
- Body: empty

## Species

### Get species info by post ID

`GET /api/species/post/{id}`

Auth required: yes

Path params:

- `id`: post UUID

Success response:

```json
{
  "name": "Blue Jay",
  "weightRange": "70g - 100g",
  "description": "Example description",
  "geography": "North America",
  "rarity": "Common"
}
```

Frontend note:

- This route looks up the species attached to a post, then expands it using the bird info registry
- The path parameter is the post ID, not the species ID

### Delete species

`DELETE /api/species/{id}`

Auth required: yes

Path params:

- `id`: species UUID

Success response:

- Status: `204 No Content`
- Body: empty

## Bird species registry

### Get all bird species

`GET /api/birds`

Auth required: yes

Success response:

```json
[
  {
    "name": "Blue Jay",
    "rarity": 1,
    "location": "North America"
  }
]
```

### Get bird species by name

`GET /api/birds/{name}`

Auth required: yes

Path params:

- `name`: bird name string

Example:

```text
/api/birds/Blue%20Jay
```

Success response:

```json
{
  "name": "Blue Jay",
  "rarity": 1,
  "location": "North America"
}
```

### Delete bird species by name

`DELETE /api/birds/{name}`

Auth required: yes

Success response:

- Status: `204 No Content`
- Body: empty

## Frontend implementation checklist

- Use the production base URL or local base URL depending on environment
- Send `credentials: "include"` on login and all protected requests
- Use `multipart/form-data` for post creation
- Treat `imageUrl` in post responses as a direct display URL
- URL-encode path params like species names, bird names, and post IDs passed in URLs
- Expect empty bodies for some successful actions like create user and deletes
- Handle `401`, `403`, and `404` in UI

## Recommended frontend flow

1. `POST /api/users`
2. `POST /api/users/login`
3. `GET /api/posts/user/me` or `POST /api/posts`
4. `GET /api/species/post/{postId}` or `GET /api/posts`

## Test page

If you package the included tester page with the backend, it can be served from:

```text
/index.html
```

That page defaults to the current host at runtime, so it does not need a hardcoded production base URL.
