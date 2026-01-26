# Database migrations & Docker test

## Migration layout

- **`backend/src/database/migrations/`**
  - `001_update_team_members.sql` – Thêm cột `updated_at`, `left_by` vào `team_members`.
- **`backend/src/database/mysql/`**
  - `run_complete_setup.sh` – Setup đầy đủ schema (chạy local, mysql localhost).
  - `run_complete_setup_docker.sh` – Cùng nội dung, dùng biến môi trường để chạy trong Docker (kết nối tới service `mysql`).

## Chạy migration qua Docker

### 1. Migrate service

Stack có service `migrate`:

1. Đợi MySQL healthy.
2. Chạy `run_complete_setup_docker.sh` (tạo DB, bảng, seed admin, v.v.).
3. Chạy `001_update_team_members.sql`.
4. Tạo file marker `migration_done` để backend biết migration đã xong.

### 2. Thứ tự khởi động

```
mysql (healthy) → migrate (chạy xong rồi thoát) → backend (đợi marker rồi start)
```

Backend `docker-entrypoint.sh` đợi xuất hiện `/migration_done/done` (tối đa 180s) rồi mới chạy app.

### 3. Chạy toàn bộ stack và test

```bash
# Dùng docker-compose hoặc docker compose
./scripts/docker-test.sh
```

Script sẽ:

1. `down` stack cũ (nếu có).
2. `up` MySQL, đợi healthy.
3. `run --rm migrate` (chạy migration tới khi xong).
4. `up` backend + frontend.
5. Đợi backend healthy, gọi `/api/v1/auth/health` và login thử.

### 4. Chạy thủ công

```bash
# Khởi động MySQL
docker compose up -d mysql   # hoặc docker-compose

# Đợi MySQL sẵn sàng, rồi chạy migration
docker compose run --rm migrate

# Khởi động backend + frontend
docker compose up -d backend frontend
```

### 5. Chỉ chạy migration (MySQL đã chạy sẵn)

```bash
docker compose run --rm migrate
```

## Biến môi trường cho migrate

| Biến | Mặc định | Mô tả |
|------|----------|--------|
| `MYSQL_HOST` | `mysql` | Host MySQL (tên service trong Docker). |
| `MYSQL_PORT` | `3306` | Port MySQL. |
| `MYSQL_USER` | `root` | User MySQL. |
| `MYSQL_PASSWORD` | `password` | Mật khẩu. |
| `MYSQL_DATABASE` | `cybersecure_db` | Database. |
| `MIGRATIONS_DIR` | `/migrations` | Thư mục chứa file migration (mount từ `backend/.../migrations`). |
| `MYSQL_SCRIPTS_DIR` | `/scripts` | Thư mục chứa `run_complete_setup_docker.sh` (mount từ `backend/.../mysql`). |
| `MIGRATION_DONE_FILE` | `/migration_done/done` | File marker báo migration xong. |

## Chạy migration local (không Docker)

Cần `mysql` client và MySQL đang chạy (ví dụ localhost:3307):

```bash
cd backend
export MYSQL_HOST=localhost MYSQL_PORT=3307 MYSQL_USER=root MYSQL_PASSWORD=password MYSQL_DATABASE=cybersecure_db
./scripts/wait-for-mysql.sh
mysql -h $MYSQL_HOST -P $MYSQL_PORT -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE < src/database/migrations/001_update_team_members.sql
```

Schema đầy đủ (tạo mới DB + bảng): chạy `run_complete_setup.sh` (sửa `mysql -u root -ppassword` cho đúng host/port nếu cần).

## Tài khoản mẫu sau migration

- **Admin:** `admin@cybersecure.local` / `Admin@123456`
- Database: `cybersecure_db`
- MySQL (Docker): `localhost:3307`, user `root`, password `password`
