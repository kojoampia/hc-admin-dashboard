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

describe('Person e2e test', () => {
  const personPageUrl = '/person';
  const personPageUrlPattern = new RegExp('/person(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  const personSample = {
    firstName: 'Arvid',
    middleName: 'ew',
    lastName: 'Hudson',
    birthDate: '2026-05-12',
    gender: 'MALE',
    maritalStatus: 'yearly',
    nationality: 'quit bewail apparatus',
    language: 'HAUSA',
    createdDate: '2026-05-12T12:24:17.019Z',
    modifiedDate: '2026-05-12T15:13:20.706Z',
    createdBy: 'lest',
    modifiedBy: 'voluntarily',
  };

  let person;

  beforeEach(() => {
    cy.login(username, password);
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/people+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/people').as('postEntityRequest');
    cy.intercept('DELETE', '/api/people/*').as('deleteEntityRequest');
  });

  afterEach(() => {
    if (person) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/people/${person.id}`,
      }).then(() => {
        person = undefined;
      });
    }
  });

  it('People menu should load People page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('person');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('Person').should('exist');
    cy.url().should('match', personPageUrlPattern);
  });

  describe('Person page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(personPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create Person page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/person/new$'));
        cy.getEntityCreateUpdateHeading('Person');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', personPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/people',
          body: personSample,
        }).then(({ body }) => {
          person = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/people+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              headers: {
                link: '<http://localhost/api/people?page=0&size=20>; rel="last",<http://localhost/api/people?page=0&size=20>; rel="first"',
              },
              body: [person],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(personPageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details Person page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('person');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', personPageUrlPattern);
      });

      it('edit button click should load edit Person page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Person');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', personPageUrlPattern);
      });

      it('edit button click should load edit Person page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Person');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', personPageUrlPattern);
      });

      it('last delete button click should delete instance of Person', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('person').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', personPageUrlPattern);

        person = undefined;
      });
    });
  });

  describe('new Person page', () => {
    beforeEach(() => {
      cy.visit(`${personPageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('Person');
    });

    it('should create an instance of Person', () => {
      cy.get(`[data-cy="firstName"]`).type('Clyde');
      cy.get(`[data-cy="firstName"]`).should('have.value', 'Clyde');

      cy.get(`[data-cy="middleName"]`).type('advertisement');
      cy.get(`[data-cy="middleName"]`).should('have.value', 'advertisement');

      cy.get(`[data-cy="lastName"]`).type('Langosh');
      cy.get(`[data-cy="lastName"]`).should('have.value', 'Langosh');

      cy.get(`[data-cy="birthDate"]`).type('2026-05-12');
      cy.get(`[data-cy="birthDate"]`).blur();
      cy.get(`[data-cy="birthDate"]`).should('have.value', '2026-05-12');

      cy.get(`[data-cy="gender"]`).select('MALE');

      cy.get(`[data-cy="maritalStatus"]`).type('whereas meanwhile hmph');
      cy.get(`[data-cy="maritalStatus"]`).should('have.value', 'whereas meanwhile hmph');

      cy.get(`[data-cy="nationality"]`).type('dicker');
      cy.get(`[data-cy="nationality"]`).should('have.value', 'dicker');

      cy.get(`[data-cy="language"]`).select('AKAN');

      cy.get(`[data-cy="createdDate"]`).type('2026-05-12T02:49');
      cy.get(`[data-cy="createdDate"]`).blur();
      cy.get(`[data-cy="createdDate"]`).should('have.value', '2026-05-12T02:49');

      cy.get(`[data-cy="modifiedDate"]`).type('2026-05-12T08:35');
      cy.get(`[data-cy="modifiedDate"]`).blur();
      cy.get(`[data-cy="modifiedDate"]`).should('have.value', '2026-05-12T08:35');

      cy.get(`[data-cy="createdBy"]`).type('yuck mainstream');
      cy.get(`[data-cy="createdBy"]`).should('have.value', 'yuck mainstream');

      cy.get(`[data-cy="modifiedBy"]`).type('freely aha amongst');
      cy.get(`[data-cy="modifiedBy"]`).should('have.value', 'freely aha amongst');

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        person = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', personPageUrlPattern);
    });
  });
});
