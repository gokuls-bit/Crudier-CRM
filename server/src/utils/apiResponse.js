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
    if (typeof res === 'string') {
      return new ApiResponse(true, res, message);
    }
    return res.status(statusCode).json(new ApiResponse(true, message, data));
  }

  static error(res, message, statusCode = 500, data = null) {
    if (typeof res === 'string') {
      return new ApiResponse(false, res, message);
    }
    return res.status(statusCode).json(new ApiResponse(false, message, data));
  }
}

module.exports = ApiResponse;
