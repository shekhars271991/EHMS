# Patient Workflow Implementation Plan

## Validated against the current application

| Requirement | Status | Implementation |
| --- | --- | --- |
| Patient identity stored in `User` with an MRN | Done | Patient registration creates a `PATIENT` user linked to the patient record and copies its MRN. |
| Longitudinal profile containing the five eye-test sections | Done | `PatientProfile` stores refraction, color vision, IOP, slit biomicroscopy, and dilated fundus data. |
| Profile control to display tests | Done | Patient profile has a clinical tests toggle and each section can be updated. |
| Staff search and open a patient's profile | Done | Patient directory search opens the patient's profile. |
| Multiple visits per patient | Done | Visits are persisted as encounters and listed in the patient profile. |
| Mark offline payment complete for a visit | Done | The visit action records complete payment status and an offline payment note. |
| Prescription belongs to a visit, can be saved and printed | Done | Prescription editor is scoped to a paid visit and supports save and print. |
| Less cluttered top navigation | Done | Main destinations remain visible; secondary destinations are grouped under More. |
| Keep database engine and connection credentials out of UI | Done | Removed database-engine wording from visible queue, surgery, and prescription copy. Credentials remain server-side configuration. |

## Gaps found and addressed

- Profile test updates now record the authenticated staff member in `updatedById`.
- Opening a paid visit from the queue now opens its prescription in the profile.
- New prescriptions now start blank instead of containing sample medications that could be mistaken for a real order. Saving requires at least one medication.

## Follow-up considerations

- The schema has an `updatedById` field but no relation or staff-name display for profile test authors. Add that if the clinical UI needs attribution history.
- Prescription records are append-only in the current API; editing a saved prescription is not part of the requested workflow and remains a separate enhancement.
