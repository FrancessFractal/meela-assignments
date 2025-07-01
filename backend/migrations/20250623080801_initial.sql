create table applications
(
    id                    INTEGER not null
       constraint applications_pk
          primary key autoincrement,
    application_submitted INTEGER not null default 0,
    current_page          TEXT    not null default 'patient_age',
    patient_age           TEXT,
    patient_gender        TEXT
);

create table therapist_minority_competence_responses
(
    id                    INTEGER not null
        constraint applications_pk
            primary key autoincrement,
    application_id        INTEGER not null
        constraint therapist_minority_competence_applications_id_fk
            references applications,
    name                  TEXT    not null
);

