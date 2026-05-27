/**
 * ============================================================
 * Crudier CRM — Queue Configurations
 * ============================================================
 * Defines Bull job processing parameters, worker concurrency limits,
 * queue channel identifiers, and retry delays.
 */

module.exports = {
  names: {
    EMAIL: 'email-queue',
    ALERTS: 'alerts-queue',
    EXPORTS: 'exports-queue',
  },
  concurrency: {
    email: 2,
    alerts: 5,
    exports: 1,
  },
  retryOptions: {
    limit: 3,
    backoffMs: 5000,
  },
};
