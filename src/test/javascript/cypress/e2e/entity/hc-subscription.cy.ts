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

describe('HCSubscription e2e test', () => {
  const hCSubscriptionPageUrl = '/hc-subscription';
  const hCSubscriptionPageUrlPattern = new RegExp('/hc-subscription(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  const hCSubscriptionSample = {};

  let hCSubscription;

  beforeEach(() => {
    cy.login(username, password);
  });

  beforeEach(() => {
    cy.intercept('GET', '/services/hcadminservice/api/hc-subscriptions+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/services/hcadminservice/api/hc-subscriptions').as('postEntityRequest');
    cy.intercept('DELETE', '/services/hcadminservice/api/hc-subscriptions/*').as('deleteEntityRequest');
  });

  afterEach(() => {
    if (hCSubscription) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/services/hcadminservice/api/hc-subscriptions/${hCSubscription.id}`,
      }).then(() => {
        hCSubscription = undefined;
      });
    }
  });

  it('HCSubscriptions menu should load HCSubscriptions page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('hc-subscription');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('HCSubscription').should('exist');
    cy.url().should('match', hCSubscriptionPageUrlPattern);
  });

  describe('HCSubscription page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(hCSubscriptionPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create HCSubscription page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/hc-subscription/new$'));
        cy.getEntityCreateUpdateHeading('HCSubscription');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', hCSubscriptionPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/services/hcadminservice/api/hc-subscriptions',
          body: hCSubscriptionSample,
        }).then(({ body }) => {
          hCSubscription = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/services/hcadminservice/api/hc-subscriptions+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              body: [hCSubscription],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(hCSubscriptionPageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details HCSubscription page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('hCSubscription');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', hCSubscriptionPageUrlPattern);
      });

      it('edit button click should load edit HCSubscription page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('HCSubscription');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', hCSubscriptionPageUrlPattern);
      });

      it('edit button click should load edit HCSubscription page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('HCSubscription');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', hCSubscriptionPageUrlPattern);
      });

      it('last delete button click should delete instance of HCSubscription', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('hCSubscription').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', hCSubscriptionPageUrlPattern);

        hCSubscription = undefined;
      });
    });
  });

  describe('new HCSubscription page', () => {
    beforeEach(() => {
      cy.visit(`${hCSubscriptionPageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('HCSubscription');
    });

    it('should create an instance of HCSubscription', () => {
      cy.get(`[data-cy="serviceId"]`).type('um');
      cy.get(`[data-cy="serviceId"]`).should('have.value', 'um');

      cy.get(`[data-cy="patientId"]`).type('thread hastily masculinize');
      cy.get(`[data-cy="patientId"]`).should('have.value', 'thread hastily masculinize');

      cy.get(`[data-cy="isActive"]`).should('not.be.checked');
      cy.get(`[data-cy="isActive"]`).click();
      cy.get(`[data-cy="isActive"]`).should('be.checked');

      cy.get(`[data-cy="createdDate"]`).type('2024-03-26T05:14');
      cy.get(`[data-cy="createdDate"]`).blur();
      cy.get(`[data-cy="createdDate"]`).should('have.value', '2024-03-26T05:14');

      cy.get(`[data-cy="modifiedDate"]`).type('2024-03-26T14:44');
      cy.get(`[data-cy="modifiedDate"]`).blur();
      cy.get(`[data-cy="modifiedDate"]`).should('have.value', '2024-03-26T14:44');

      cy.get(`[data-cy="createdBy"]`).type('youthfully');
      cy.get(`[data-cy="createdBy"]`).should('have.value', 'youthfully');

      cy.get(`[data-cy="modifiedBy"]`).type('pertain');
      cy.get(`[data-cy="modifiedBy"]`).should('have.value', 'pertain');

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        hCSubscription = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', hCSubscriptionPageUrlPattern);
    });
  });
});
