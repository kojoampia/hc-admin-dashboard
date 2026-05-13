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

describe('DutyRoster e2e test', () => {
  const dutyRosterPageUrl = '/duty-roster';
  const dutyRosterPageUrlPattern = new RegExp('/duty-roster(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  const dutyRosterSample = {
    date: '2026-05-12',
    duty: 'MEDIC',
    professionalId: 'gulp pneumonia petal',
    shift: 'MORNING',
    name: 'mould mockingly sans',
    patientId: 'ouch satirise',
  };

  let dutyRoster;

  beforeEach(() => {
    cy.login(username, password);
  });

  beforeEach(() => {
    cy.intercept('GET', '/services/hcadminservice/api/duty-rosters+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/services/hcadminservice/api/duty-rosters').as('postEntityRequest');
    cy.intercept('DELETE', '/services/hcadminservice/api/duty-rosters/*').as('deleteEntityRequest');
  });

  afterEach(() => {
    if (dutyRoster) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/services/hcadminservice/api/duty-rosters/${dutyRoster.id}`,
      }).then(() => {
        dutyRoster = undefined;
      });
    }
  });

  it('DutyRosters menu should load DutyRosters page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('duty-roster');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('DutyRoster').should('exist');
    cy.url().should('match', dutyRosterPageUrlPattern);
  });

  describe('DutyRoster page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(dutyRosterPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create DutyRoster page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/duty-roster/new$'));
        cy.getEntityCreateUpdateHeading('DutyRoster');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', dutyRosterPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/services/hcadminservice/api/duty-rosters',
          body: dutyRosterSample,
        }).then(({ body }) => {
          dutyRoster = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/services/hcadminservice/api/duty-rosters+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              headers: {
                link: '<http://localhost/services/hcadminservice/api/duty-rosters?page=0&size=20>; rel="last",<http://localhost/services/hcadminservice/api/duty-rosters?page=0&size=20>; rel="first"',
              },
              body: [dutyRoster],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(dutyRosterPageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details DutyRoster page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('dutyRoster');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', dutyRosterPageUrlPattern);
      });

      it('edit button click should load edit DutyRoster page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('DutyRoster');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', dutyRosterPageUrlPattern);
      });

      it('edit button click should load edit DutyRoster page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('DutyRoster');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', dutyRosterPageUrlPattern);
      });

      it('last delete button click should delete instance of DutyRoster', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('dutyRoster').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', dutyRosterPageUrlPattern);

        dutyRoster = undefined;
      });
    });
  });

  describe('new DutyRoster page', () => {
    beforeEach(() => {
      cy.visit(`${dutyRosterPageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('DutyRoster');
    });

    it('should create an instance of DutyRoster', () => {
      cy.get(`[data-cy="date"]`).type('2026-05-11');
      cy.get(`[data-cy="date"]`).blur();
      cy.get(`[data-cy="date"]`).should('have.value', '2026-05-11');

      cy.get(`[data-cy="duty"]`).select('ADMINISTRATOR');

      cy.get(`[data-cy="professionalId"]`).type('before too');
      cy.get(`[data-cy="professionalId"]`).should('have.value', 'before too');

      cy.get(`[data-cy="shift"]`).select('AFTERNOON');

      cy.get(`[data-cy="name"]`).type('knavishly quarrelsome');
      cy.get(`[data-cy="name"]`).should('have.value', 'knavishly quarrelsome');

      cy.get(`[data-cy="description"]`).type('wear');
      cy.get(`[data-cy="description"]`).should('have.value', 'wear');

      cy.get(`[data-cy="patientId"]`).type('searchingly pish');
      cy.get(`[data-cy="patientId"]`).should('have.value', 'searchingly pish');

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        dutyRoster = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', dutyRosterPageUrlPattern);
    });
  });
});
