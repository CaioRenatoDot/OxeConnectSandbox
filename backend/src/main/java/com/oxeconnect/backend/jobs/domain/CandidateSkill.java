package com.oxeconnect.backend.jobs.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class CandidateSkill {

    @Column(name = "skill_name", nullable = false)
    private String name;

    @Column(name = "skill_score", nullable = false)
    private Integer score;

    public CandidateSkill() {
    }

    public CandidateSkill(String name, Integer score) {
        this.name = name;
        this.score = score;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }
}
