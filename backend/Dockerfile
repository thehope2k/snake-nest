FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN ./mvnw -q -B dependency:go-offline

COPY src/ src/
RUN ./mvnw -q -B -DskipTests package && \
    mv target/*.jar target/app.jar

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN addgroup -S nest && adduser -S nest -G nest
USER nest

COPY --from=build /app/target/app.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
