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

describe('SystemCatalog e2e test', () => {
  const systemCatalogPageUrl = '/system-catalog';
  const systemCatalogPageUrlPattern = new RegExp('/system-catalog(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  const systemCatalogSample = {
    name: 'quizzically well carouse',
    description: 'unto pish crowded',
    type: 'ABOUT',
    content: 'Li4vZmFrZS1kYXRhL2Jsb2IvaGlwc3Rlci50eHQ=',
    createdDate: '2026-05-11T20:05:53.161Z',
    modifiedDate: '2026-05-12T16:22:15.868Z',
    createdBy: 'iridescence on dish',
    modifiedBy: 'structure graduate woeful',
  };

  let systemCatalog;

  beforeEach(() => {
    cy.login(username, password);
  });

  beforeEach(() => {
    cy.intercept('GET', '/services/hcadminservice/api/system-catalogs+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/services/hcadminservice/api/system-catalogs').as('postEntityRequest');
    cy.intercept('DELETE', '/services/hcadminservice/api/system-catalogs/*').as('deleteEntityRequest');
  });

  afterEach(() => {
    if (systemCatalog) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/services/hcadminservice/api/system-catalogs/${systemCatalog.id}`,
      }).then(() => {
        systemCatalog = undefined;
      });
    }
  });

  it('SystemCatalogs menu should load SystemCatalogs page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('system-catalog');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('SystemCatalog').should('exist');
    cy.url().should('match', systemCatalogPageUrlPattern);
  });

  describe('SystemCatalog page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(systemCatalogPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create SystemCatalog page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/system-catalog/new$'));
        cy.getEntityCreateUpdateHeading('SystemCatalog');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', systemCatalogPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/services/hcadminservice/api/system-catalogs',
          body: systemCatalogSample,
        }).then(({ body }) => {
          systemCatalog = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/services/hcadminservice/api/system-catalogs+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              headers: {
                link: '<http://localhost/services/hcadminservice/api/system-catalogs?page=0&size=20>; rel="last",<http://localhost/services/hcadminservice/api/system-catalogs?page=0&size=20>; rel="first"',
              },
              body: [systemCatalog],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(systemCatalogPageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details SystemCatalog page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('systemCatalog');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', systemCatalogPageUrlPattern);
      });

      it('edit button click should load edit SystemCatalog page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('SystemCatalog');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', systemCatalogPageUrlPattern);
      });

      it('edit button click should load edit SystemCatalog page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('SystemCatalog');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', systemCatalogPageUrlPattern);
      });

      it('last delete button click should delete instance of SystemCatalog', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('systemCatalog').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', systemCatalogPageUrlPattern);

        systemCatalog = undefined;
      });
    });
  });

  describe('new SystemCatalog page', () => {
    beforeEach(() => {
      cy.visit(`${systemCatalogPageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('SystemCatalog');
    });

    it('should create an instance of SystemCatalog', () => {
      cy.get(`[data-cy="name"]`).type('scratchy');
      cy.get(`[data-cy="name"]`).should('have.value', 'scratchy');

      cy.get(`[data-cy="description"]`).type('dirty bob bah');
      cy.get(`[data-cy="description"]`).should('have.value', 'dirty bob bah');

      cy.get(`[data-cy="type"]`).select('CONTACT');

      cy.get(`[data-cy="content"]`).type('../fake-data/blob/hipster.txt');
      cy.get(`[data-cy="content"]`).invoke('val').should('match', new RegExp('../fake-data/blob/hipster.txt'));

      cy.get(`[data-cy="createdDate"]`).type('2026-05-11T22:44');
      cy.get(`[data-cy="createdDate"]`).blur();
      cy.get(`[data-cy="createdDate"]`).should('have.value', '2026-05-11T22:44');

      cy.get(`[data-cy="modifiedDate"]`).type('2026-05-12T02:17');
      cy.get(`[data-cy="modifiedDate"]`).blur();
      cy.get(`[data-cy="modifiedDate"]`).should('have.value', '2026-05-12T02:17');

      cy.get(`[data-cy="createdBy"]`).type('thorny');
      cy.get(`[data-cy="createdBy"]`).should('have.value', 'thorny');

      cy.get(`[data-cy="modifiedBy"]`).type('blah bright scented');
      cy.get(`[data-cy="modifiedBy"]`).should('have.value', 'blah bright scented');

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        systemCatalog = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', systemCatalogPageUrlPattern);
    });
  });
});
