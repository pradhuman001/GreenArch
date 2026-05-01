# GreenArch Backend

This backend serves the GreenArch frontend and exposes JSON APIs for bookings, contact messages, support requests, authentication, and saved services.

## Run locally

```bash
cd backend
npm install
npm start
```

Then open `http://localhost:3000`.

## API summary

- `GET /api/health`
- `GET /api/services`
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/bookings`
- `GET /api/bookings/me`
- `GET /api/admin/bookings`
- `POST /api/admin/bookings/:id/assign`
- `POST /api/admin/bookings/:id/cancel`
- `POST /api/admin/bookings/:id/reschedule`
- `PATCH /api/admin/bookings/:id/status`
- `DELETE /api/admin/bookings/:id`
- `GET /api/admin/gardeners`
- `POST /api/admin/gardeners/toggle`
- `GET /api/admin/tasks`
- `GET /api/admin/services`
- `POST /api/admin/services`
- `PATCH /api/admin/services/:id`
- `POST /api/admin/services/:id/status`
- `DELETE /api/admin/services/:id`
- `GET /api/admin/analytics`
- `POST /api/admin/reviews/:id/flag`
- `POST /api/admin/reviews/:id/reply`
- `POST /api/contact`
- `POST /api/support`
- `GET /api/saved-services`
- `POST /api/saved-services`
- `DELETE /api/saved-services/:serviceId`
- `GET /api/profile`
- `PUT /api/profile`

## Default admin

- Email: `admin@greenarch.local`
- Password: `Admin@12345`

You can override the default admin password with `ADMIN_PASSWORD` before starting the server.

## Environment variables and payments

- Place runtime secrets in environment variables or in a `.env` file for local development.
- Example file: `backend/.env.example` (contains `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`).
- The server will run without payment gateway keys (payments remain mocked). To enable live
	Razorpay integration, set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in the environment.

IMPORTANT: Never put gateway secrets into frontend files. Keep keys on the server or use a
managed secrets store in production.
