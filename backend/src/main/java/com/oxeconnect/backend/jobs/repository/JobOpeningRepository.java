package com.oxeconnect.backend.jobs.repository;

import com.oxeconnect.backend.jobs.domain.JobOpening;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobOpeningRepository extends JpaRepository<JobOpening, Long> {

    List<JobOpening> findAllByOrderByIdAsc();
}
