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

describe('Dashboard e2e test', () => {
  const dashboardPageUrl = '/dashboard';
  const dashboardPageUrlPattern = new RegExp('/dashboard(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  const dashboardSample = {};

  let dashboard;

  beforeEach(() => {
    cy.login(username, password);
  });

  beforeEach(() => {
    cy.intercept('GET', '/services/hcadminservice/api/dashboards+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/services/hcadminservice/api/dashboards').as('postEntityRequest');
    cy.intercept('DELETE', '/services/hcadminservice/api/dashboards/*').as('deleteEntityRequest');
  });

  afterEach(() => {
    if (dashboard) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/services/hcadminservice/api/dashboards/${dashboard.id}`,
      }).then(() => {
        dashboard = undefined;
      });
    }
  });

  it('Dashboards menu should load Dashboards page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('dashboard');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('Dashboard').should('exist');
    cy.url().should('match', dashboardPageUrlPattern);
  });

  describe('Dashboard page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(dashboardPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create Dashboard page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/dashboard/new$'));
        cy.getEntityCreateUpdateHeading('Dashboard');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', dashboardPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/services/hcadminservice/api/dashboards',
          body: dashboardSample,
        }).then(({ body }) => {
          dashboard = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/services/hcadminservice/api/dashboards+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              body: [dashboard],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(dashboardPageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details Dashboard page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('dashboard');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', dashboardPageUrlPattern);
      });

      it('edit button click should load edit Dashboard page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Dashboard');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', dashboardPageUrlPattern);
      });

      it('edit button click should load edit Dashboard page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Dashboard');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', dashboardPageUrlPattern);
      });

      it('last delete button click should delete instance of Dashboard', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('dashboard').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', dashboardPageUrlPattern);

        dashboard = undefined;
      });
    });
  });

  describe('new Dashboard page', () => {
    beforeEach(() => {
      cy.visit(`${dashboardPageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('Dashboard');
    });

    it('should create an instance of Dashboard', () => {
      cy.get(`[data-cy="name"]`).type('e-mail spirit');
      cy.get(`[data-cy="name"]`).should('have.value', 'e-mail spirit');

      cy.get(`[data-cy="description"]`).type('boohoo sturdy');
      cy.get(`[data-cy="description"]`).should('have.value', 'boohoo sturdy');

      cy.get(`[data-cy="elements"]`).type('till broadcast');
      cy.get(`[data-cy="elements"]`).should('have.value', 'till broadcast');

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        dashboard = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', dashboardPageUrlPattern);
    });
  });
});
