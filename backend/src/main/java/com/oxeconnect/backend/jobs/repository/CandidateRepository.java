package com.oxeconnect.backend.jobs.repository;

import com.oxeconnect.backend.jobs.domain.Candidate;
import com.oxeconnect.backend.jobs.domain.CandidateStage;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CandidateRepository extends JpaRepository<Candidate, Long> {

    @EntityGraph(attributePaths = "jobOpening")
    List<Candidate> findAllByOrderByScoreDescIdAsc();

    @EntityGraph(attributePaths = "jobOpening")
    List<Candidate> findByJobOpeningIdOrderByScoreDescIdAsc(Long jobOpeningId);

    @EntityGraph(attributePaths = "jobOpening")
    List<Candidate> findByJobOpeningIdAndStageOrderByScoreDescIdAsc(Long jobOpeningId, CandidateStage stage);

    @EntityGraph(attributePaths = "jobOpening")
    Optional<Candidate> findByIdAndJobOpeningId(Long id, Long jobOpeningId);
}
