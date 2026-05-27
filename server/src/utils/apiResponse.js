/**
 * ============================================================
 * Crudier CRM — Standard Response Helper
 * ============================================================
 */

class ApiResponse {
  /**
   * @param {boolean} success - Operation success status
   * @param {string} message - Human-readable explanation
   * @param {any} data - Payload to return (optional)
   */
  constructor(success, message, data = null) {
    this.success = success;
    this.message = message;
    if (data !== null && data !== undefined) {
      this.data = data;
    }
  }

  static success(res, message, data = null, statusCode = 200) {
    return res.status(statusCode).json(new ApiResponse(true, message, data));
  }

  static error(res, message, statusCode = 500, data = null) {
    return res.status(statusCode).json(new ApiResponse(false, message, data));
  }
}

module.exports = ApiResponse;
