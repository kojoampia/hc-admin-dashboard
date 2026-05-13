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

describe('Feature e2e test', () => {
  const featurePageUrl = '/feature';
  const featurePageUrlPattern = new RegExp('/feature(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  const featureSample = { type: 'ADDON' };

  let feature;

  beforeEach(() => {
    cy.login(username, password);
  });

  beforeEach(() => {
    cy.intercept('GET', '/services/hcadminservice/api/features+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/services/hcadminservice/api/features').as('postEntityRequest');
    cy.intercept('DELETE', '/services/hcadminservice/api/features/*').as('deleteEntityRequest');
  });

  afterEach(() => {
    if (feature) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/services/hcadminservice/api/features/${feature.id}`,
      }).then(() => {
        feature = undefined;
      });
    }
  });

  it('Features menu should load Features page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('feature');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('Feature').should('exist');
    cy.url().should('match', featurePageUrlPattern);
  });

  describe('Feature page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(featurePageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create Feature page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/feature/new$'));
        cy.getEntityCreateUpdateHeading('Feature');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', featurePageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/services/hcadminservice/api/features',
          body: featureSample,
        }).then(({ body }) => {
          feature = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/services/hcadminservice/api/features+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              body: [feature],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(featurePageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details Feature page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('feature');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', featurePageUrlPattern);
      });

      it('edit button click should load edit Feature page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Feature');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', featurePageUrlPattern);
      });

      it('edit button click should load edit Feature page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Feature');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', featurePageUrlPattern);
      });

      it('last delete button click should delete instance of Feature', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('feature').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', featurePageUrlPattern);

        feature = undefined;
      });
    });
  });

  describe('new Feature page', () => {
    beforeEach(() => {
      cy.visit(`${featurePageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('Feature');
    });

    it('should create an instance of Feature', () => {
      cy.get(`[data-cy="name"]`).type('after gee');
      cy.get(`[data-cy="name"]`).should('have.value', 'after gee');

      cy.get(`[data-cy="description"]`).type('huzzah although');
      cy.get(`[data-cy="description"]`).should('have.value', 'huzzah although');

      cy.get(`[data-cy="type"]`).select('PREMIUM');

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        feature = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', featurePageUrlPattern);
    });
  });
});
