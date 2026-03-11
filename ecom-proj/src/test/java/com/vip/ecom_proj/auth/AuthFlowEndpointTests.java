package com.vip.ecom_proj.auth;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class AuthFlowEndpointTests {

    @LocalServerPort
    int port;

    private final ObjectMapper mapper = new ObjectMapper();

    private HttpResponse<String> postJson(String path, String json) throws Exception {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:" + port + path))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();
        return client.send(request, HttpResponse.BodyHandlers.ofString());
    }

    @Test
    void signupThenLoginReturnsJwtAndCustomerRole() throws Exception {
        String email = "user" + System.currentTimeMillis() + "@test.local";
        String signupJson = "{\"name\":\"Test User\",\"email\":\"" + email + "\",\"password\":\"password123\",\"phone\":\"123\"}";

        HttpResponse<String> signup = postJson("/api/auth/signup", signupJson);
        assertThat(signup.statusCode()).isEqualTo(200);

        JsonNode signupBody = mapper.readTree(signup.body());
        assertThat(signupBody.get("token").asText()).isNotBlank();
        assertThat(signupBody.get("user").get("role").asText()).isEqualTo("CUSTOMER");

        String loginJson = "{\"email\":\"" + email + "\",\"password\":\"password123\"}";
        HttpResponse<String> login = postJson("/api/auth/login", loginJson);
        assertThat(login.statusCode()).isEqualTo(200);

        JsonNode loginBody = mapper.readTree(login.body());
        assertThat(loginBody.get("token").asText()).isNotBlank();
        assertThat(loginBody.get("user").get("email").asText()).isEqualTo(email);
    }

    @Test
    void duplicateSignupReturnsConflict() throws Exception {
        String email = "dup" + System.currentTimeMillis() + "@test.local";
        String signupJson = "{\"name\":\"Test\",\"email\":\"" + email + "\",\"password\":\"password123\"}";

        HttpResponse<String> first = postJson("/api/auth/signup", signupJson);
        assertThat(first.statusCode()).isEqualTo(200);

        HttpResponse<String> second = postJson("/api/auth/signup", signupJson);
        assertThat(second.statusCode()).isEqualTo(409);
    }
}