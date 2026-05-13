### Core Administration Dashboard (`hc-admin-dashboard`)
The Core Administration Dashboard is a web-based interface that allows administrators to manage various aspects of the Health Connect platform, including duty rosters, system catalogs, pricing plans, and user profiles. It interacts with the `hc-admin-ms` microservice to perform CRUD operations and display relevant data.

### 1. Architecture & Configuration Requirements
- **Framework:** Angular 19 with TypeScript.
- **State Management:** Signal for real-time updates (e.g., roster changes).
- **UI Library:** Angular Material for consistent and responsive design.
- **Authentication:** OAuth2 (integrated with the Gateway for seamless SSO).
- **API Communication:** RESTful APIs provided by `hc-admin-ms` for data retrieval and manipulation.
- **Real-time Updates:** WebSockets or Server-Sent Events (SSE) for real-time roster updates and notifications.

### 2. User Interface (UI)
The dashboard will consist of several key sections:
- **Dashboard Home:** Overview of system status, recent activities, and quick access to key features.
- **Duty Rosters:** Interface to create, view, and manage duty rosters for healthcare professionals. This includes drag-and-drop functionality for scheduling and real-time updates when changes are made.
- **System Catalogs (CMS):** Manage catalogs for services, facilities, and other system components.
- **Pricing Plans:** Interface to define and manage pricing plans for various services offered on the platform.
- **User Profiles:** View and manage user profiles, including personal information and assigned roles.
- **Notifications:** Real-time notifications for important events such as roster changes, system alerts, and user activities.

### 3. Business Logic
- **Roster Management:** Implement logic to handle roster creation, updates, and deletions. Ensure that changes are broadcasted to relevant stakeholders (e.g., healthcare professionals) via Kafka.
- **Catalog Management:** Implement CRUD operations for system catalogs, ensuring data integrity and consistency.
- **Pricing Plan Management:** Implement logic to manage pricing plans, including validation and application of pricing rules.
- **Profile Management:** Implement logic to manage user profiles, including validation of personal information and role assignments.
- **Real-time Updates:** Implement logic to handle real-time updates for roster changes and notifications, ensuring that the UI reflects the latest data without requiring manual refreshes.
- **Security:** Ensure that all operations are secured based on user roles and permissions, leveraging OAuth2 and JWT claims for access control.
- **Error Handling:** Implement robust error handling and user feedback mechanisms to ensure a smooth user experience, especially when interacting with the backend services.
- **Performance Optimization:** Implement caching strategies and optimize API calls to ensure a responsive user interface, especially when dealing with large datasets such as rosters and catalogs.
- **Testing:** Implement comprehensive unit and integration tests to ensure the reliability and correctness of the dashboard's functionality.
- **Accessibility:** Ensure that the dashboard is accessible to users with disabilities, following best practices for web accessibility (e.g., ARIA roles, keyboard navigation).

### 4. Conclusion
The Core Administration Dashboard is a critical component of the Health Connect platform, providing administrators with the tools they need to effectively manage the system. By leveraging Angular, Signal, and RESTful APIs, the dashboard will offer a responsive and user-friendly interface for managing duty rosters, system catalogs, pricing plans, and user profiles, while ensuring real-time updates and secure access control.

### 5. Data Model
The dashboard will interact with the following data models defined in the `hc-admin-ms` microservice:
- **Feature:** Represents a system feature or capability, including its name, description, and type.
- **Message:** Represents a message or notification, including its content, timestamp, sender and recipient IDs, and message type.
- **PersonalInformation:** Represents personal information for user profiles, including first name, last name, date of birth, gender, marital status, nationality, language, email, and phone number.
- **Address:** Represents addresses for user profiles, including street, district, town, city, region, code, and country.
- **Profile:** Represents a user profile, including personal information, addresses, and assigned roles.
- **DutyRoster:** Represents a duty roster for healthcare professionals, including assigned professionals, schedule, and related metadata.
- **Catalog:** Represents a system catalog entry, including name, description, and type.
- **PricingPlan:** Represents a pricing plan for services, including name, description, price, and applicable rules.
- **Notification:** Represents a notification for administrators, including content, timestamp, and related metadata.
- **AuditLog:** Represents an audit log entry for administrative actions, including action type, timestamp, user ID, and related metadata.
- **SystemStatus:** Represents the current status of the system, including uptime, performance metrics, and any active alerts or issues.
- **UserActivity:** Represents user activity logs for administrators, including actions performed, timestamps, and related metadata.
- **SystemAlert:** Represents system alerts for administrators, including alert type, severity, timestamp, and related metadata.
- **AnalyticsReport:** Represents analytics reports for administrators, including report type, generated timestamp, and related data insights.
- **Role:** Represents user roles for access control, including role name and associated permissions.
- **Permission:** Represents permissions for access control, including permission name and description.
- **AuditTrail:** Represents an audit trail for administrative actions, including action type, timestamp, user ID, and related metadata for compliance and monitoring purposes.
- **SystemConfiguration:** Represents system configuration settings for administrators, including configuration key, value, and description for managing system behavior and features.
- **ServiceCatalog:** Represents a catalog of services offered on the platform, including service name, description, and related metadata for administrators to manage available services effectively.
- **FacilityCatalog:** Represents a catalog of facilities available on the platform, including facility name, description, and related metadata for administrators to manage healthcare facilities effectively.
- **UserRoleAssignment:** Represents the assignment of roles to user profiles, including user ID, role ID, and related metadata for managing access control effectively.
- **SystemLog:** Represents system logs for administrators, including log type, timestamp, user ID, and related metadata for monitoring and troubleshooting system issues effectively.
- **PerformanceMetrics:** Represents performance metrics for the system, including metric name, value, timestamp, and related metadata for monitoring and optimizing system performance effectively.
- **ComplianceRecord:** Represents compliance records for administrators, including record type, timestamp, user ID, and related metadata for ensuring regulatory compliance and auditing purposes.
- **UserFeedback:** Represents user feedback for administrators, including feedback content, timestamp, user ID, and related metadata for gathering insights and improving the system based on user input.
- **SystemHealth:** Represents the overall health of the system, including health status, uptime, and related metadata for administrators to monitor and maintain system reliability effectively.
- **SystemMaintenance:** Represents scheduled system maintenance for administrators, including maintenance type, scheduled timestamp, and related metadata for managing system downtime effectively.
- **SystemUpgrade:** Represents scheduled system upgrades for administrators, including upgrade type, scheduled timestamp, and related metadata for managing system updates effectively.
- **SystemIncident:** Represents system incidents for administrators, including incident type, severity, timestamp, and related metadata for managing and resolving system issues effectively.
- **SystemRecovery:** Represents system recovery actions for administrators, including recovery type, timestamp, and related metadata for managing disaster recovery and business continuity effectively.
- **SystemBackup:** Represents system backup actions for administrators, including backup type, timestamp, and related metadata for managing data backup and recovery effectively.
- **SystemAudit:** Represents system audits for administrators, including audit type, timestamp, user ID, and related metadata for ensuring system security and compliance effectively.
- **SystemMonitoring:** Represents system monitoring data for administrators, including monitoring type, timestamp, and related metadata for tracking system performance and health effectively.
- **SystemAlert:** Represents system alerts for administrators, including alert type, severity, timestamp, and related metadata for managing and responding to system issues effectively.
- **SystemReport:** Represents system reports for administrators, including report type, generated timestamp, and related data insights for monitoring and improving system performance effectively.
- **SystemNotification:** Represents system notifications for administrators, including notification content, timestamp, and related metadata for keeping administrators informed about important events and updates effectively.
- **SystemAuditTrail:** Represents an audit trail for system actions, including action type, timestamp, user ID, and related metadata for ensuring accountability and traceability of administrative actions effectively.

### 6. API Endpoints
The dashboard will interact with the following API endpoints provided by the `hc-admin-ms` microservice:
- `GET /api/duty-rosters`: Retrieve a list of duty rosters.
- `POST /api/duty-rosters`: Create a new duty roster.
- `PUT /api/duty-rosters/{id}`: Update an existing duty roster.
- `DELETE /api/duty-rosters/{id}`: Delete a duty roster.
- `GET /api/catalogs`: Retrieve a list of system catalogs.
- `POST /api/catalogs`: Create a new system catalog entry.
- `PUT /api/catalogs/{id}`: Update an existing system catalog entry.
- `DELETE /api/catalogs/{id}`: Delete a system catalog entry.
- `GET /api/pricing-plans`: Retrieve a list of pricing plans.
- `POST /api/pricing-plans`: Create a new pricing plan.
- `PUT /api/pricing-plans/{id}`: Update an existing pricing plan.
- `DELETE /api/pricing-plans/{id}`: Delete a pricing plan.
- `GET /api/profiles`: Retrieve a list of user profiles.
- `POST /api/profiles`: Create a new user profile.
- `PUT /api/profiles/{id}`: Update an existing user profile.
- `DELETE /api/profiles/{id}`: Delete a user profile.
- `GET /api/notifications`: Retrieve a list of notifications for administrators.
- `POST /api/notifications`: Create a new notification for administrators.
- `PUT /api/notifications/{id}`: Update an existing notification for administrators.
- `DELETE /api/notifications/{id}`: Delete a notification for administrators.
- `GET /api/audit-logs`: Retrieve a list of audit logs for administrative actions.
- `GET /api/system-status`: Retrieve the current status of the system.
- `GET /api/user-activities`: Retrieve a list of user activities for administrators.
- `GET /api/system-alerts`: Retrieve a list of system alerts for administrators.
- `GET /api/analytics-reports`: Retrieve a list of analytics reports for administrators.
- `GET /api/roles`: Retrieve a list of user roles for access control.
- `POST /api/roles`: Create a new user role for access control.
- `PUT /api/roles/{id}`: Update an existing user role for access control.
- `DELETE /api/roles/{id}`: Delete a user role for access control.
- `GET /api/permissions`: Retrieve a list of permissions for access control.
- `POST /api/permissions`: Create a new permission for access control.
- `PUT /api/permissions/{id}`: Update an existing permission for access control.
- `DELETE /api/permissions/{id}`: Delete a permission for access control.
- `GET /api/audit-trails`: Retrieve a list of audit trails for administrative actions.
- `GET /api/system-configurations`: Retrieve a list of system configurations for administrators.
- `POST /api/system-configurations`: Create a new system configuration for administrators.
- `PUT /api/system-configurations/{id}`: Update an existing system configuration for administrators.
- `DELETE /api/system-configurations/{id}`: Delete a system configuration for administrators.
- `GET /api/service-catalogs`: Retrieve a list of service catalogs for administrators.
- `POST /api/service-catalogs`: Create a new service catalog for administrators.
- `PUT /api/service-catalogs/{id}`: Update an existing service catalog for administrators.
- `DELETE /api/service-catalogs/{id}`: Delete a service catalog for administrators.
- `GET /api/facility-catalogs`: Retrieve a list of facility catalogs for administrators.
- `POST /api/facility-catalogs`: Create a new facility catalog for administrators.
- `PUT /api/facility-catalogs/{id}`: Update an existing facility catalog for administrators.
- `DELETE /api/facility-catalogs/{id}`: Delete a facility catalog for administrators.
- `GET /api/user-role-assignments`: Retrieve a list of user role assignments for administrators.
- `POST /api/user-role-assignments`: Create a new user role assignment for administrators.
- `PUT /api/user-role-assignments/{id}`: Update an existing user role assignment for administrators.
- `DELETE /api/user-role-assignments/{id}`: Delete a user role assignment for administrators.
- `GET /api/system-logs`: Retrieve a list of system logs for administrators.
- `GET /api/performance-metrics`: Retrieve a list of performance metrics for the system.
- `GET /api/compliance-records`: Retrieve a list of compliance records for administrators.
- `GET /api/user-feedback`: Retrieve a list of user feedback for administrators.
- `POST /api/user-feedback`: Create a new user feedback entry for administrators.
- `GET /api/system-health`: Retrieve the overall health of the system for administrators.
- `GET /api/system-maintenance`: Retrieve a list of scheduled system maintenance for administrators.
- `POST /api/system-maintenance`: Create a new scheduled system maintenance for administrators.
- `PUT /api/system-maintenance/{id}`: Update an existing scheduled system maintenance for administrators.
- `DELETE /api/system-maintenance/{id}`: Delete a scheduled system maintenance for administrators.
- `GET /api/system-upgrades`: Retrieve a list of scheduled system upgrades for administrators.
- `POST /api/system-upgrades`: Create a new scheduled system upgrade for administrators.
- `PUT /api/system-upgrades/{id}`: Update an existing scheduled system upgrade for administrators.
- `DELETE /api/system-upgrades/{id}`: Delete a scheduled system upgrade for administrators.
- `GET /api/system-incidents`: Retrieve a list of system incidents for administrators.
- `POST /api/system-incidents`: Create a new system incident for administrators.
- `PUT /api/system-incidents/{id}`: Update an existing system incident for administrators.
- `DELETE /api/system-incidents/{id}`: Delete a system incident for administrators.
- `GET /api/system-recoveries`: Retrieve a list of system recoveries for administrators.
- `POST /api/system-recoveries`: Create a new system recovery for administrators.
- `PUT /api/system-recoveries/{id}`: Update an existing system recovery for administrators.
- `DELETE /api/system-recoveries/{id}`: Delete a system recovery for administrators.
- `GET /api/system-backups`: Retrieve a list of system backups for administrators.
- `POST /api/system-backups`: Create a new system backup for administrators.
- `PUT /api/system-backups/{id}`: Update an existing system backup for administrators.
- `DELETE /api/system-backups/{id}`: Delete a system backup for administrators.
- `GET /api/system-audits`: Retrieve a list of system audits for administrators.
- `POST /api/system-audits`: Create a new system audit for administrators.
- `GET /api/system-monitoring`: Retrieve a list of system monitoring data for administrators.
- `GET /api/system-alerts`: Retrieve a list of system alerts for administrators.
- `GET /api/system-reports`: Retrieve a list of system reports for administrators.
- `GET /api/system-notifications`: Retrieve a list of system notifications for administrators.
- `POST /api/system-notifications`: Create a new system notification for administrators.
- `GET /api/system-audit-trails`: Retrieve a list of system audit trails for administrators.
- `POST /api/system-audit-trails`: Create a new system audit trail for administrators.
- `PUT /api/system-audit-trails/{id}`: Update an existing system audit trail for administrators.
- `DELETE /api/system-audit-trails/{id}`: Delete a system audit trail for administrators.

### 7. Entity Models
The dashboard will interact with the following entity models defined in the `hc-admin-ms` microservice:
```jdl


entity Person {
  firstName String required,
  lastName String required,
  dateOfBirth LocalDate required,
  gender String required,
  maritalStatus String required,
  nationality String required,
  language String required
}
entity Address {
  street String required,
  district String required,
  town String required,
  city String required,
  region String required,
  code String required,
  country String required
}
entity Contact {
  personId String required,
  email String required unique,
  phoneNumber String
}
entity Photo {
  url String required,
  altText String required,
  description String required
  profileId String required
  photoType String required // PORTRAIT, ID_PHOTO, DOCUMENT_PHOTO, OTHER etc.
  photoData String required // Base64 encoded photo data for upload and storage
  photoMetadata String // JSON string containing metadata such as upload timestamp, uploader ID, etc.
}
entity DocumentItem {
  name String required,
  description String,
  type String required, // PASSPORT, ID_CARD, DRIVER_LICENSE, CERTIFICATE, BUSINESS_LICENSE, OTHER etc.
  url String required
}
entity Team {
  name String required,
  description String,
  members String,
  supervisorId String required
  organizationId String required
}
entity Organization {
  name String required,
  description String,
  addressId String required,
  contactId String required
}
entity Profile {
  personalInformation Person required,
  photo Photo required,
  contact Contact required,
  addresses Address required,
  roles String required,
  status boolean required
  organizationId String required
  teamId String required
  documentItems DocumentItem
}

entity Profile {
  personalInformationId String required,
  addressId String required,
  role String required,
  status boolean required
  organizationId String required
  teamId String required
  documentItems String
}
```

### 8. Example Code Snippets
Here are some example code snippets for the `hc-admin-ms` microservice that the dashboard will interact with:
```java 
@Service
public class DutyRosterService {
    @Autowired
    private DutyRosterRepository dutyRosterRepository;
    @Autowired
    private KafkaTemplate<String, DutyRoster> kafkaTemplate;
    public DutyRoster createDutyRoster(DutyRoster dutyRoster) {
        DutyRoster savedRoster = dutyRosterRepository.save(dutyRoster);
        kafkaTemplate.send("roster", savedRoster);
        return savedRoster;
    } 
    // Additional methods for update and delete
}
```
```java
@Service
public class SystemCatalogService {
    @Autowired
    private SystemCatalogRepository systemCatalogRepository;
    public SystemCatalog createSystemCatalog(SystemCatalog systemCatalog) {
        return systemCatalogRepository.save(systemCatalog);
    }
    // Additional methods for update and delete
}
```
```java
@Service
public class PricingPlanService {
    @Autowired
    private PricingPlanRepository pricingPlanRepository;
    @Autowired
    private SubscriptionRepository subscriptionRepository;
    @Autowired
    private KafkaTemplate<String, PricingPlan> kafkaTemplate;
    public PricingPlan createPricingPlan(PricingPlan pricingPlan) {
        PricingPlan savedPlan = pricingPlanRepository.save(pricingPlan);
        kafkaTemplate.send("pricing", savedPlan);
        return savedPlan;
    }
    // Additional methods for update and delete
    public Subscription subscribeToPlan(String patientId, String planId) {
        Subscription subscription = new Subscription();
        subscription.setPatientId(patientId);
        subscription.setPlanId(planId);
        subscription.setStartDate(LocalDate.now());
        subscription.setEndDate(LocalDate.now().plusMonths(1)); // Example duration
        return subscriptionRepository.save(subscription);
    }
}
```
```java
@Service
public class ProfileService {
    @Autowired
    private ProfileRepository profileRepository;
    @KafkaListener(topics = "profile-updates", groupId = "hc-admin-ms")
    public void syncProfile(Profile profile) {
        profileRepository.save(profile);
    }
    // Additional methods for CRUD operations on profiles
}
```


### Next Steps
- Design the UI/UX for the dashboard, ensuring it meets the needs of administrators.
- Implement the frontend components and integrate them with the `hc-admin-ms` microservice.
- Set up real-time communication channels for roster updates and notifications.
- Conduct thorough testing to ensure the dashboard functions correctly and provides a seamless user experience.
- Deploy the dashboard and monitor its performance, making adjustments as necessary based on user feedback and system requirements.
- Continuously iterate on the dashboard's features and functionality to meet evolving administrative needs and enhance the overall user experience.
- Ensure that the dashboard remains aligned with the overall architecture and design principles of the Health Connect platform, maintaining consistency and scalability as the system evolves.
- Collaborate with other teams (e.g., backend developers, UX designers) to ensure that the dashboard integrates smoothly with the rest of the platform and meets the needs of all stakeholders.
- Document the dashboard's features, usage, and maintenance procedures to ensure that administrators can effectively utilize the tool and that future developers can easily understand and enhance its functionality.
- Plan for future enhancements, such as adding analytics and reporting features, integrating with additional services, and improving the user experience based on feedback and usage patterns.
- Monitor the dashboard's performance and user engagement, using analytics tools to gather insights and identify areas for improvement, ensuring that the dashboard continues to meet the needs of administrators and contributes to the overall success of the Health Connect platform.
- Stay updated with the latest developments in Angular, Signal, and web technologies to ensure that the dashboard remains modern, efficient, and user-friendly as the technology landscape evolves.
- Foster a culture of continuous improvement and collaboration within the team, encouraging feedback, knowledge sharing, and innovation to ensure that the dashboard remains a valuable tool for administrators and contributes to the overall success of the Health Connect platform.
- Ensure that the dashboard is scalable and maintainable, following best practices for code organization, modularity, and documentation to facilitate future enhancements and maintenance efforts.
- Regularly review and update the dashboard's features and functionality based on user feedback, system requirements, and evolving best practices to ensure that it continues to meet the needs of administrators and provides a seamless user experience.
- Collaborate with the security team to ensure that the dashboard adheres to security best practices, including secure coding standards, regular security audits, and timely updates to address any vulnerabilities that may arise, ensuring that the dashboard remains secure and protects sensitive administrative data.
- Plan for disaster recovery and business continuity, ensuring that the dashboard can recover quickly from any disruptions and that administrators can continue to manage the system effectively even in the face of unexpected events, contributing to the overall resilience and reliability of the Health Connect platform.