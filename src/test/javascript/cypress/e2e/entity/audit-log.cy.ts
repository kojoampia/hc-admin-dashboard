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

describe('AuditLog e2e test', () => {
  const auditLogPageUrl = '/audit-log';
  const auditLogPageUrlPattern = new RegExp('/audit-log(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  const auditLogSample = { actionType: 'unabashedly', userId: 'including mechanic' };

  let auditLog;

  beforeEach(() => {
    cy.login(username, password);
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/audit-logs+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/audit-logs').as('postEntityRequest');
    cy.intercept('DELETE', '/api/audit-logs/*').as('deleteEntityRequest');
  });

  afterEach(() => {
    if (auditLog) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/audit-logs/${auditLog.id}`,
      }).then(() => {
        auditLog = undefined;
      });
    }
  });

  it('AuditLogs menu should load AuditLogs page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('audit-log');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('AuditLog').should('exist');
    cy.url().should('match', auditLogPageUrlPattern);
  });

  describe('AuditLog page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(auditLogPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create AuditLog page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/audit-log/new$'));
        cy.getEntityCreateUpdateHeading('AuditLog');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', auditLogPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/audit-logs',
          body: auditLogSample,
        }).then(({ body }) => {
          auditLog = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/audit-logs+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              body: [auditLog],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(auditLogPageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details AuditLog page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('auditLog');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', auditLogPageUrlPattern);
      });

      it('edit button click should load edit AuditLog page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('AuditLog');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', auditLogPageUrlPattern);
      });

      it('edit button click should load edit AuditLog page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('AuditLog');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', auditLogPageUrlPattern);
      });

      it('last delete button click should delete instance of AuditLog', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('auditLog').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', auditLogPageUrlPattern);

        auditLog = undefined;
      });
    });
  });

  describe('new AuditLog page', () => {
    beforeEach(() => {
      cy.visit(`${auditLogPageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('AuditLog');
    });

    it('should create an instance of AuditLog', () => {
      cy.get(`[data-cy="actionType"]`).type('each lavish cauliflower');
      cy.get(`[data-cy="actionType"]`).should('have.value', 'each lavish cauliflower');

      cy.get(`[data-cy="userId"]`).type('regarding upon');
      cy.get(`[data-cy="userId"]`).should('have.value', 'regarding upon');

      cy.get(`[data-cy="metadata"]`).type('knotty till');
      cy.get(`[data-cy="metadata"]`).should('have.value', 'knotty till');

      cy.get(`[data-cy="createdBy"]`).type('meh');
      cy.get(`[data-cy="createdBy"]`).should('have.value', 'meh');

      cy.get(`[data-cy="createdDate"]`).type('2026-05-12T05:12');
      cy.get(`[data-cy="createdDate"]`).blur();
      cy.get(`[data-cy="createdDate"]`).should('have.value', '2026-05-12T05:12');

      cy.get(`[data-cy="modifiedBy"]`).type('wetly supposing doorpost');
      cy.get(`[data-cy="modifiedBy"]`).should('have.value', 'wetly supposing doorpost');

      cy.get(`[data-cy="modifiedDate"]`).type('2026-05-12T09:23');
      cy.get(`[data-cy="modifiedDate"]`).blur();
      cy.get(`[data-cy="modifiedDate"]`).should('have.value', '2026-05-12T09:23');

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        auditLog = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', auditLogPageUrlPattern);
    });
  });
});
