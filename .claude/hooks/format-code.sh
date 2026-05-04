#!/usr/bin/env bash
FILE_PATH=$1

# Kiểm tra nếu file vừa sửa là file Java
if [[ "$FILE_PATH" == *.java ]]; then
    # Di chuyển vào thư mục chứa file đó và chạy một lệnh format giả định
    # Trong thực tế, bạn có thể tích hợp spotless plugin của Maven vào đây
    echo "Running auto-format on $FILE_PATH..." >&2
    # Ví dụ: ./mvnw spotless:apply -DspotlessFiles=$FILE_PATH >/dev/null 2>&1 || true
fi