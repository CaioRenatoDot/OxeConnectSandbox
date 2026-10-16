package com.oxeconnect.backend.jobs.dto;

import com.oxeconnect.backend.jobs.domain.Candidate;
import com.oxeconnect.backend.jobs.domain.CandidateStage;

import java.time.LocalDate;

public record CandidateDto(
        Long id,
        Long jobId,
        String jobTitle,
        String name,
        String role,
        Integer score,
        CandidateStage stage,
        LocalDate appliedAt,
        Boolean favorite
) {
    public static CandidateDto from(Candidate entity) {
        return new CandidateDto(
                entity.getId(),
                entity.getJobOpening() != null ? entity.getJobOpening().getId() : null,
                entity.getJobOpening() != null ? entity.getJobOpening().getTitle() : null,
                entity.getName(),
                entity.getRole(),
                entity.getScore(),
                entity.getStage(),
                entity.getAppliedAt(),
                entity.getFavorite()
        );
    }
}
