package com.vip.ecom_proj.rating;

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
class RatingEndpointTests {

    @LocalServerPort
    int port;

    private final ObjectMapper mapper = new ObjectMapper();

    private HttpResponse<String> get(String path, String token) throws Exception {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest.Builder b = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:" + port + path))
                .GET();
        if (token != null) {
            b.header("Authorization", "Bearer " + token);
        }
        return client.send(b.build(), HttpResponse.BodyHandlers.ofString());
    }

    private HttpResponse<String> postJson(String path, String json, String token) throws Exception {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest.Builder b = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:" + port + path))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json));
        if (token != null) {
            b.header("Authorization", "Bearer " + token);
        }
        return client.send(b.build(), HttpResponse.BodyHandlers.ofString());
    }

    private String signupAndGetToken() throws Exception {
        String email = "rater" + System.currentTimeMillis() + "@test.local";
        String signupJson = "{\"name\":\"Rater\",\"email\":\"" + email + "\",\"password\":\"password123\"}";
        HttpResponse<String> signup = postJson("/api/auth/signup", signupJson, null);
        assertThat(signup.statusCode()).isEqualTo(200);

        JsonNode body = mapper.readTree(signup.body());
        return body.get("token").asText();
    }

    @Test
    void postRatingRequiresAuth() throws Exception {
        HttpResponse<String> response = postJson("/api/products/1/rating", "{\"rating\":5}", null);
        assertThat(response.statusCode()).isEqualTo(401);
    }

    @Test
    void canRateAndReadMyRating() throws Exception {
        String token = signupAndGetToken();

        HttpResponse<String> before = get("/api/products/1/rating", token);
        assertThat(before.statusCode()).isEqualTo(200);
        JsonNode beforeBody = mapper.readTree(before.body());
        assertThat(beforeBody.get("count").asLong()).isGreaterThanOrEqualTo(0);

        HttpResponse<String> rate = postJson("/api/products/1/rating", "{\"rating\":5}", token);
        assertThat(rate.statusCode()).isEqualTo(200);
        JsonNode rateBody = mapper.readTree(rate.body());
        assertThat(rateBody.get("myRating").asInt()).isEqualTo(5);
        assertThat(rateBody.get("count").asLong()).isGreaterThanOrEqualTo(1);

        HttpResponse<String> after = get("/api/products/1/rating", token);
        assertThat(after.statusCode()).isEqualTo(200);
        JsonNode afterBody = mapper.readTree(after.body());
        assertThat(afterBody.get("myRating").asInt()).isEqualTo(5);
        assertThat(afterBody.get("count").asLong()).isGreaterThanOrEqualTo(1);
    }
}