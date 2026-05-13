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

describe('HProfessional e2e test', () => {
  const hProfessionalPageUrl = '/h-professional';
  const hProfessionalPageUrlPattern = new RegExp('/h-professional(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  const hProfessionalSample = {};

  let hProfessional;

  beforeEach(() => {
    cy.login(username, password);
  });

  beforeEach(() => {
    cy.intercept('GET', '/services/hcadminservice/api/h-professionals+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/services/hcadminservice/api/h-professionals').as('postEntityRequest');
    cy.intercept('DELETE', '/services/hcadminservice/api/h-professionals/*').as('deleteEntityRequest');
  });

  afterEach(() => {
    if (hProfessional) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/services/hcadminservice/api/h-professionals/${hProfessional.id}`,
      }).then(() => {
        hProfessional = undefined;
      });
    }
  });

  it('HProfessionals menu should load HProfessionals page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('h-professional');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('HProfessional').should('exist');
    cy.url().should('match', hProfessionalPageUrlPattern);
  });

  describe('HProfessional page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(hProfessionalPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create HProfessional page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/h-professional/new$'));
        cy.getEntityCreateUpdateHeading('HProfessional');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', hProfessionalPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/services/hcadminservice/api/h-professionals',
          body: hProfessionalSample,
        }).then(({ body }) => {
          hProfessional = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/services/hcadminservice/api/h-professionals+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              body: [hProfessional],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(hProfessionalPageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details HProfessional page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('hProfessional');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', hProfessionalPageUrlPattern);
      });

      it('edit button click should load edit HProfessional page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('HProfessional');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', hProfessionalPageUrlPattern);
      });

      it('edit button click should load edit HProfessional page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('HProfessional');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', hProfessionalPageUrlPattern);
      });

      it('last delete button click should delete instance of HProfessional', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('hProfessional').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', hProfessionalPageUrlPattern);

        hProfessional = undefined;
      });
    });
  });

  describe('new HProfessional page', () => {
    beforeEach(() => {
      cy.visit(`${hProfessionalPageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('HProfessional');
    });

    it('should create an instance of HProfessional', () => {
      cy.get(`[data-cy="name"]`).type('woot');
      cy.get(`[data-cy="name"]`).should('have.value', 'woot');

      cy.get(`[data-cy="organisation"]`).type('chow casket');
      cy.get(`[data-cy="organisation"]`).should('have.value', 'chow casket');

      cy.get(`[data-cy="roster"]`).type('accessorise pull joyous');
      cy.get(`[data-cy="roster"]`).should('have.value', 'accessorise pull joyous');

      cy.get(`[data-cy="createdDate"]`).type('2024-04-01');
      cy.get(`[data-cy="createdDate"]`).blur();
      cy.get(`[data-cy="createdDate"]`).should('have.value', '2024-04-01');

      cy.get(`[data-cy="createdBy"]`).type('cooperative lazily');
      cy.get(`[data-cy="createdBy"]`).should('have.value', 'cooperative lazily');

      cy.get(`[data-cy="modifiedDate"]`).type('2024-04-01');
      cy.get(`[data-cy="modifiedDate"]`).blur();
      cy.get(`[data-cy="modifiedDate"]`).should('have.value', '2024-04-01');

      cy.get(`[data-cy="modifiedBy"]`).type('given mortise');
      cy.get(`[data-cy="modifiedBy"]`).should('have.value', 'given mortise');

      cy.get(`[data-cy="profile"]`).type('hm aha although');
      cy.get(`[data-cy="profile"]`).should('have.value', 'hm aha although');

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        hProfessional = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', hProfessionalPageUrlPattern);
    });
  });
});
