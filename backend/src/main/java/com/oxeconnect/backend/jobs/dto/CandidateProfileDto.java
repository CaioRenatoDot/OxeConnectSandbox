package com.oxeconnect.backend.jobs.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.oxeconnect.backend.jobs.domain.CandidateSkill;
import com.oxeconnect.backend.jobs.domain.InterviewMessage;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public record CandidateProfileDto(
        List<SkillDto> skills,
        List<MessageDto> messages
) {
    public record SkillDto(String name, Integer score) {
        public static SkillDto from(CandidateSkill skill) {
            return new SkillDto(skill.getName(), skill.getScore());
        }
    }

    public record AudioDto(Integer seconds, List<Integer> waveform) {
    }

    public record EvaluationDto(String skill, Integer score, String note) {
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record MessageDto(
            String from,
            String text,
            LocalDateTime time,
            AudioDto audio,
            EvaluationDto evaluation
    ) {
        public static MessageDto from(InterviewMessage msg) {
            AudioDto audio = null;
            if (msg.getAudioSeconds() != null) {
                int seed = msg.getWaveformSeed() != null ? msg.getWaveformSeed() : 1;
                List<Integer> bars = new ArrayList<>(32);
                for (int i = 0; i < 32; i++) {
                    bars.add(25 + Math.floorMod(seed * 37 + i * 53 + ((i * i) % 7) * 11, 75));
                }
                audio = new AudioDto(msg.getAudioSeconds(), bars);
            }
            EvaluationDto eval = null;
            if (msg.getEvaluationSkill() != null) {
                eval = new EvaluationDto(
                        msg.getEvaluationSkill(),
                        msg.getEvaluationScore(),
                        msg.getEvaluationNote()
                );
            }
            return new MessageDto(msg.getSender(), msg.getText(), msg.getSentAt(), audio, eval);
        }
    }
}
