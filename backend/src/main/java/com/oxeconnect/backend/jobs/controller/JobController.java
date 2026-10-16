package com.oxeconnect.backend.jobs.controller;

import com.oxeconnect.backend.jobs.dto.CandidateDto;
import com.oxeconnect.backend.jobs.dto.CandidateProfileDto;
import com.oxeconnect.backend.jobs.dto.CreateCandidateRequest;
import com.oxeconnect.backend.jobs.dto.CreateJobRequest;
import com.oxeconnect.backend.jobs.dto.JobOpeningDto;
import com.oxeconnect.backend.jobs.dto.JobStatsDto;
import com.oxeconnect.backend.jobs.dto.MoveCandidateRequest;
import com.oxeconnect.backend.jobs.dto.UpdateJobStatusRequest;
import com.oxeconnect.backend.jobs.service.JobService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@Tag(name = "Vagas & Candidatos", description = "Endpoints de gerenciamento de vagas, banco de talentos e funil do processo seletivo")
public class JobController {

    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    @GetMapping
    @Operation(summary = "Lista todas as vagas com filtros opcionais")
    public List<JobOpeningDto> listJobs(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String seniority,
            @RequestParam(required = false) String model
    ) {
        return jobService.findAll(search, status, seniority, model);
    }

    @GetMapping("/stats")
    @Operation(summary = "Retorna os indicadores consolidados do Dashboard")
    public JobStatsDto getStats() {
        return jobService.getStats();
    }

    @GetMapping("/candidates")
    @Operation(summary = "Lista todos os candidatos de todas as vagas (Banco de Talentos e Pipeline Global)")
    public List<CandidateDto> listAllCandidates() {
        return jobService.findAllCandidates();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Busca detalhes de uma vaga pelo ID")
    public JobOpeningDto getJob(@PathVariable Long id) {
        return jobService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Cria uma nova vaga")
    public JobOpeningDto createJob(@Valid @RequestBody CreateJobRequest request) {
        return jobService.create(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualiza os dados de uma vaga")
    public JobOpeningDto updateJob(@PathVariable Long id, @Valid @RequestBody CreateJobRequest request) {
        return jobService.update(id, request);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Altera a situação de uma vaga (Aberta, Em entrevistas, Pausada, Encerrada)")
    public JobOpeningDto updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateJobStatusRequest request
    ) {
        return jobService.updateStatus(id, request.status());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Remove uma vaga")
    public void deleteJob(@PathVariable Long id) {
        jobService.delete(id);
    }

    @GetMapping("/{id}/candidates")
    @Operation(summary = "Lista os candidatos inscritos em uma vaga")
    public List<CandidateDto> listCandidates(
            @PathVariable Long id,
            @RequestParam(required = false) String stage
    ) {
        return jobService.findCandidates(id, stage);
    }

    @PostMapping("/{id}/candidates")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Inscreve um novo candidato na vaga")
    public CandidateDto addCandidate(
            @PathVariable Long id,
            @Valid @RequestBody CreateCandidateRequest request
    ) {
        return jobService.addCandidate(id, request);
    }

    @GetMapping("/{jobId}/candidates/{candidateId}/profile")
    @Operation(summary = "Retorna as skills avaliadas e o histórico da entrevista IA de um candidato")
    public CandidateProfileDto getCandidateProfile(
            @PathVariable Long jobId,
            @PathVariable Long candidateId
    ) {
        return jobService.getCandidateProfile(jobId, candidateId);
    }

    @PatchMapping("/{jobId}/candidates/{candidateId}/favorite")
    @Operation(summary = "Alterna a marcação de favorito de um candidato")
    public CandidateDto toggleFavorite(
            @PathVariable Long jobId,
            @PathVariable Long candidateId
    ) {
        return jobService.toggleFavorite(jobId, candidateId);
    }

    @PatchMapping("/{jobId}/candidates/{candidateId}/stage")
    @Operation(summary = "Move um candidato entre etapas do funil seletivo")
    public CandidateDto moveCandidateStage(
            @PathVariable Long jobId,
            @PathVariable Long candidateId,
            @RequestBody MoveCandidateRequest request
    ) {
        return jobService.moveCandidateStage(jobId, candidateId, request);
    }
}
