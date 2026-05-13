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

describe('Professional e2e test', () => {
  const professionalPageUrl = '/professional';
  const professionalPageUrlPattern = new RegExp('/professional(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  const professionalSample = {};

  let professional;

  beforeEach(() => {
    cy.login(username, password);
  });

  beforeEach(() => {
    cy.intercept('GET', '/services/hcadminservice/api/professionals+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/services/hcadminservice/api/professionals').as('postEntityRequest');
    cy.intercept('DELETE', '/services/hcadminservice/api/professionals/*').as('deleteEntityRequest');
  });

  afterEach(() => {
    if (professional) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/services/hcadminservice/api/professionals/${professional.id}`,
      }).then(() => {
        professional = undefined;
      });
    }
  });

  it('Professionals menu should load Professionals page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('professional');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('Professional').should('exist');
    cy.url().should('match', professionalPageUrlPattern);
  });

  describe('Professional page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(professionalPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create Professional page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/professional/new$'));
        cy.getEntityCreateUpdateHeading('Professional');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', professionalPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/services/hcadminservice/api/professionals',
          body: professionalSample,
        }).then(({ body }) => {
          professional = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/services/hcadminservice/api/professionals+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              body: [professional],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(professionalPageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details Professional page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('professional');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', professionalPageUrlPattern);
      });

      it('edit button click should load edit Professional page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Professional');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', professionalPageUrlPattern);
      });

      it('edit button click should load edit Professional page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Professional');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', professionalPageUrlPattern);
      });

      it('last delete button click should delete instance of Professional', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('professional').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', professionalPageUrlPattern);

        professional = undefined;
      });
    });
  });

  describe('new Professional page', () => {
    beforeEach(() => {
      cy.visit(`${professionalPageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('Professional');
    });

    it('should create an instance of Professional', () => {
      cy.get(`[data-cy="name"]`).type('regarding onto');
      cy.get(`[data-cy="name"]`).should('have.value', 'regarding onto');

      cy.get(`[data-cy="organisation"]`).type('even throughout');
      cy.get(`[data-cy="organisation"]`).should('have.value', 'even throughout');

      cy.get(`[data-cy="roster"]`).type('quantify consequently');
      cy.get(`[data-cy="roster"]`).should('have.value', 'quantify consequently');

      cy.get(`[data-cy="profile"]`).type('hence gah who');
      cy.get(`[data-cy="profile"]`).should('have.value', 'hence gah who');

      cy.get(`[data-cy="createdDate"]`).type('2024-04-01');
      cy.get(`[data-cy="createdDate"]`).blur();
      cy.get(`[data-cy="createdDate"]`).should('have.value', '2024-04-01');

      cy.get(`[data-cy="createdBy"]`).type('huzzah phew');
      cy.get(`[data-cy="createdBy"]`).should('have.value', 'huzzah phew');

      cy.get(`[data-cy="modifiedDate"]`).type('2024-04-01');
      cy.get(`[data-cy="modifiedDate"]`).blur();
      cy.get(`[data-cy="modifiedDate"]`).should('have.value', '2024-04-01');

      cy.get(`[data-cy="modifiedBy"]`).type('sheepishly cruelly yuck');
      cy.get(`[data-cy="modifiedBy"]`).should('have.value', 'sheepishly cruelly yuck');

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        professional = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', professionalPageUrlPattern);
    });
  });
});
