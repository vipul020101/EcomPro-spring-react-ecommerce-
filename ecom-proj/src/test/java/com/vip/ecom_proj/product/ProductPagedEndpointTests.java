package com.vip.ecom_proj.product;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class ProductPagedEndpointTests {

    @LocalServerPort
    int port;

    private HttpResponse<String> get(String pathAndQuery) throws Exception {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:" + port + pathAndQuery))
                .GET()
                .build();
        return client.send(request, HttpResponse.BodyHandlers.ofString());
    }

    @Test
    void supportsKeywordCategoryBrandAndSorting() throws Exception {
        HttpResponse<String> response = get("/api/products/paged?q=apple&category=Laptop&brand=Apple&sort=price,desc&size=5");
        assertThat(response.statusCode()).isEqualTo(200);
        assertThat(response.body()).contains("\"content\"");
    }

    @Test
    void supportsRatingFilters() throws Exception {
        HttpResponse<String> response = get("/api/products/paged?minRating=4.0&sort=rating,desc&size=5");
        assertThat(response.statusCode()).isEqualTo(200);
        assertThat(response.body()).contains("\"content\"");
    }
}