package com.oxeconnect.backend.jobs.dto;

import com.oxeconnect.backend.jobs.domain.JobOpening;
import com.oxeconnect.backend.jobs.domain.JobStatus;
import com.oxeconnect.backend.jobs.domain.Seniority;
import com.oxeconnect.backend.jobs.domain.WorkModel;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record JobOpeningDto(
        Long id,
        String title,
        List<String> stack,
        LocalDate openedAt,
        Seniority seniority,
        WorkModel model,
        Integer candidates,
        Integer interviews,
        BigDecimal salary,
        String recruiter,
        JobStatus status
) {
    public static JobOpeningDto from(JobOpening entity) {
        return new JobOpeningDto(
                entity.getId(),
                entity.getTitle(),
                List.copyOf(entity.getStack()),
                entity.getOpenedAt(),
                entity.getSeniority(),
                entity.getModel(),
                entity.getCandidates(),
                entity.getInterviews(),
                entity.getSalary(),
                entity.getRecruiter(),
                entity.getStatus()
        );
    }
}
