package com.oxeconnect.backend.jobs.dto;

import com.oxeconnect.backend.jobs.domain.JobStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateJobStatusRequest(
        @NotNull(message = "A nova situação é obrigatória")
        JobStatus status
) {
}
