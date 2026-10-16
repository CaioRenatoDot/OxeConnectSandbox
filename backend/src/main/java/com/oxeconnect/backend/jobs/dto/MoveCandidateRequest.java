package com.oxeconnect.backend.jobs.dto;

import com.oxeconnect.backend.jobs.domain.CandidateStage;

public record MoveCandidateRequest(
        Integer direction,
        CandidateStage stage
) {
}
