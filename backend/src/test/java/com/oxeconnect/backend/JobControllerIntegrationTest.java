package com.oxeconnect.backend;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class JobControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldListSeededJobsAndFilterByStatus() throws Exception {
        mockMvc.perform(get("/api/jobs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(10))))
                .andExpect(jsonPath("$[0].title", is("Desenvolvedor Front-end Angular")))
                .andExpect(jsonPath("$[0].seniority", is("Pleno")))
                .andExpect(jsonPath("$[0].model", is("Remoto")));

        mockMvc.perform(get("/api/jobs").param("status", "Pausada"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title", is("DevOps / SRE")));
    }

    @Test
    void shouldListCandidatesMoveStageAndFetchProfile() throws Exception {
        mockMvc.perform(get("/api/jobs/1/candidates"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(10))))
                .andExpect(jsonPath("$[0].jobId", is(1)));

        mockMvc.perform(get("/api/jobs/candidates"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(100))));

        mockMvc.perform(get("/api/jobs/1/candidates/1/profile"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.skills", hasSize(greaterThanOrEqualTo(3))))
                .andExpect(jsonPath("$.messages", hasSize(greaterThanOrEqualTo(4))))
                .andExpect(jsonPath("$.messages[0].from", is("ai")));

        mockMvc.perform(patch("/api/jobs/1/candidates/1/stage")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"direction\": 1}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)));

        mockMvc.perform(patch("/api/jobs/1/candidates/1/favorite"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.favorite", notNullValue()));
    }

    @Test
    void shouldUpdateJobStatusCreateNewJobAndApplyCandidate() throws Exception {
        mockMvc.perform(patch("/api/jobs/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\": \"Pausada\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("Pausada")));

        String newJobJson = """
                {
                  "title": "Arquiteto de Software Java",
                  "stack": ["Java", "Spring Boot", "PostgreSQL"],
                  "seniority": "Especialista",
                  "model": "Remoto",
                  "salary": 21000,
                  "recruiter": "Ana Souza",
                  "status": "Aberta"
                }
                """;

        mockMvc.perform(post("/api/jobs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(newJobJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title", is("Arquiteto de Software Java")))
                .andExpect(jsonPath("$.status", is("Aberta")));

        String newCandidateJson = """
                {
                  "name": "Fernanda Lima",
                  "role": "Desenvolvedora Angular Sênior"
                }
                """;

        mockMvc.perform(post("/api/jobs/1/candidates")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(newCandidateJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name", is("Fernanda Lima")))
                .andExpect(jsonPath("$.stage", is("Inscrito")));
    }
}
