package com.oxeconnect.backend.config;

import com.oxeconnect.backend.jobs.domain.Candidate;
import com.oxeconnect.backend.jobs.domain.CandidateStage;
import com.oxeconnect.backend.jobs.domain.JobOpening;
import com.oxeconnect.backend.jobs.domain.JobStatus;
import com.oxeconnect.backend.jobs.domain.Seniority;
import com.oxeconnect.backend.jobs.domain.WorkModel;
import com.oxeconnect.backend.jobs.repository.CandidateRepository;
import com.oxeconnect.backend.jobs.repository.JobOpeningRepository;
import com.oxeconnect.backend.jobs.service.CandidateProfileGenerator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private static final String[] NAMES = {
            "Lucas Almeida", "Mariana Costa", "Pedro Henrique", "Juliana Ribeiro", "Rafael Nunes",
            "Beatriz Santos", "Gabriel Oliveira", "Larissa Ferreira", "Thiago Martins", "Camila Rocha",
            "Felipe Araújo", "Amanda Carvalho"
    };

    private static final String[] ROLES = {
            "Desenvolvedor", "Analista", "Engenheiro", "Consultor", "Freelancer"
    };

    private static final CandidateStage[] STAGES = CandidateStage.values();

    private final JobOpeningRepository jobRepository;
    private final CandidateRepository candidateRepository;

    public DataSeeder(JobOpeningRepository jobRepository, CandidateRepository candidateRepository) {
        this.jobRepository = jobRepository;
        this.candidateRepository = candidateRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (jobRepository.count() > 0) {
            List<Candidate> existing = candidateRepository.findAllByOrderByScoreDescIdAsc();
            boolean updatedAny = false;
            for (Candidate c : existing) {
                if (c.getSkills().isEmpty() || c.getInterviewMessages().isEmpty()) {
                    CandidateProfileGenerator.populateProfile(c, c.getJobOpening(), c.getId().intValue());
                    if (c.getScore() != null && c.getScore() >= 88) {
                        c.setFavorite(true);
                    }
                    updatedAny = true;
                }
            }
            if (updatedAny) {
                candidateRepository.saveAll(existing);
                log.info("Perfis de skills e entrevistas IA populados para {} candidatos existentes.", existing.size());
            } else {
                log.info("Banco de dados já possui vagas e perfis de candidatos. Ignorando DataSeeder.");
            }
            return;
        }

        log.info("Populando banco de dados PostgreSQL com vagas, candidatos e entrevistas IA...");

        List<JobOpening> initialJobs = List.of(
                new JobOpening("Desenvolvedor Front-end Angular", List.of("Angular", "TypeScript", "RxJS"),
                        LocalDate.parse("2026-09-02"), Seniority.PLENO, WorkModel.REMOTO, 48, 6,
                        new BigDecimal("9500.00"), "Ana Souza", JobStatus.EM_ENTREVISTAS),
                new JobOpening("Engenheiro de Dados", List.of("Python", "Spark", "AWS"),
                        LocalDate.parse("2026-08-21"), Seniority.SENIOR, WorkModel.HIBRIDO, 31, 4,
                        new BigDecimal("15000.00"), "Bruno Lima", JobStatus.ABERTA),
                new JobOpening("Desenvolvedor Back-end Java", List.of("Java", "Spring Boot", "Kafka"),
                        LocalDate.parse("2026-07-15"), Seniority.SENIOR, WorkModel.REMOTO, 62, 9,
                        new BigDecimal("14000.00"), "Ana Souza", JobStatus.EM_ENTREVISTAS),
                new JobOpening("Analista de QA", List.of("Cypress", "Playwright"),
                        LocalDate.parse("2026-09-10"), Seniority.JUNIOR, WorkModel.PRESENCIAL, 85, 3,
                        new BigDecimal("4500.00"), "Carla Mendes", JobStatus.ABERTA),
                new JobOpening("DevOps / SRE", List.of("Kubernetes", "Terraform", "GCP"),
                        LocalDate.parse("2026-06-30"), Seniority.ESPECIALISTA, WorkModel.REMOTO, 19, 2,
                        new BigDecimal("19000.00"), "Bruno Lima", JobStatus.PAUSADA),
                new JobOpening("Desenvolvedor Mobile Flutter", List.of("Flutter", "Dart", "Firebase"),
                        LocalDate.parse("2026-08-05"), Seniority.PLENO, WorkModel.HIBRIDO, 40, 5,
                        new BigDecimal("8800.00"), "Carla Mendes", JobStatus.EM_ENTREVISTAS),
                new JobOpening("Cientista de Dados", List.of("Python", "PyTorch", "SQL"),
                        LocalDate.parse("2026-05-12"), Seniority.SENIOR, WorkModel.REMOTO, 27, 0,
                        new BigDecimal("16500.00"), "Ana Souza", JobStatus.ENCERRADA),
                new JobOpening("Desenvolvedor Full Stack", List.of("React", "Node.js", "PostgreSQL"),
                        LocalDate.parse("2026-09-18"), Seniority.PLENO, WorkModel.REMOTO, 73, 7,
                        new BigDecimal("10500.00"), "Diego Rocha", JobStatus.ABERTA),
                new JobOpening("Designer UX/UI", List.of("Figma", "Design System"),
                        LocalDate.parse("2026-09-25"), Seniority.PLENO, WorkModel.HIBRIDO, 56, 4,
                        new BigDecimal("8000.00"), "Diego Rocha", JobStatus.EM_ENTREVISTAS),
                new JobOpening("Estagiário de Desenvolvimento", List.of("JavaScript", "Git"),
                        LocalDate.parse("2026-10-01"), Seniority.JUNIOR, WorkModel.PRESENCIAL, 140, 12,
                        new BigDecimal("2000.00"), "Carla Mendes", JobStatus.ABERTA)
        );

        List<JobOpening> savedJobs = jobRepository.saveAll(initialJobs);

        List<Candidate> allCandidates = new ArrayList<>();
        int runningCandidateSeed = 1;
        for (int idx = 0; idx < savedJobs.size(); idx++) {
            JobOpening job = savedJobs.get(idx);
            int logicalJobSeedId = idx + 1;
            int count = Math.min(job.getCandidates(), 10);
            List<String> stack = job.getStack();
            int stageModulo = (job.getStatus() == JobStatus.ENCERRADA) ? STAGES.length : (STAGES.length - 1);

            for (int i = 0; i < count; i++) {
                int seed = logicalJobSeedId * 7 + i * 13;
                int day = ((seed * 3) % 27) + 1;
                LocalDate appliedAt = LocalDate.of(
                        job.getOpenedAt().getYear(),
                        job.getOpenedAt().getMonth(),
                        day
                );
                String name = NAMES[seed % NAMES.length];
                String role = ROLES[seed % ROLES.length] + " " + stack.get(i % stack.size());
                int score = 55 + ((seed * 17) % 45);
                CandidateStage stage = STAGES[(seed + i) % stageModulo];

                Candidate candidate = new Candidate(job, name, role, score, stage, appliedAt);
                CandidateProfileGenerator.populateProfile(candidate, job, runningCandidateSeed++);
                allCandidates.add(candidate);
            }
        }

        candidateRepository.saveAll(allCandidates);
        log.info("Carga inicial concluída: {} vagas e {} candidatos inseridos com perfis de IA.", savedJobs.size(), allCandidates.size());
    }
}
