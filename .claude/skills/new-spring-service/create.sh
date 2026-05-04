#!/usr/bin/env bash
set -euo pipefail

SERVICE_NAME=$1

echo "Đang gọi Spring Initializr để tạo $SERVICE_NAME..."

curl https://start.spring.io/starter.tgz \
  -d dependencies=web,data-jpa,postgresql,eureka-client \
  -d type=maven-project \
  -d bootVersion=4.0.0-SNAPSHOT \
  -d javaVersion=17 \
  -d groupId=com.ticketbooking \
  -d artifactId=$SERVICE_NAME \
  -d name=$SERVICE_NAME | tar -xzvf - -C ../../../

echo "Tạo $SERVICE_NAME thành công! Mã nguồn đã được giải nén ra thư mục gốc."