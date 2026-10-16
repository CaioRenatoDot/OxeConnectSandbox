package com.oxeconnect.backend.jobs.dto;

import com.oxeconnect.backend.jobs.domain.JobStatus;
import com.oxeconnect.backend.jobs.domain.Seniority;
import com.oxeconnect.backend.jobs.domain.WorkModel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record CreateJobRequest(
        @NotBlank(message = "Título da vaga é obrigatório")
        String title,

        List<String> stack,

        LocalDate openedAt,

        @NotNull(message = "Senioridade é obrigatória")
        Seniority seniority,

        @NotNull(message = "Modelo de trabalho é obrigatório")
        WorkModel model,

        @NotNull(message = "Salário é obrigatório")
        @Positive(message = "Salário deve ser maior que zero")
        BigDecimal salary,

        @NotBlank(message = "Nome do recrutador é obrigatório")
        String recruiter,

        JobStatus status
) {
}
