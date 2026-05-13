import {
  entityConfirmDeleteButtonSelector,
  entityCreateButtonSelector,
  entityCreateCancelButtonSelector,
  entityCreateSaveButtonSelector,
  entityDeleteButtonSelector,
  entityDetailsBackButtonSelector,
  entityDetailsButtonSelector,
  entityEditButtonSelector,
  entityTableSelector,
} from '../../support/entity';

describe('PatientPlan e2e test', () => {
  const patientPlanPageUrl = '/patient-plan';
  const patientPlanPageUrlPattern = new RegExp('/patient-plan(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  const patientPlanSample = {
    planId: 'pivot',
    patientId: 'aw defenseless',
    startDate: '2026-05-12',
    endDate: '2026-05-12',
    createdDate: '2026-05-12T15:21:22.142Z',
    createdBy: 'although boohoo scholarship',
  };

  let patientPlan;

  beforeEach(() => {
    cy.login(username, password);
  });

  beforeEach(() => {
    cy.intercept('GET', '/services/hcadminservice/api/patient-plans+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/services/hcadminservice/api/patient-plans').as('postEntityRequest');
    cy.intercept('DELETE', '/services/hcadminservice/api/patient-plans/*').as('deleteEntityRequest');
  });

  afterEach(() => {
    if (patientPlan) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/services/hcadminservice/api/patient-plans/${patientPlan.id}`,
      }).then(() => {
        patientPlan = undefined;
      });
    }
  });

  it('PatientPlans menu should load PatientPlans page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('patient-plan');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('PatientPlan').should('exist');
    cy.url().should('match', patientPlanPageUrlPattern);
  });

  describe('PatientPlan page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(patientPlanPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create PatientPlan page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/patient-plan/new$'));
        cy.getEntityCreateUpdateHeading('PatientPlan');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', patientPlanPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/services/hcadminservice/api/patient-plans',
          body: patientPlanSample,
        }).then(({ body }) => {
          patientPlan = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/services/hcadminservice/api/patient-plans+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              headers: {
                link: '<http://localhost/services/hcadminservice/api/patient-plans?page=0&size=20>; rel="last",<http://localhost/services/hcadminservice/api/patient-plans?page=0&size=20>; rel="first"',
              },
              body: [patientPlan],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(patientPlanPageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details PatientPlan page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('patientPlan');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', patientPlanPageUrlPattern);
      });

      it('edit button click should load edit PatientPlan page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('PatientPlan');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', patientPlanPageUrlPattern);
      });

      it('edit button click should load edit PatientPlan page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('PatientPlan');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', patientPlanPageUrlPattern);
      });

      it('last delete button click should delete instance of PatientPlan', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('patientPlan').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', patientPlanPageUrlPattern);

        patientPlan = undefined;
      });
    });
  });

  describe('new PatientPlan page', () => {
    beforeEach(() => {
      cy.visit(`${patientPlanPageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('PatientPlan');
    });

    it('should create an instance of PatientPlan', () => {
      cy.get(`[data-cy="planId"]`).type('questionably indeed card');
      cy.get(`[data-cy="planId"]`).should('have.value', 'questionably indeed card');

      cy.get(`[data-cy="patientId"]`).type('pale');
      cy.get(`[data-cy="patientId"]`).should('have.value', 'pale');

      cy.get(`[data-cy="startDate"]`).type('2026-05-12');
      cy.get(`[data-cy="startDate"]`).blur();
      cy.get(`[data-cy="startDate"]`).should('have.value', '2026-05-12');

      cy.get(`[data-cy="endDate"]`).type('2026-05-12');
      cy.get(`[data-cy="endDate"]`).blur();
      cy.get(`[data-cy="endDate"]`).should('have.value', '2026-05-12');

      cy.get(`[data-cy="createdDate"]`).type('2026-05-12T02:36');
      cy.get(`[data-cy="createdDate"]`).blur();
      cy.get(`[data-cy="createdDate"]`).should('have.value', '2026-05-12T02:36');

      cy.get(`[data-cy="createdBy"]`).type('woot');
      cy.get(`[data-cy="createdBy"]`).should('have.value', 'woot');

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        patientPlan = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', patientPlanPageUrlPattern);
    });
  });
});
