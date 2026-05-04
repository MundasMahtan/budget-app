package com.mundas.budgetapp.web;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// @SpringBootTest loads the full application context (all layers).
// @AutoConfigureMockMvc wires up MockMvc so we can fire HTTP requests without a real server.
// @DirtiesContext resets the Spring context (and in-memory database) after this test class,
// so data written here does not bleed into other test classes.
@SpringBootTest
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class TransactionControllerTest {

    @Autowired MockMvc mockMvc;

    private static final String BASE = "/api/v1/transactions";

    @Test
    void createTransaction_returns201WithLocation() throws Exception {
        mockMvc.perform(post(BASE)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"date":"2026-05-01","amount":"1800.00","subcategoryId":1}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.amount").value(1800.00))
                .andExpect(jsonPath("$.subcategoryName").value("Μισθός"))
                .andExpect(header().exists("Location"));
    }

    @Test
    void createTransaction_returns400WhenAmountNegative() throws Exception {
        mockMvc.perform(post(BASE)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"date":"2026-05-01","amount":"-50.00","subcategoryId":1}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("amount")));
    }

    @Test
    void getTransaction_returns404WhenMissing() throws Exception {
        mockMvc.perform(get(BASE + "/999999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    void deleteTransaction_returns204AndHidesRow() throws Exception {
        // Create
        String location = mockMvc.perform(post(BASE)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"date":"2026-06-01","amount":"50.00","subcategoryId":1}
                                """))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getHeader("Location");

        String id = location.substring(location.lastIndexOf('/') + 1);

        // Delete
        mockMvc.perform(delete(BASE + "/" + id))
                .andExpect(status().isNoContent());

        // Should now return 404
        mockMvc.perform(get(BASE + "/" + id))
                .andExpect(status().isNotFound());
    }
}
