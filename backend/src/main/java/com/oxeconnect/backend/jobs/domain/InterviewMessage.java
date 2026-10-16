package com.oxeconnect.backend.jobs.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.time.LocalDateTime;

@Embeddable
public class InterviewMessage {

    @Column(name = "sender", nullable = false)
    private String sender;

    @Column(name = "message_text", nullable = false, length = 1000)
    private String text;

    @Column(name = "sent_at", nullable = false)
    private LocalDateTime sentAt;

    @Column(name = "audio_seconds")
    private Integer audioSeconds;

    @Column(name = "waveform_seed")
    private Integer waveformSeed;

    @Column(name = "eval_skill")
    private String evaluationSkill;

    @Column(name = "eval_score")
    private Integer evaluationScore;

    @Column(name = "eval_note", length = 500)
    private String evaluationNote;

    public InterviewMessage() {
    }

    public InterviewMessage(
            String sender,
            String text,
            LocalDateTime sentAt,
            Integer audioSeconds,
            Integer waveformSeed,
            String evaluationSkill,
            Integer evaluationScore,
            String evaluationNote
    ) {
        this.sender = sender;
        this.text = text;
        this.sentAt = sentAt;
        this.audioSeconds = audioSeconds;
        this.waveformSeed = waveformSeed;
        this.evaluationSkill = evaluationSkill;
        this.evaluationScore = evaluationScore;
        this.evaluationNote = evaluationNote;
    }

    public static InterviewMessage aiMessage(String text, LocalDateTime sentAt) {
        return new InterviewMessage("ai", text, sentAt, null, null, null, null, null);
    }

    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public LocalDateTime getSentAt() {
        return sentAt;
    }

    public void setSentAt(LocalDateTime sentAt) {
        this.sentAt = sentAt;
    }

    public Integer getAudioSeconds() {
        return audioSeconds;
    }

    public void setAudioSeconds(Integer audioSeconds) {
        this.audioSeconds = audioSeconds;
    }

    public Integer getWaveformSeed() {
        return waveformSeed;
    }

    public void setWaveformSeed(Integer waveformSeed) {
        this.waveformSeed = waveformSeed;
    }

    public String getEvaluationSkill() {
        return evaluationSkill;
    }

    public void setEvaluationSkill(String evaluationSkill) {
        this.evaluationSkill = evaluationSkill;
    }

    public Integer getEvaluationScore() {
        return evaluationScore;
    }

    public void setEvaluationScore(Integer evaluationScore) {
        this.evaluationScore = evaluationScore;
    }

    public String getEvaluationNote() {
        return evaluationNote;
    }

    public void setEvaluationNote(String evaluationNote) {
        this.evaluationNote = evaluationNote;
    }
}
