package com.oxeconnect.backend.jobs.dto;

public record JobStatsDto(
        long activeJobs,
        long totalCandidates,
        long totalInterviews,
        long closedJobs
) {
}
