Hướng dẫn làm việc:

1. Clone project
2. Tạo nhánh tính năng mới từ nhánh dev
3. Code tính năng trên nhánh mới tạo đó (Trước khi code phải đọc hướng dẫn chạy Server bên dưới)
4. Sau khi code xong, commit code và push nhánh mới lên repo
5. Tạo Pull Request từ nhánh mới -> nhánh dev, để reviewer là phamvandung6 (Tôi sẽ check code và merge sau)

Chạy Server:
I. Chạy bằng môi trường docker

1. Cài đặt môi trường ảo python (Tôi hay dùng .venv)
2. Cài đặt các dependencies: `pip install -r requirements.txt`
3. Kích hoạt môi trường ảo (Tùy hệ điều hành)
   - Linux/MacOS: `source .venv/bin/activate`
   - Windows: `.venv\Scripts\activate.bat`
4. Chạy project: `docker-compose up --build`
5. Truy cập API: `http://localhost:8000/api/docs`

II. Chạy bằng môi trường local

1. Cài đặt môi trường ảo python (Tôi hay dùng .venv)
2. Cài đặt các dependencies: `pip install -r requirements.txt`
3. Kích hoạt môi trường ảo (Tùy hệ điều hành)
   - Linux/MacOS: `source .venv/bin/activate`
   - Windows: `.venv\Scripts\activate.bat`
4. Chạy project: `uvicorn main:app --reload` hoặc `fastapi dev main.py`
5. Truy cập API: `http://localhost:8000/api/docs`
