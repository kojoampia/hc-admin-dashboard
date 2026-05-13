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

describe('Profile e2e test', () => {
  const profilePageUrl = '/profile';
  const profilePageUrlPattern = new RegExp('/profile(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  const profileSample = {
    personId: 'bah colossal',
    photoId: 'supposing typewriter',
    contactId: 'which shred gleefully',
    addressList: 'whenever unselfish throughout',
    status: false,
    organisationId: 'officially gently vestment',
    teamId: 'slather beside',
    documentItems: 'cleave uncork warped',
    createdBy: 'come frightfully excepting',
    createdDate: '2026-05-12T20:28:50.478Z',
    modifiedBy: 'fall',
    modifiedDate: '2026-05-12T17:52:21.225Z',
  };

  let profile;

  beforeEach(() => {
    cy.login(username, password);
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/profiles+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/profiles').as('postEntityRequest');
    cy.intercept('DELETE', '/api/profiles/*').as('deleteEntityRequest');
  });

  afterEach(() => {
    if (profile) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/profiles/${profile.id}`,
      }).then(() => {
        profile = undefined;
      });
    }
  });

  it('Profiles menu should load Profiles page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('profile');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('Profile').should('exist');
    cy.url().should('match', profilePageUrlPattern);
  });

  describe('Profile page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(profilePageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create Profile page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/profile/new$'));
        cy.getEntityCreateUpdateHeading('Profile');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', profilePageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/profiles',
          body: profileSample,
        }).then(({ body }) => {
          profile = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/profiles+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              headers: {
                link: '<http://localhost/api/profiles?page=0&size=20>; rel="last",<http://localhost/api/profiles?page=0&size=20>; rel="first"',
              },
              body: [profile],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(profilePageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details Profile page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('profile');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', profilePageUrlPattern);
      });

      it('edit button click should load edit Profile page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Profile');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', profilePageUrlPattern);
      });

      it('edit button click should load edit Profile page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Profile');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', profilePageUrlPattern);
      });

      it('last delete button click should delete instance of Profile', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('profile').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', profilePageUrlPattern);

        profile = undefined;
      });
    });
  });

  describe('new Profile page', () => {
    beforeEach(() => {
      cy.visit(`${profilePageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('Profile');
    });

    it('should create an instance of Profile', () => {
      cy.get(`[data-cy="personId"]`).type('swerve provided');
      cy.get(`[data-cy="personId"]`).should('have.value', 'swerve provided');

      cy.get(`[data-cy="photoId"]`).type('vacantly');
      cy.get(`[data-cy="photoId"]`).should('have.value', 'vacantly');

      cy.get(`[data-cy="contactId"]`).type('smoggy');
      cy.get(`[data-cy="contactId"]`).should('have.value', 'smoggy');

      cy.get(`[data-cy="addressList"]`).type('as adventurously behest');
      cy.get(`[data-cy="addressList"]`).should('have.value', 'as adventurously behest');

      cy.get(`[data-cy="roles"]`).type('inure impish');
      cy.get(`[data-cy="roles"]`).should('have.value', 'inure impish');

      cy.get(`[data-cy="status"]`).should('not.be.checked');
      cy.get(`[data-cy="status"]`).click();
      cy.get(`[data-cy="status"]`).should('be.checked');

      cy.get(`[data-cy="organisationId"]`).type('exploration selfish');
      cy.get(`[data-cy="organisationId"]`).should('have.value', 'exploration selfish');

      cy.get(`[data-cy="teamId"]`).type('sans condense unnaturally');
      cy.get(`[data-cy="teamId"]`).should('have.value', 'sans condense unnaturally');

      cy.get(`[data-cy="documentItems"]`).type('zowie drat cap');
      cy.get(`[data-cy="documentItems"]`).should('have.value', 'zowie drat cap');

      cy.get(`[data-cy="createdBy"]`).type('physically');
      cy.get(`[data-cy="createdBy"]`).should('have.value', 'physically');

      cy.get(`[data-cy="createdDate"]`).type('2026-05-12T15:03');
      cy.get(`[data-cy="createdDate"]`).blur();
      cy.get(`[data-cy="createdDate"]`).should('have.value', '2026-05-12T15:03');

      cy.get(`[data-cy="modifiedBy"]`).type('since muffled calmly');
      cy.get(`[data-cy="modifiedBy"]`).should('have.value', 'since muffled calmly');

      cy.get(`[data-cy="modifiedDate"]`).type('2026-05-12T15:26');
      cy.get(`[data-cy="modifiedDate"]`).blur();
      cy.get(`[data-cy="modifiedDate"]`).should('have.value', '2026-05-12T15:26');

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        profile = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', profilePageUrlPattern);
    });
  });
});
