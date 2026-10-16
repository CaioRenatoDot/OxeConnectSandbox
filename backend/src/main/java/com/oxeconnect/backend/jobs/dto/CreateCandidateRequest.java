package com.oxeconnect.backend.jobs.dto;

import com.oxeconnect.backend.jobs.domain.CandidateStage;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public record CreateCandidateRequest(
        @NotBlank(message = "Nome do candidato é obrigatório")
        String name,

        @NotBlank(message = "Cargo/papel do candidato é obrigatório")
        String role,

        @Min(0) @Max(100)
        Integer score,

        CandidateStage stage,

        LocalDate appliedAt
) {
}
