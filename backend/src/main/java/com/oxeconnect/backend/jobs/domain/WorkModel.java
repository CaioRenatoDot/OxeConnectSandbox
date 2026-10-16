package com.oxeconnect.backend.jobs.domain;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Arrays;

public enum WorkModel {
    REMOTO("Remoto"),
    HIBRIDO("Híbrido"),
    PRESENCIAL("Presencial");

    private final String label;

    WorkModel(String label) {
        this.label = label;
    }

    @JsonValue
    public String getLabel() {
        return label;
    }

    @JsonCreator
    public static WorkModel fromValue(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return Arrays.stream(values())
                .filter(m -> m.label.equalsIgnoreCase(value.trim()) || m.name().equalsIgnoreCase(value.trim()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Modelo de trabalho inválido: " + value));
    }
}
