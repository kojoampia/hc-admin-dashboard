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

describe('Team e2e test', () => {
  const teamPageUrl = '/team';
  const teamPageUrlPattern = new RegExp('/team(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  const teamSample = {
    name: 'freely',
    description: 'velvety pupil',
    createdBy: 'innocently approximate now',
    createdDate: '2026-05-12T01:53:02.981Z',
    modifiedBy: 'from where',
    modifiedDate: '2026-05-12T21:59:22.818Z',
  };

  let team;

  beforeEach(() => {
    cy.login(username, password);
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/teams+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/teams').as('postEntityRequest');
    cy.intercept('DELETE', '/api/teams/*').as('deleteEntityRequest');
  });

  afterEach(() => {
    if (team) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/teams/${team.id}`,
      }).then(() => {
        team = undefined;
      });
    }
  });

  it('Teams menu should load Teams page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('team');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('Team').should('exist');
    cy.url().should('match', teamPageUrlPattern);
  });

  describe('Team page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(teamPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create Team page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/team/new$'));
        cy.getEntityCreateUpdateHeading('Team');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', teamPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/teams',
          body: teamSample,
        }).then(({ body }) => {
          team = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/teams+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              headers: {
                link: '<http://localhost/api/teams?page=0&size=20>; rel="last",<http://localhost/api/teams?page=0&size=20>; rel="first"',
              },
              body: [team],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(teamPageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details Team page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('team');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', teamPageUrlPattern);
      });

      it('edit button click should load edit Team page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Team');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', teamPageUrlPattern);
      });

      it('edit button click should load edit Team page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Team');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', teamPageUrlPattern);
      });

      it('last delete button click should delete instance of Team', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('team').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', teamPageUrlPattern);

        team = undefined;
      });
    });
  });

  describe('new Team page', () => {
    beforeEach(() => {
      cy.visit(`${teamPageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('Team');
    });

    it('should create an instance of Team', () => {
      cy.get(`[data-cy="name"]`).type('thin why ramp');
      cy.get(`[data-cy="name"]`).should('have.value', 'thin why ramp');

      cy.get(`[data-cy="description"]`).type('unaccountably which');
      cy.get(`[data-cy="description"]`).should('have.value', 'unaccountably which');

      cy.get(`[data-cy="members"]`).type('refine whenever measly');
      cy.get(`[data-cy="members"]`).should('have.value', 'refine whenever measly');

      cy.get(`[data-cy="supervisorId"]`).type('nudge');
      cy.get(`[data-cy="supervisorId"]`).should('have.value', 'nudge');

      cy.get(`[data-cy="organisationId"]`).type('boohoo furiously');
      cy.get(`[data-cy="organisationId"]`).should('have.value', 'boohoo furiously');

      cy.get(`[data-cy="createdBy"]`).type('um reward impact');
      cy.get(`[data-cy="createdBy"]`).should('have.value', 'um reward impact');

      cy.get(`[data-cy="createdDate"]`).type('2026-05-12T04:35');
      cy.get(`[data-cy="createdDate"]`).blur();
      cy.get(`[data-cy="createdDate"]`).should('have.value', '2026-05-12T04:35');

      cy.get(`[data-cy="modifiedBy"]`).type('upliftingly athwart');
      cy.get(`[data-cy="modifiedBy"]`).should('have.value', 'upliftingly athwart');

      cy.get(`[data-cy="modifiedDate"]`).type('2026-05-11T22:45');
      cy.get(`[data-cy="modifiedDate"]`).blur();
      cy.get(`[data-cy="modifiedDate"]`).should('have.value', '2026-05-11T22:45');

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        team = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', teamPageUrlPattern);
    });
  });
});
