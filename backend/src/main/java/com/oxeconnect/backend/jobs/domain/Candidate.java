package com.oxeconnect.backend.jobs.domain;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "candidates")
public class Candidate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "job_opening_id", nullable = false)
    private JobOpening jobOpening;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String role;

    @Column(nullable = false)
    private Integer score;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CandidateStage stage = CandidateStage.INSCRITO;

    @Column(nullable = false)
    private LocalDate appliedAt;

    @Column(nullable = false, columnDefinition = "boolean default false")
    private Boolean favorite = false;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "candidate_skills", joinColumns = @JoinColumn(name = "candidate_id"))
    @OrderColumn(name = "position")
    private List<CandidateSkill> skills = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "candidate_interview_messages", joinColumns = @JoinColumn(name = "candidate_id"))
    @OrderColumn(name = "position")
    private List<InterviewMessage> interviewMessages = new ArrayList<>();

    public Candidate() {
    }

    public Candidate(
            JobOpening jobOpening,
            String name,
            String role,
            Integer score,
            CandidateStage stage,
            LocalDate appliedAt
    ) {
        this.jobOpening = jobOpening;
        this.name = name;
        this.role = role;
        this.score = score;
        this.stage = stage;
        this.appliedAt = appliedAt;
        this.favorite = score != null && score >= 88;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public JobOpening getJobOpening() {
        return jobOpening;
    }

    public void setJobOpening(JobOpening jobOpening) {
        this.jobOpening = jobOpening;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public CandidateStage getStage() {
        return stage;
    }

    public void setStage(CandidateStage stage) {
        this.stage = stage;
    }

    public LocalDate getAppliedAt() {
        return appliedAt;
    }

    public void setAppliedAt(LocalDate appliedAt) {
        this.appliedAt = appliedAt;
    }

    public Boolean getFavorite() {
        return favorite != null && favorite;
    }

    public void setFavorite(Boolean favorite) {
        this.favorite = favorite != null && favorite;
    }

    public List<CandidateSkill> getSkills() {
        return skills;
    }

    public void setSkills(List<CandidateSkill> skills) {
        this.skills = skills != null ? new ArrayList<>(skills) : new ArrayList<>();
    }

    public List<InterviewMessage> getInterviewMessages() {
        return interviewMessages;
    }

    public void setInterviewMessages(List<InterviewMessage> interviewMessages) {
        this.interviewMessages = interviewMessages != null ? new ArrayList<>(interviewMessages) : new ArrayList<>();
    }
}
