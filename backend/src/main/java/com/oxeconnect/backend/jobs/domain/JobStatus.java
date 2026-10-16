package com.oxeconnect.backend.jobs.domain;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Arrays;

public enum JobStatus {
    ABERTA("Aberta"),
    EM_ENTREVISTAS("Em entrevistas"),
    PAUSADA("Pausada"),
    ENCERRADA("Encerrada");

    private final String label;

    JobStatus(String label) {
        this.label = label;
    }

    @JsonValue
    public String getLabel() {
        return label;
    }

    @JsonCreator
    public static JobStatus fromValue(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return Arrays.stream(values())
                .filter(status -> status.label.equalsIgnoreCase(value.trim()) || status.name().equalsIgnoreCase(value.trim()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Situação de vaga inválida: " + value));
    }
}
