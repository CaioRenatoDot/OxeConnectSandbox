package com.oxeconnect.backend.jobs.domain;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Arrays;

public enum Seniority {
    JUNIOR("Júnior"),
    PLENO("Pleno"),
    SENIOR("Sênior"),
    ESPECIALISTA("Especialista");

    private final String label;

    Seniority(String label) {
        this.label = label;
    }

    @JsonValue
    public String getLabel() {
        return label;
    }

    @JsonCreator
    public static Seniority fromValue(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return Arrays.stream(values())
                .filter(s -> s.label.equalsIgnoreCase(value.trim()) || s.name().equalsIgnoreCase(value.trim()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Senioridade inválida: " + value));
    }
}
