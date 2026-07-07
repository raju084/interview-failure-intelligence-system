# Interview Failure Intelligence System (IFIS)

A career analytics platform that turns interview failures into actionable insights. This repository contains the **Core slice**: User Management (JWT auth + roles), the Interview Tracker, and the Analytics Dashboard (Failure DNA, Career Risk Score, and personalized recommendations).

## Tech Stack

| Layer     | Technology                                              |
| --------- | ------------------------------------------------------- |
| Frontend  | Angular 17 (standalone), Angular Material, RxJS, ng2-charts (Chart.js) |
| Backend   | ASP.NET Core 8 Web API, Entity Framework Core 8         |
| Auth      | JWT bearer tokens, role-based authorization             |
| Database  | SQL Server (LocalDB or full instance)                   |

## Repository Layout

```
backend/
  IFIS.Api/
    Controllers/        AuthController, InterviewsController, DashboardController
    Data/               AppDbContext
    Dtos/               Request/response contracts
    Models/             Entities + enums
    Services/           TokenService, AnalyticsService
    Program.cs          DI, JWT, CORS, EF wiring
    appsettings.json    Connection string + JWT settings

frontend/
  ifis-web/
    src/app/core/       models, services, JWT interceptor, auth guard
    src/app/features/   auth, interviews, dashboard, shell
    src/app/app.routes.ts
```

## Backend — Run Locally

Prerequisites: .NET 8 SDK, SQL Server (LocalDB), and the EF Core CLI tools (`dotnet tool install --global dotnet-ef`).

1. Set the connection string in `backend/IFIS.Api/appsettings.json`.
2. Ensure the `Jwt:Key` is set correctly.
3. Create the database schema:
   ```bash
   cd backend/IFIS.Api
   dotnet ef migrations add InitialCreate
   dotnet ef database update
   ```
4. Run the API:
   ```bash
   dotnet run
   ```
   Swagger UI is available at `https://localhost:7211/swagger`.

## Frontend — Run Locally

Prerequisites: Node.js 18+ and the Angular CLI (`npm install -g @angular/cli`).

1. Install dependencies:
   ```bash
   cd frontend/ifis-web
   npm install
   ```
2. Run the application:
   ```bash
   npm start
   ```

The app runs at `http://localhost:4200`.

## API Surface (Core slice)

| Method | Route                         | Auth      | Purpose                                  |
| ------ | ----------------------------- | --------- | ---------------------------------------- |
| POST   | `/api/auth/register`          | Public    | Create account (Candidate or Mentor)     |
| POST   | `/api/auth/login`             | Public    | Get JWT                                  |
| GET    | `/api/auth/me`                | Bearer    | Current user profile                     |
| GET    | `/api/interviews`             | Bearer    | List the user's interviews               |
| GET    | `/api/interviews/{id}`        | Bearer    | Interview detail (rounds + weaknesses)   |
| POST   | `/api/interviews`             | Bearer    | Create an interview record               |
| PUT    | `/api/interviews/{id}`        | Bearer    | Update an interview                      |
| DELETE | `/api/interviews/{id}`        | Bearer    | Delete an interview                      |
| GET    | `/api/dashboard/summary`      | Bearer    | KPIs, Failure DNA, Career Risk, trends   |

## Analytics Logic

The intelligence layer is located in `backend/IFIS.Api/Services/AnalyticsService.cs`. It computes:

- **Failure DNA** — aggregates weakness tags into weighted percentages.
- **Career Risk Score** — combines rejection frequency, recent inactivity, and outcome trend.
- **Recommendations** — prioritized improvement suggestions based on weaknesses.
