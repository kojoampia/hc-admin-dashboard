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

describe('Facility e2e test', () => {
  const facilityPageUrl = '/facility';
  const facilityPageUrlPattern = new RegExp('/facility(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  const facilitySample = {
    name: 'worriedly makeover',
    description: 'jogging whenever straight',
    type: 'PHARMACY',
    addressId: 'wee successfully',
    contactId: 'electrify',
    createdDate: '2026-05-12T12:12:56.706Z',
    modifiedBy: 'ironclad',
    modifiedDate: '2026-05-12T02:54:18.692Z',
  };

  let facility;

  beforeEach(() => {
    cy.login(username, password);
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/facilities+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/facilities').as('postEntityRequest');
    cy.intercept('DELETE', '/api/facilities/*').as('deleteEntityRequest');
  });

  afterEach(() => {
    if (facility) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/facilities/${facility.id}`,
      }).then(() => {
        facility = undefined;
      });
    }
  });

  it('Facilities menu should load Facilities page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('facility');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('Facility').should('exist');
    cy.url().should('match', facilityPageUrlPattern);
  });

  describe('Facility page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(facilityPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create Facility page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/facility/new$'));
        cy.getEntityCreateUpdateHeading('Facility');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', facilityPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/facilities',
          body: facilitySample,
        }).then(({ body }) => {
          facility = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/facilities+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              headers: {
                link: '<http://localhost/api/facilities?page=0&size=20>; rel="last",<http://localhost/api/facilities?page=0&size=20>; rel="first"',
              },
              body: [facility],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(facilityPageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details Facility page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('facility');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', facilityPageUrlPattern);
      });

      it('edit button click should load edit Facility page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Facility');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', facilityPageUrlPattern);
      });

      it('edit button click should load edit Facility page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Facility');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', facilityPageUrlPattern);
      });

      it('last delete button click should delete instance of Facility', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('facility').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', facilityPageUrlPattern);

        facility = undefined;
      });
    });
  });

  describe('new Facility page', () => {
    beforeEach(() => {
      cy.visit(`${facilityPageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('Facility');
    });

    it('should create an instance of Facility', () => {
      cy.get(`[data-cy="name"]`).type('larva willing');
      cy.get(`[data-cy="name"]`).should('have.value', 'larva willing');

      cy.get(`[data-cy="description"]`).type('swear ugly');
      cy.get(`[data-cy="description"]`).should('have.value', 'swear ugly');

      cy.get(`[data-cy="type"]`).select('HOSPICE');

      cy.get(`[data-cy="addressId"]`).type('upon');
      cy.get(`[data-cy="addressId"]`).should('have.value', 'upon');

      cy.get(`[data-cy="contactId"]`).type('hmph unless');
      cy.get(`[data-cy="contactId"]`).should('have.value', 'hmph unless');

      cy.get(`[data-cy="photos"]`).type('wherever');
      cy.get(`[data-cy="photos"]`).should('have.value', 'wherever');

      cy.get(`[data-cy="createdBy"]`).type('badly unique');
      cy.get(`[data-cy="createdBy"]`).should('have.value', 'badly unique');

      cy.get(`[data-cy="createdDate"]`).type('2026-05-12T21:13');
      cy.get(`[data-cy="createdDate"]`).blur();
      cy.get(`[data-cy="createdDate"]`).should('have.value', '2026-05-12T21:13');

      cy.get(`[data-cy="modifiedBy"]`).type('subtract firm nudge');
      cy.get(`[data-cy="modifiedBy"]`).should('have.value', 'subtract firm nudge');

      cy.get(`[data-cy="modifiedDate"]`).type('2026-05-12T11:38');
      cy.get(`[data-cy="modifiedDate"]`).blur();
      cy.get(`[data-cy="modifiedDate"]`).should('have.value', '2026-05-12T11:38');

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        facility = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', facilityPageUrlPattern);
    });
  });
});
