package com.oxeconnect.backend.jobs.service;

import com.oxeconnect.backend.jobs.domain.Candidate;
import com.oxeconnect.backend.jobs.domain.CandidateSkill;
import com.oxeconnect.backend.jobs.domain.InterviewMessage;
import com.oxeconnect.backend.jobs.domain.JobOpening;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

public final class CandidateProfileGenerator {

    private static final List<String> SOFT_SKILLS = List.of("Comunicação", "Resolução de problemas");

    private static final String[] NOTES = {
            "Resposta sólida, com exemplos concretos.",
            "Resposta adequada, mas pouco aprofundada.",
            "Resposta superficial; vale investigar na entrevista."
    };

    private CandidateProfileGenerator() {
    }

    public static void populateProfile(Candidate candidate, JobOpening job, int seedId) {
        List<String> techStack = job.getStack().isEmpty() ? List.of("Engenharia de Software") : job.getStack();
        List<String> allSkillNames = new ArrayList<>(techStack);
        allSkillNames.addAll(SOFT_SKILLS);

        List<CandidateSkill> skills = new ArrayList<>();
        int baseScore = candidate.getScore() != null ? candidate.getScore() : 75;

        for (int i = 0; i < allSkillNames.size(); i++) {
            int variation = Math.floorMod(seedId * 31 + i * 17, 21) - 10;
            int skillScore = Math.min(100, Math.max(30, baseScore + variation));
            skills.add(new CandidateSkill(allSkillNames.get(i), skillScore));
        }

        String firstName = candidate.getName().split(" ")[0];
        LocalDateTime baseTime = LocalDateTime.of(candidate.getAppliedAt(), LocalTime.of(14, 0));

        List<InterviewMessage> messages = new ArrayList<>();
        messages.add(InterviewMessage.aiMessage(
                "Olá, " + firstName + "! Sou a assistente de triagem. Vou fazer algumas perguntas técnicas sobre a vaga de " + job.getTitle() + ".",
                baseTime
        ));

        for (int i = 0; i < techStack.size(); i++) {
            CandidateSkill skill = skills.get(i);
            int stepIndex = Math.floorMod(seedId + i, 3);
            int quality = skill.getScore() >= 80 ? 0 : (skill.getScore() >= 65 ? 1 : 2);

            String question = buildQuestion(stepIndex, skill.getName());
            String answer = buildAnswer(stepIndex, quality, skill.getName());
            int audioSeconds = 12 + Math.floorMod(seedId * 7 + i * 19, 40);
            int waveformSeed = seedId + i;

            messages.add(InterviewMessage.aiMessage(question, baseTime.plusMinutes(i * 3L + 1)));
            messages.add(new InterviewMessage(
                    "candidate",
                    answer,
                    baseTime.plusMinutes(i * 3L + 2),
                    audioSeconds,
                    waveformSeed,
                    skill.getName(),
                    skill.getScore(),
                    NOTES[quality]
            ));
        }

        messages.add(InterviewMessage.aiMessage(
                "Obrigado, " + firstName + "! Sua análise foi concluída e enviada ao recrutador.",
                baseTime.plusMinutes(techStack.size() * 3L + 1)
        ));

        candidate.setSkills(skills);
        candidate.setInterviewMessages(messages);
    }

    private static String buildQuestion(int stepIndex, String skill) {
        return switch (stepIndex) {
            case 0 -> "Conte um projeto recente em que você usou " + skill + ". Qual foi o maior desafio?";
            case 1 -> "Como você organiza e testa um código com " + skill + " em produção?";
            default -> "Que boas práticas de " + skill + " você considera essenciais?";
        };
    }

    private static String buildAnswer(int stepIndex, int quality, String skill) {
        return switch (stepIndex) {
            case 0 -> switch (quality) {
                case 0 -> "Usei " + skill + " num sistema de pagamentos com milhares de transações por minuto. O maior desafio foi performance; resolvi com paginação no servidor e cache.";
                case 1 -> "Usei " + skill + " num painel administrativo interno. O desafio foi organizar o código conforme o projeto crescia.";
                default -> "Usei " + skill + " em um projeto pessoal pequeno, ainda não peguei nada muito complexo.";
            };
            case 1 -> switch (quality) {
                case 0 -> "Separo em camadas com responsabilidades claras, escrevo testes unitários para regras de negócio e testes E2E nos fluxos críticos com " + skill + ".";
                case 1 -> "Tento separar bem os módulos e faço alguns testes unitários nas partes mais importantes.";
                default -> "Normalmente testo manualmente antes de subir, ainda não tenho muita prática com testes automatizados.";
            };
            default -> switch (quality) {
                case 0 -> "Tipagem forte, funções pequenas e puras, evitar estado compartilhado e seguir o guia de estilo oficial de " + skill + ".";
                case 1 -> "Manter o código legível, dar bons nomes e evitar duplicação.";
                default -> "Acho que comentar bem o código é o mais importante.";
            };
        };
    }
}
