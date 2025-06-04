# Trucking Interconecta

Trucking Interconecta is a simple management system for planning and tracking
freight trips. The project consists of a React front‑end and a Node.js
back‑end (not included in this repository) that exposes a REST API.

## Installation

### Front‑end

```bash
npm install
```

### Back‑end

Clone the server repository or go to the `backend/` directory if it exists and
install the dependencies:

```bash
cd backend
npm install
```

## Running the application

### Front‑end dev server

```bash
npm start
```

The React app will be available at <http://localhost:3000>.

### Back‑end API server

```bash
cd backend
npm start
```

By default the API runs on <http://localhost:4000>.

## Environment variables

Front‑end:

- `REACT_APP_API_URL` – URL of the back‑end API (e.g. `http://localhost:4000/api`).

Back‑end:

- `PORT` – port number for the API server.
- `DATABASE_URL` – connection string for the database.
- `JWT_SECRET` – secret used to sign authentication tokens.

## API usage examples

### Authenticate

```bash
curl -X POST $REACT_APP_API_URL/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com","password":"secret"}'
```

The response contains a JSON Web Token that must be sent in subsequent
requests.

### Create a trip

```bash
curl -X POST $REACT_APP_API_URL/trips \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"origin":"City A","destination":"City B","driverId":1,"truckId":2}'
```

## Tests

Run the React tests with:

```bash
npm test -- --watchAll=false
```
