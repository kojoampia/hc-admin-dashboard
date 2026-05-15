import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'organisation',
    data: { pageTitle: 'adminDashboardApp.hcAdminServiceOrganisation.home.title' },
    loadChildren: () => import('./organisation/organisation.routes'),
  },
  {
    path: 'dashboard',
    data: { pageTitle: 'adminDashboardApp.hcAdminServiceDashboard.home.title' },
    loadChildren: () => import('./dashboard/dashboard.routes'),
  },
  {
    path: 'feature',
    data: { pageTitle: 'adminDashboardApp.hcAdminServiceFeature.home.title' },
    loadChildren: () => import('./feature/feature.routes'),
  },
  {
    path: 'message',
    data: { pageTitle: 'adminDashboardApp.hcAdminServiceMessage.home.title' },
    loadChildren: () => import('./message/message.routes'),
  },
  {
    path: 'duty-roster',
    data: { pageTitle: 'adminDashboardApp.hcAdminServiceDutyRoster.home.title' },
    loadChildren: () => import('./duty-roster/duty-roster.routes'),
  },
  {
    path: 'system-catalog',
    data: { pageTitle: 'adminDashboardApp.hcAdminServiceSystemCatalog.home.title' },
    loadChildren: () => import('./system-catalog/system-catalog.routes'),
  },
  {
    path: 'pricing-plan',
    data: { pageTitle: 'adminDashboardApp.hcAdminServicePricingPlan.home.title' },
    loadChildren: () => import('./pricing-plan/pricing-plan.routes'),
  },
  {
    path: 'patient-plan',
    data: { pageTitle: 'adminDashboardApp.hcAdminServicePatientPlan.home.title' },
    loadChildren: () => import('./patient-plan/patient-plan.routes'),
  },
  {
    path: 'professional',
    data: { pageTitle: 'adminDashboardApp.hcAdminServiceProfessional.home.title' },
    loadChildren: () => import('./professional/professional.routes'),
  },
  {
    path: 'address',
    data: { pageTitle: 'adminDashboardApp.address.home.title' },
    loadChildren: () => import('./address/address.routes'),
  },
  {
    path: 'person',
    data: { pageTitle: 'adminDashboardApp.person.home.title' },
    loadChildren: () => import('./person/person.routes'),
  },
  {
    path: 'contact',
    data: { pageTitle: 'adminDashboardApp.contact.home.title' },
    loadChildren: () => import('./contact/contact.routes'),
  },
  {
    path: 'photo',
    data: { pageTitle: 'adminDashboardApp.photo.home.title' },
    loadChildren: () => import('./photo/photo.routes'),
  },
  {
    path: 'document-item',
    data: { pageTitle: 'adminDashboardApp.documentItem.home.title' },
    loadChildren: () => import('./document-item/document-item.routes'),
  },
  {
    path: 'team',
    data: { pageTitle: 'adminDashboardApp.team.home.title' },
    loadChildren: () => import('./team/team.routes'),
  },
  {
    path: 'profile',
    data: { pageTitle: 'adminDashboardApp.profile.home.title' },
    loadChildren: () => import('./profile/profile.routes'),
  },
  {
    path: 'facility',
    data: { pageTitle: 'adminDashboardApp.facility.home.title' },
    loadChildren: () => import('./facility/facility.routes'),
  },
  {
    path: 'facility-catalog',
    data: { pageTitle: 'adminDashboardApp.facilityCatalog.home.title' },
    loadChildren: () => import('./facility-catalog/facility-catalog.routes'),
  },
  {
    path: 'notification',
    data: { pageTitle: 'adminDashboardApp.notification.home.title' },
    loadChildren: () => import('./notification/notification.routes'),
  },
  {
    path: 'audit-log',
    data: { pageTitle: 'adminDashboardApp.auditLog.home.title' },
    loadChildren: () => import('./audit-log/audit-log.routes'),
  },
  /* jhipster-needle-add-entity-route - JHipster will add entity modules routes here */
];

export default routes;
