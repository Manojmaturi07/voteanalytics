# VoteAnalytics Backend (Spring Boot 3 + MySQL 8)

Production-ready backend for the **VoteAnalytics** platform, providing JWT authentication, role-based access control, multi-tenant administrator poll isolation, transactional voting with duplicate-vote prevention, real-time analytics, comments, bookmarks, email verification, and two-factor authentication (2FA).

---

## 1. Prerequisites

- **Java JDK 21** or 17 (verified with `java -version`)
- **Maven 3.9+** (or use `./mvnw`)
- **MySQL 8.0+** running on `localhost:3306`

---

## 2. Database Setup

1. Start your local MySQL service.
2. Log in to MySQL and run the database initialization script:
   ```bash
   mysql -u root -p < src/main/resources/schema.sql
   ```
   Or create the database manually:
   ```sql
   CREATE DATABASE IF NOT EXISTS voteanalytics_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. Hibernate is configured with `ddl-auto=update`, which will automatically create and update tables on startup if they don't already exist.
4. On initial startup, `DataInitializer.java` will automatically seed default accounts:
   - **Admin:** `admin` / `admin123` (Role: ADMIN)
   - **Voter 1:** `john_doe` / `user123` (Role: USER)
   - **Voter 2:** `jane_smith` / `user123` (Role: USER)

---

## 3. Configuration

Configuration is located in `src/main/resources/application.properties`. You can override properties via environment variables or a `.env` file (see `.env.example`).

Key settings:
| Property | Default | Description |
|---|---|---|
| `server.port` | `8080` | Port for the backend REST server |
| `server.servlet.context-path` | `/api` | Base path for all endpoints |
| `DB_URL` | `jdbc:mysql://localhost:3306/voteanalytics_db...` | MySQL JDBC URL |
| `DB_USERNAME` | `root` | Database username |
| `DB_PASSWORD` | `root` | Database password |
| `JWT_SECRET` | `(64-char key)` | HMAC-SHA secret for signing JWTs |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173,http://localhost:3000` | Allowed frontend origins |

---

## 4. Building and Running

### Build JAR:
```bash
mvn clean package -DskipTests
```

### Run Backend Application:
```bash
java -jar target/voteanalytics-backend-1.0.0.jar
```
Or via Maven:
```bash
mvn spring-boot:run
```

The application will start on:
- **Base URL:** `http://localhost:8080/api`
- **Swagger OpenAPI UI:** `http://localhost:8080/api/swagger-ui.html`
- **OpenAPI JSON Docs:** `http://localhost:8080/api/v3/api-docs`

---

## 5. API Documentation & Postman

- **Swagger UI:** Navigate to `http://localhost:8080/api/swagger-ui.html` to explore interactive API documentation.
- **Postman Collection:** Import `VoteAnalytics_Postman_Collection.json` into Postman to test authentication, polling, voting, and analytics requests.

---

## 6. Architecture & Security Highlights

1. **Multi-Tenant Admin Isolation:**
   - Polls created by Admin A are strictly visible only to Admin A via `/api/polls/admin/my-polls`.
   - Modifying or deleting another admin's poll returns `403 Forbidden`.
   - Individual voting details via `/api/polls/{id}/voting-details` are restricted to the poll's creator admin.

2. **Transactional Duplicate-Vote Prevention:**
   - Single-vote idempotency is guaranteed by an atomic MySQL unique constraint: `CONSTRAINT uk_vote_user_poll UNIQUE (user_id, poll_id)`.
   - Voting transactions verify user state, poll lock status, and deadline expiration.

3. **Stateless JWT Security:**
   - Bearer access tokens with short TTL and database-persisted refresh tokens.
   - BCrypt hashing with salt rounds = 10.
