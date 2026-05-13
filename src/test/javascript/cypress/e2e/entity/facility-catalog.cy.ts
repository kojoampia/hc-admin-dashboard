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

describe('FacilityCatalog e2e test', () => {
  const facilityCatalogPageUrl = '/facility-catalog';
  const facilityCatalogPageUrlPattern = new RegExp('/facility-catalog(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  const facilityCatalogSample = { name: 'and thick', description: 'musty', facilities: 'zowie hm' };

  let facilityCatalog;

  beforeEach(() => {
    cy.login(username, password);
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/facility-catalogs+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/facility-catalogs').as('postEntityRequest');
    cy.intercept('DELETE', '/api/facility-catalogs/*').as('deleteEntityRequest');
  });

  afterEach(() => {
    if (facilityCatalog) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/facility-catalogs/${facilityCatalog.id}`,
      }).then(() => {
        facilityCatalog = undefined;
      });
    }
  });

  it('FacilityCatalogs menu should load FacilityCatalogs page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('facility-catalog');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('FacilityCatalog').should('exist');
    cy.url().should('match', facilityCatalogPageUrlPattern);
  });

  describe('FacilityCatalog page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(facilityCatalogPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create FacilityCatalog page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/facility-catalog/new$'));
        cy.getEntityCreateUpdateHeading('FacilityCatalog');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', facilityCatalogPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/facility-catalogs',
          body: facilityCatalogSample,
        }).then(({ body }) => {
          facilityCatalog = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/facility-catalogs+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              body: [facilityCatalog],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(facilityCatalogPageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details FacilityCatalog page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('facilityCatalog');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', facilityCatalogPageUrlPattern);
      });

      it('edit button click should load edit FacilityCatalog page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('FacilityCatalog');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', facilityCatalogPageUrlPattern);
      });

      it('edit button click should load edit FacilityCatalog page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('FacilityCatalog');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', facilityCatalogPageUrlPattern);
      });

      it('last delete button click should delete instance of FacilityCatalog', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('facilityCatalog').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', facilityCatalogPageUrlPattern);

        facilityCatalog = undefined;
      });
    });
  });

  describe('new FacilityCatalog page', () => {
    beforeEach(() => {
      cy.visit(`${facilityCatalogPageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('FacilityCatalog');
    });

    it('should create an instance of FacilityCatalog', () => {
      cy.get(`[data-cy="name"]`).type('cow prudent');
      cy.get(`[data-cy="name"]`).should('have.value', 'cow prudent');

      cy.get(`[data-cy="description"]`).type('alert');
      cy.get(`[data-cy="description"]`).should('have.value', 'alert');

      cy.get(`[data-cy="facilities"]`).type('who whether');
      cy.get(`[data-cy="facilities"]`).should('have.value', 'who whether');

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        facilityCatalog = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', facilityCatalogPageUrlPattern);
    });
  });
});
