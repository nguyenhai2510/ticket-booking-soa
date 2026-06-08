# Bước 1: Build ứng dụng (Build stage)
# Sử dụng Maven kèm Java 25 của Eclipse Temurin
FROM maven:3.9-eclipse-temurin-25 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
# Build ra file .jar và bỏ qua bước test để quá trình deploy nhanh hơn
RUN mvn clean package -DskipTests

# Bước 2: Chạy ứng dụng (Run stage)
# Sử dụng JRE 25 bản Alpine siêu nhẹ để tối ưu dung lượng và RAM trên Render
FROM eclipse-temurin:25-jre-alpine
WORKDIR /app
# Copy file .jar đã build từ stage trước sang
COPY --from=build /app/target/*.jar app.jar

# Expose port mặc định của Spring Boot
EXPOSE 8080

# Lệnh khởi chạy ứng dụng
ENTRYPOINT ["java", "-jar", "app.jar"]