import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'hc-service',
    data: { pageTitle: 'adminDashboardApp.hcAdminServiceHCService.home.title' },
    loadChildren: () => import('./hcAdminService/hc-service/hc-service.routes'),
  },
  {
    path: 'hc-subscription',
    data: { pageTitle: 'adminDashboardApp.hcAdminServiceHCSubscription.home.title' },
    loadChildren: () => import('./hcAdminService/hc-subscription/hc-subscription.routes'),
  },
  {
    path: 'organisation',
    data: { pageTitle: 'adminDashboardApp.hcAdminServiceOrganisation.home.title' },
    loadChildren: () => import('./hcAdminService/organisation/organisation.routes'),
  },
  {
    path: 'dashboard',
    data: { pageTitle: 'adminDashboardApp.hcAdminServiceDashboard.home.title' },
    loadChildren: () => import('./hcAdminService/dashboard/dashboard.routes'),
  },
  {
    path: 'h-professional',
    data: { pageTitle: 'adminDashboardApp.hcAdminServiceHProfessional.home.title' },
    loadChildren: () => import('./hcAdminService/h-professional/h-professional.routes'),
  },
  {
    path: 'feature',
    data: { pageTitle: 'adminDashboardApp.hcAdminServiceFeature.home.title' },
    loadChildren: () => import('./hcAdminService/feature/feature.routes'),
  },
  {
    path: 'message',
    data: { pageTitle: 'adminDashboardApp.hcAdminServiceMessage.home.title' },
    loadChildren: () => import('./hcAdminService/message/message.routes'),
  },
  {
    path: 'duty-roster',
    data: { pageTitle: 'adminDashboardApp.hcAdminServiceDutyRoster.home.title' },
    loadChildren: () => import('./hcAdminService/duty-roster/duty-roster.routes'),
  },
  {
    path: 'system-catalog',
    data: { pageTitle: 'adminDashboardApp.hcAdminServiceSystemCatalog.home.title' },
    loadChildren: () => import('./hcAdminService/system-catalog/system-catalog.routes'),
  },
  {
    path: 'pricing-plan',
    data: { pageTitle: 'adminDashboardApp.hcAdminServicePricingPlan.home.title' },
    loadChildren: () => import('./hcAdminService/pricing-plan/pricing-plan.routes'),
  },
  {
    path: 'patient-plan',
    data: { pageTitle: 'adminDashboardApp.hcAdminServicePatientPlan.home.title' },
    loadChildren: () => import('./hcAdminService/patient-plan/patient-plan.routes'),
  },
  {
    path: 'professional',
    data: { pageTitle: 'adminDashboardApp.hcAdminServiceProfessional.home.title' },
    loadChildren: () => import('./hcAdminService/professional/professional.routes'),
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
