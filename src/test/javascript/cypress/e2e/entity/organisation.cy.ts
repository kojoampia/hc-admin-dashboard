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

describe('Organisation e2e test', () => {
  const organisationPageUrl = '/organisation';
  const organisationPageUrlPattern = new RegExp('/organisation(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  const organisationSample = {
    name: 'pleasing',
    description: 'indeed gah',
    addressId: 'grade',
    contactId: 'spork',
    createdBy: 'uh-huh outlaw',
    createdDate: '2026-05-12T06:37:40.260Z',
    modifiedBy: 'openly',
    modifiedDate: '2026-05-12T22:03:14.441Z',
  };

  let organisation;

  beforeEach(() => {
    cy.login(username, password);
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/organisations+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/organisations').as('postEntityRequest');
    cy.intercept('DELETE', '/api/organisations/*').as('deleteEntityRequest');
  });

  afterEach(() => {
    if (organisation) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/organisations/${organisation.id}`,
      }).then(() => {
        organisation = undefined;
      });
    }
  });

  it('Organisations menu should load Organisations page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('organisation');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('Organisation').should('exist');
    cy.url().should('match', organisationPageUrlPattern);
  });

  describe('Organisation page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(organisationPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create Organisation page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/organisation/new$'));
        cy.getEntityCreateUpdateHeading('Organisation');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', organisationPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/organisations',
          body: organisationSample,
        }).then(({ body }) => {
          organisation = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/organisations+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              headers: {
                link: '<http://localhost/api/organisations?page=0&size=20>; rel="last",<http://localhost/api/organisations?page=0&size=20>; rel="first"',
              },
              body: [organisation],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(organisationPageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details Organisation page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('organisation');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', organisationPageUrlPattern);
      });

      it('edit button click should load edit Organisation page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Organisation');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', organisationPageUrlPattern);
      });

      it('edit button click should load edit Organisation page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Organisation');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', organisationPageUrlPattern);
      });

      it('last delete button click should delete instance of Organisation', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('organisation').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', organisationPageUrlPattern);

        organisation = undefined;
      });
    });
  });

  describe('new Organisation page', () => {
    beforeEach(() => {
      cy.visit(`${organisationPageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('Organisation');
    });

    it('should create an instance of Organisation', () => {
      cy.get(`[data-cy="name"]`).type('opposite underneath');
      cy.get(`[data-cy="name"]`).should('have.value', 'opposite underneath');

      cy.get(`[data-cy="description"]`).type('birdbath');
      cy.get(`[data-cy="description"]`).should('have.value', 'birdbath');

      cy.get(`[data-cy="addressId"]`).type('than');
      cy.get(`[data-cy="addressId"]`).should('have.value', 'than');

      cy.get(`[data-cy="contactId"]`).type('failing chapel creative');
      cy.get(`[data-cy="contactId"]`).should('have.value', 'failing chapel creative');

      cy.get(`[data-cy="createdBy"]`).type('monasticism gloss marten');
      cy.get(`[data-cy="createdBy"]`).should('have.value', 'monasticism gloss marten');

      cy.get(`[data-cy="createdDate"]`).type('2026-05-12T22:20');
      cy.get(`[data-cy="createdDate"]`).blur();
      cy.get(`[data-cy="createdDate"]`).should('have.value', '2026-05-12T22:20');

      cy.get(`[data-cy="modifiedBy"]`).type('delete yowza');
      cy.get(`[data-cy="modifiedBy"]`).should('have.value', 'delete yowza');

      cy.get(`[data-cy="modifiedDate"]`).type('2026-05-12T22:27');
      cy.get(`[data-cy="modifiedDate"]`).blur();
      cy.get(`[data-cy="modifiedDate"]`).should('have.value', '2026-05-12T22:27');

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        organisation = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', organisationPageUrlPattern);
    });
  });
});
