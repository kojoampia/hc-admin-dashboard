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

describe('PricingPlan e2e test', () => {
  const pricingPlanPageUrl = '/pricing-plan';
  const pricingPlanPageUrlPattern = new RegExp('/pricing-plan(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  const pricingPlanSample = {
    name: 'whether',
    description: 'confirm yieldingly',
    price: 16100.77,
    features: 'nor',
    billingCycle: 'ANNUALLY',
    active: true,
  };

  let pricingPlan;

  beforeEach(() => {
    cy.login(username, password);
  });

  beforeEach(() => {
    cy.intercept('GET', '/services/hcadminservice/api/pricing-plans+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/services/hcadminservice/api/pricing-plans').as('postEntityRequest');
    cy.intercept('DELETE', '/services/hcadminservice/api/pricing-plans/*').as('deleteEntityRequest');
  });

  afterEach(() => {
    if (pricingPlan) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/services/hcadminservice/api/pricing-plans/${pricingPlan.id}`,
      }).then(() => {
        pricingPlan = undefined;
      });
    }
  });

  it('PricingPlans menu should load PricingPlans page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('pricing-plan');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('PricingPlan').should('exist');
    cy.url().should('match', pricingPlanPageUrlPattern);
  });

  describe('PricingPlan page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(pricingPlanPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create PricingPlan page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/pricing-plan/new$'));
        cy.getEntityCreateUpdateHeading('PricingPlan');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', pricingPlanPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/services/hcadminservice/api/pricing-plans',
          body: pricingPlanSample,
        }).then(({ body }) => {
          pricingPlan = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/services/hcadminservice/api/pricing-plans+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              body: [pricingPlan],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(pricingPlanPageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details PricingPlan page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('pricingPlan');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', pricingPlanPageUrlPattern);
      });

      it('edit button click should load edit PricingPlan page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('PricingPlan');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', pricingPlanPageUrlPattern);
      });

      it('edit button click should load edit PricingPlan page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('PricingPlan');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', pricingPlanPageUrlPattern);
      });

      it('last delete button click should delete instance of PricingPlan', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('pricingPlan').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', pricingPlanPageUrlPattern);

        pricingPlan = undefined;
      });
    });
  });

  describe('new PricingPlan page', () => {
    beforeEach(() => {
      cy.visit(`${pricingPlanPageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('PricingPlan');
    });

    it('should create an instance of PricingPlan', () => {
      cy.get(`[data-cy="name"]`).type('quantify physically');
      cy.get(`[data-cy="name"]`).should('have.value', 'quantify physically');

      cy.get(`[data-cy="description"]`).type('total');
      cy.get(`[data-cy="description"]`).should('have.value', 'total');

      cy.get(`[data-cy="price"]`).type('31721.33');
      cy.get(`[data-cy="price"]`).should('have.value', '31721.33');

      cy.get(`[data-cy="features"]`).type('however pink reprove');
      cy.get(`[data-cy="features"]`).should('have.value', 'however pink reprove');

      cy.get(`[data-cy="billingCycle"]`).select('MONTHLY');

      cy.get(`[data-cy="active"]`).should('not.be.checked');
      cy.get(`[data-cy="active"]`).click();
      cy.get(`[data-cy="active"]`).should('be.checked');

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        pricingPlan = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', pricingPlanPageUrlPattern);
    });
  });
});
