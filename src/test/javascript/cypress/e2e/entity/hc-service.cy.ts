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

describe('HCService e2e test', () => {
  const hCServicePageUrl = '/hc-service';
  const hCServicePageUrlPattern = new RegExp('/hc-service(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  const hCServiceSample = {};

  let hCService;

  beforeEach(() => {
    cy.login(username, password);
  });

  beforeEach(() => {
    cy.intercept('GET', '/services/hcadminservice/api/hc-services+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/services/hcadminservice/api/hc-services').as('postEntityRequest');
    cy.intercept('DELETE', '/services/hcadminservice/api/hc-services/*').as('deleteEntityRequest');
  });

  afterEach(() => {
    if (hCService) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/services/hcadminservice/api/hc-services/${hCService.id}`,
      }).then(() => {
        hCService = undefined;
      });
    }
  });

  it('HCServices menu should load HCServices page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('hc-service');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('HCService').should('exist');
    cy.url().should('match', hCServicePageUrlPattern);
  });

  describe('HCService page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(hCServicePageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create HCService page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/hc-service/new$'));
        cy.getEntityCreateUpdateHeading('HCService');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', hCServicePageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/services/hcadminservice/api/hc-services',
          body: hCServiceSample,
        }).then(({ body }) => {
          hCService = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/services/hcadminservice/api/hc-services+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              body: [hCService],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(hCServicePageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details HCService page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('hCService');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', hCServicePageUrlPattern);
      });

      it('edit button click should load edit HCService page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('HCService');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', hCServicePageUrlPattern);
      });

      it('edit button click should load edit HCService page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('HCService');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', hCServicePageUrlPattern);
      });

      it('last delete button click should delete instance of HCService', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('hCService').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', hCServicePageUrlPattern);

        hCService = undefined;
      });
    });
  });

  describe('new HCService page', () => {
    beforeEach(() => {
      cy.visit(`${hCServicePageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('HCService');
    });

    it('should create an instance of HCService', () => {
      cy.get(`[data-cy="name"]`).type('or');
      cy.get(`[data-cy="name"]`).should('have.value', 'or');

      cy.get(`[data-cy="description"]`).type('weakly jaggedly');
      cy.get(`[data-cy="description"]`).should('have.value', 'weakly jaggedly');

      cy.get(`[data-cy="serviceItems"]`).type('oxidize midst round');
      cy.get(`[data-cy="serviceItems"]`).should('have.value', 'oxidize midst round');

      cy.get(`[data-cy="amount"]`).type('8033.29');
      cy.get(`[data-cy="amount"]`).should('have.value', '8033.29');

      cy.get(`[data-cy="createdDate"]`).type('2024-03-26');
      cy.get(`[data-cy="createdDate"]`).blur();
      cy.get(`[data-cy="createdDate"]`).should('have.value', '2024-03-26');

      cy.get(`[data-cy="createdBy"]`).type('labourer');
      cy.get(`[data-cy="createdBy"]`).should('have.value', 'labourer');

      cy.get(`[data-cy="modifiedDate"]`).type('2024-03-26');
      cy.get(`[data-cy="modifiedDate"]`).blur();
      cy.get(`[data-cy="modifiedDate"]`).should('have.value', '2024-03-26');

      cy.get(`[data-cy="modifiedBy"]`).type('flash glorious');
      cy.get(`[data-cy="modifiedBy"]`).should('have.value', 'flash glorious');

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        hCService = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', hCServicePageUrlPattern);
    });
  });
});
