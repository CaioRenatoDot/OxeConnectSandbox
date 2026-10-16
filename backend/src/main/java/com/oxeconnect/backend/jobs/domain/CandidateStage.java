package com.oxeconnect.backend.jobs.domain;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Arrays;

public enum CandidateStage {
    INSCRITO("Inscrito"),
    TRIAGEM("Triagem"),
    TESTE_TECNICO("Teste técnico"),
    ENTREVISTA("Entrevista"),
    PROPOSTA("Proposta"),
    CONTRATADO("Contratado");

    private final String label;

    CandidateStage(String label) {
        this.label = label;
    }

    @JsonValue
    public String getLabel() {
        return label;
    }

    public CandidateStage move(int direction) {
        CandidateStage[] stages = values();
        int nextIndex = Math.min(Math.max(this.ordinal() + direction, 0), stages.length - 1);
        return stages[nextIndex];
    }

    @JsonCreator
    public static CandidateStage fromValue(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return Arrays.stream(values())
                .filter(s -> s.label.equalsIgnoreCase(value.trim()) || s.name().equalsIgnoreCase(value.trim()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Etapa inválida: " + value));
    }
}
