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

describe('DocumentItem e2e test', () => {
  const documentItemPageUrl = '/document-item';
  const documentItemPageUrlPattern = new RegExp('/document-item(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  const documentItemSample = {
    name: 'perfectly',
    description: 'innocently yet reprove',
    documentType: 'PASSPORT',
    url: 'https://damaged-tributary.org/',
    createdDate: '2026-05-12T03:37:29.122Z',
    createdBy: 'since when remand',
    modifiedDate: '2026-05-12T07:36:39.060Z',
    modifiedBy: 'regarding failing rebuke',
  };

  let documentItem;

  beforeEach(() => {
    cy.login(username, password);
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/document-items+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/document-items').as('postEntityRequest');
    cy.intercept('DELETE', '/api/document-items/*').as('deleteEntityRequest');
  });

  afterEach(() => {
    if (documentItem) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/document-items/${documentItem.id}`,
      }).then(() => {
        documentItem = undefined;
      });
    }
  });

  it('DocumentItems menu should load DocumentItems page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('document-item');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('DocumentItem').should('exist');
    cy.url().should('match', documentItemPageUrlPattern);
  });

  describe('DocumentItem page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(documentItemPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create DocumentItem page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/document-item/new$'));
        cy.getEntityCreateUpdateHeading('DocumentItem');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', documentItemPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/document-items',
          body: documentItemSample,
        }).then(({ body }) => {
          documentItem = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/document-items+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              headers: {
                link: '<http://localhost/api/document-items?page=0&size=20>; rel="last",<http://localhost/api/document-items?page=0&size=20>; rel="first"',
              },
              body: [documentItem],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(documentItemPageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details DocumentItem page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('documentItem');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', documentItemPageUrlPattern);
      });

      it('edit button click should load edit DocumentItem page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('DocumentItem');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', documentItemPageUrlPattern);
      });

      it('edit button click should load edit DocumentItem page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('DocumentItem');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', documentItemPageUrlPattern);
      });

      it('last delete button click should delete instance of DocumentItem', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('documentItem').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', documentItemPageUrlPattern);

        documentItem = undefined;
      });
    });
  });

  describe('new DocumentItem page', () => {
    beforeEach(() => {
      cy.visit(`${documentItemPageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('DocumentItem');
    });

    it('should create an instance of DocumentItem', () => {
      cy.get(`[data-cy="name"]`).type('far minus quicker');
      cy.get(`[data-cy="name"]`).should('have.value', 'far minus quicker');

      cy.get(`[data-cy="description"]`).type('boggle total');
      cy.get(`[data-cy="description"]`).should('have.value', 'boggle total');

      cy.get(`[data-cy="documentType"]`).select('PASSPORT');

      cy.get(`[data-cy="url"]`).type('https://dapper-haircut.biz/');
      cy.get(`[data-cy="url"]`).should('have.value', 'https://dapper-haircut.biz/');

      cy.get(`[data-cy="createdDate"]`).type('2026-05-12T19:26');
      cy.get(`[data-cy="createdDate"]`).blur();
      cy.get(`[data-cy="createdDate"]`).should('have.value', '2026-05-12T19:26');

      cy.get(`[data-cy="createdBy"]`).type('finally gosh');
      cy.get(`[data-cy="createdBy"]`).should('have.value', 'finally gosh');

      cy.get(`[data-cy="modifiedDate"]`).type('2026-05-12T04:08');
      cy.get(`[data-cy="modifiedDate"]`).blur();
      cy.get(`[data-cy="modifiedDate"]`).should('have.value', '2026-05-12T04:08');

      cy.get(`[data-cy="modifiedBy"]`).type('uh-huh brr aggravating');
      cy.get(`[data-cy="modifiedBy"]`).should('have.value', 'uh-huh brr aggravating');

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        documentItem = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', documentItemPageUrlPattern);
    });
  });
});
