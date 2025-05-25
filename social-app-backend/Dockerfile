FROM python:3.10-slim

WORKDIR /backend

# Cài đặt netcat và postgresql-client
RUN apt-get update && \
    apt-get install -y netcat-openbsd postgresql-client && \
    rm -rf /var/lib/apt/lists/*

# Cài đặt watchdog cho development
RUN pip install watchdog[watchmedo]

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Đảm bảo line endings là LF và cấp quyền thực thi
RUN chmod 755 /backend/entrypoint.sh && \
    sed -i 's/\r$//' /backend/entrypoint.sh

# Development entrypoint
COPY entrypoint.dev.sh /backend/entrypoint.dev.sh
RUN chmod 755 /backend/entrypoint.dev.sh

# Sử dụng đường dẫn tuyệt đối cho entrypoint script
CMD ["/bin/bash", "/backend/entrypoint.sh"]