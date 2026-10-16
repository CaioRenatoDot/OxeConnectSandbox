package com.oxeconnect.backend.jobs.service;

import com.oxeconnect.backend.jobs.domain.Candidate;
import com.oxeconnect.backend.jobs.domain.CandidateStage;
import com.oxeconnect.backend.jobs.domain.JobOpening;
import com.oxeconnect.backend.jobs.domain.JobStatus;
import com.oxeconnect.backend.jobs.domain.Seniority;
import com.oxeconnect.backend.jobs.domain.WorkModel;
import com.oxeconnect.backend.jobs.dto.CandidateDto;
import com.oxeconnect.backend.jobs.dto.CandidateProfileDto;
import com.oxeconnect.backend.jobs.dto.CreateCandidateRequest;
import com.oxeconnect.backend.jobs.dto.CreateJobRequest;
import com.oxeconnect.backend.jobs.dto.JobOpeningDto;
import com.oxeconnect.backend.jobs.dto.JobStatsDto;
import com.oxeconnect.backend.jobs.dto.MoveCandidateRequest;
import com.oxeconnect.backend.jobs.repository.CandidateRepository;
import com.oxeconnect.backend.jobs.repository.JobOpeningRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Locale;

@Service
public class JobService {

    private final JobOpeningRepository jobRepository;
    private final CandidateRepository candidateRepository;

    public JobService(JobOpeningRepository jobRepository, CandidateRepository candidateRepository) {
        this.jobRepository = jobRepository;
        this.candidateRepository = candidateRepository;
    }

    @Transactional(readOnly = true)
    public List<JobOpeningDto> findAll(String search, String status, String seniority, String model) {
        JobStatus statusEnum = (status != null && !status.isBlank()) ? JobStatus.fromValue(status) : null;
        Seniority seniorityEnum = (seniority != null && !seniority.isBlank()) ? Seniority.fromValue(seniority) : null;
        WorkModel modelEnum = (model != null && !model.isBlank()) ? WorkModel.fromValue(model) : null;
        String term = (search != null) ? search.trim().toLowerCase(Locale.ROOT) : "";

        return jobRepository.findAllByOrderByIdAsc().stream()
                .filter(job -> term.isEmpty()
                        || job.getTitle().toLowerCase(Locale.ROOT).contains(term)
                        || job.getStack().stream().anyMatch(tech -> tech.toLowerCase(Locale.ROOT).contains(term)))
                .filter(job -> statusEnum == null || job.getStatus() == statusEnum)
                .filter(job -> seniorityEnum == null || job.getSeniority() == seniorityEnum)
                .filter(job -> modelEnum == null || job.getModel() == modelEnum)
                .map(JobOpeningDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public JobStatsDto getStats() {
        List<JobOpening> jobs = jobRepository.findAll();
        long active = jobs.stream()
                .filter(j -> j.getStatus() == JobStatus.ABERTA || j.getStatus() == JobStatus.EM_ENTREVISTAS)
                .count();
        long candidates = jobs.stream()
                .mapToLong(JobOpening::getCandidates)
                .sum();
        long interviews = jobs.stream()
                .mapToLong(JobOpening::getInterviews)
                .sum();
        long closed = jobs.stream()
                .filter(j -> j.getStatus() == JobStatus.ENCERRADA)
                .count();
        return new JobStatsDto(active, candidates, interviews, closed);
    }

    @Transactional(readOnly = true)
    public JobOpeningDto findById(Long id) {
        return JobOpeningDto.from(getJobOrThrow(id));
    }

    @Transactional
    public JobOpeningDto create(CreateJobRequest request) {
        JobOpening job = new JobOpening(
                request.title(),
                request.stack() != null ? request.stack() : List.of(),
                request.openedAt() != null ? request.openedAt() : LocalDate.now(),
                request.seniority(),
                request.model(),
                0,
                0,
                request.salary(),
                request.recruiter(),
                request.status() != null ? request.status() : JobStatus.ABERTA
        );
        return JobOpeningDto.from(jobRepository.save(job));
    }

    @Transactional
    public JobOpeningDto update(Long id, CreateJobRequest request) {
        JobOpening job = getJobOrThrow(id);
        job.setTitle(request.title());
        job.setStack(request.stack() != null ? request.stack() : List.of());
        if (request.openedAt() != null) {
            job.setOpenedAt(request.openedAt());
        }
        job.setSeniority(request.seniority());
        job.setModel(request.model());
        job.setSalary(request.salary());
        job.setRecruiter(request.recruiter());
        if (request.status() != null) {
            job.setStatus(request.status());
        }
        return JobOpeningDto.from(jobRepository.save(job));
    }

    @Transactional
    public JobOpeningDto updateStatus(Long id, JobStatus status) {
        JobOpening job = getJobOrThrow(id);
        job.setStatus(status);
        return JobOpeningDto.from(jobRepository.save(job));
    }

    @Transactional
    public void delete(Long id) {
        JobOpening job = getJobOrThrow(id);
        jobRepository.delete(job);
    }

    @Transactional(readOnly = true)
    public List<CandidateDto> findAllCandidates() {
        return candidateRepository.findAllByOrderByScoreDescIdAsc().stream()
                .map(CandidateDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CandidateDto> findCandidates(Long jobId, String stage) {
        getJobOrThrow(jobId);
        List<Candidate> candidates;
        if (stage != null && !stage.isBlank()) {
            CandidateStage stageEnum = CandidateStage.fromValue(stage);
            candidates = candidateRepository.findByJobOpeningIdAndStageOrderByScoreDescIdAsc(jobId, stageEnum);
        } else {
            candidates = candidateRepository.findByJobOpeningIdOrderByScoreDescIdAsc(jobId);
        }
        return candidates.stream()
                .map(CandidateDto::from)
                .toList();
    }

    @Transactional
    public CandidateDto addCandidate(Long jobId, CreateCandidateRequest request) {
        JobOpening job = getJobOrThrow(jobId);
        int defaultScore = 70 + Math.floorMod(request.name().hashCode(), 28);
        Candidate candidate = new Candidate(
                job,
                request.name(),
                request.role(),
                request.score() != null ? request.score() : defaultScore,
                request.stage() != null ? request.stage() : CandidateStage.INSCRITO,
                request.appliedAt() != null ? request.appliedAt() : LocalDate.now()
        );
        CandidateProfileGenerator.populateProfile(candidate, job, Math.abs(request.name().hashCode() % 100) + 1);
        Candidate saved = candidateRepository.save(candidate);
        job.setCandidates(job.getCandidates() + 1);
        jobRepository.save(job);
        return CandidateDto.from(saved);
    }

    @Transactional
    public CandidateProfileDto getCandidateProfile(Long jobId, Long candidateId) {
        Candidate candidate = candidateRepository.findByIdAndJobOpeningId(candidateId, jobId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Candidato " + candidateId + " não encontrado na vaga " + jobId));

        if (candidate.getSkills().isEmpty() || candidate.getInterviewMessages().isEmpty()) {
            CandidateProfileGenerator.populateProfile(
                    candidate,
                    candidate.getJobOpening(),
                    candidate.getId().intValue()
            );
            candidate = candidateRepository.save(candidate);
        }

        return new CandidateProfileDto(
                candidate.getSkills().stream().map(CandidateProfileDto.SkillDto::from).toList(),
                candidate.getInterviewMessages().stream().map(CandidateProfileDto.MessageDto::from).toList()
        );
    }

    @Transactional
    public CandidateDto toggleFavorite(Long jobId, Long candidateId) {
        Candidate candidate = candidateRepository.findByIdAndJobOpeningId(candidateId, jobId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Candidato " + candidateId + " não encontrado na vaga " + jobId));
        candidate.setFavorite(!candidate.getFavorite());
        return CandidateDto.from(candidateRepository.save(candidate));
    }

    @Transactional
    public CandidateDto moveCandidateStage(Long jobId, Long candidateId, MoveCandidateRequest request) {
        Candidate candidate = candidateRepository.findByIdAndJobOpeningId(candidateId, jobId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Candidato " + candidateId + " não encontrado na vaga " + jobId));

        CandidateStage previousStage = candidate.getStage();
        CandidateStage nextStage;
        if (request.stage() != null) {
            nextStage = request.stage();
        } else if (request.direction() != null) {
            nextStage = previousStage.move(request.direction());
        } else {
            throw new IllegalArgumentException("Informe 'stage' ou 'direction' para mover o candidato");
        }

        candidate.setStage(nextStage);
        Candidate saved = candidateRepository.save(candidate);

        if (previousStage != CandidateStage.ENTREVISTA && nextStage == CandidateStage.ENTREVISTA) {
            JobOpening job = candidate.getJobOpening();
            job.setInterviews(job.getInterviews() + 1);
            jobRepository.save(job);
        }

        return CandidateDto.from(saved);
    }

    private JobOpening getJobOrThrow(Long id) {
        return jobRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Vaga não encontrada com ID: " + id));
    }
}
