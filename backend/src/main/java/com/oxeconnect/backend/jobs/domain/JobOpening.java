package com.oxeconnect.backend.jobs.domain;

import jakarta.persistence.CascadeType;
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
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "job_openings")
public class JobOpening {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "job_opening_stack", joinColumns = @JoinColumn(name = "job_opening_id"))
    @OrderColumn(name = "position")
    @Column(name = "technology", nullable = false)
    private List<String> stack = new ArrayList<>();

    @Column(nullable = false)
    private LocalDate openedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Seniority seniority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WorkModel model;

    @Column(nullable = false)
    private Integer candidates = 0;

    @Column(nullable = false)
    private Integer interviews = 0;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal salary;

    @Column(nullable = false)
    private String recruiter;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private JobStatus status = JobStatus.ABERTA;

    @OneToMany(mappedBy = "jobOpening", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Candidate> candidateList = new ArrayList<>();

    public JobOpening() {
    }

    public JobOpening(
            String title,
            List<String> stack,
            LocalDate openedAt,
            Seniority seniority,
            WorkModel model,
            Integer candidates,
            Integer interviews,
            BigDecimal salary,
            String recruiter,
            JobStatus status
    ) {
        this.title = title;
        this.stack = new ArrayList<>(stack);
        this.openedAt = openedAt;
        this.seniority = seniority;
        this.model = model;
        this.candidates = candidates;
        this.interviews = interviews;
        this.salary = salary;
        this.recruiter = recruiter;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public List<String> getStack() {
        return stack;
    }

    public void setStack(List<String> stack) {
        this.stack = stack != null ? new ArrayList<>(stack) : new ArrayList<>();
    }

    public LocalDate getOpenedAt() {
        return openedAt;
    }

    public void setOpenedAt(LocalDate openedAt) {
        this.openedAt = openedAt;
    }

    public Seniority getSeniority() {
        return seniority;
    }

    public void setSeniority(Seniority seniority) {
        this.seniority = seniority;
    }

    public WorkModel getModel() {
        return model;
    }

    public void setModel(WorkModel model) {
        this.model = model;
    }

    public Integer getCandidates() {
        return candidates;
    }

    public void setCandidates(Integer candidates) {
        this.candidates = candidates;
    }

    public Integer getInterviews() {
        return interviews;
    }

    public void setInterviews(Integer interviews) {
        this.interviews = interviews;
    }

    public BigDecimal getSalary() {
        return salary;
    }

    public void setSalary(BigDecimal salary) {
        this.salary = salary;
    }

    public String getRecruiter() {
        return recruiter;
    }

    public void setRecruiter(String recruiter) {
        this.recruiter = recruiter;
    }

    public JobStatus getStatus() {
        return status;
    }

    public void setStatus(JobStatus status) {
        this.status = status;
    }

    public List<Candidate> getCandidateList() {
        return candidateList;
    }
}
