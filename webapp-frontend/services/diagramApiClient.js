// services/diagramApiClient.js - Client for Diagram API
const axios = require('axios');
const jwt = require('jsonwebtoken');

const API_URL = process.env.API_URL || 'http://localhost:3000';
const JWT_SECRET = process.env.API_JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

class DiagramAPIClient {
  /**
   * Generate JWT token for API authentication
   */
  static generateToken(user) {
    const payload = {
      apiKey: user.email,
      tier: user.tier,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours
    };

    return jwt.sign(payload, JWT_SECRET);
  }

  /**
   * Generate a diagram
   */
  static async generateDiagram(user, options) {
    const token = this.generateToken(user);

    try {
      const response = await axios.post(`${API_URL}/api/diagram/generate`, {
        prompt: options.prompt,
        diagramType: options.diagramType || 'python',
        style: options.style || 'azure',
        quality: options.quality || 'standard',
        template: options.template || null,
        templateType: options.templateType || 'aws'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Check diagram status
   */
  static async checkStatus(user, requestId) {
    const token = this.generateToken(user);

    try {
      const response = await axios.get(`${API_URL}/api/diagram/status/${requestId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get available templates
   */
  static async getTemplates(user) {
    const token = this.generateToken(user);

    try {
      const response = await axios.get(`${API_URL}/api/diagram/templates`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get Python diagram styles
   */
  static async getPythonStyles(user) {
    const token = this.generateToken(user);

    try {
      const response = await axios.get(`${API_URL}/api/diagram/python/styles`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get Python diagram templates
   */
  static async getPythonTemplates(user) {
    const token = this.generateToken(user);

    try {
      const response = await axios.get(`${API_URL}/api/diagram/python/templates`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get usage statistics
   */
  static async getUsage(user, timeWindow = 'day') {
    const token = this.generateToken(user);

    try {
      const response = await axios.get(`${API_URL}/api/diagram/usage?timeWindow=${timeWindow}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Cancel a request
   */
  static async cancelRequest(user, requestId) {
    const token = this.generateToken(user);

    try {
      const response = await axios.delete(`${API_URL}/api/diagram/cancel/${requestId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Poll for diagram completion
   */
  static async pollForCompletion(user, requestId, maxAttempts = 60, interval = 2000) {
    for (let i = 0; i < maxAttempts; i++) {
      const status = await this.checkStatus(user, requestId);

      if (status.status === 'completed') {
        return status;
      }

      if (status.status === 'failed') {
        throw new Error(status.error?.message || 'Diagram generation failed');
      }

      // Wait before next check
      await new Promise(resolve => setTimeout(resolve, interval));
    }

    throw new Error('Request timeout - diagram generation took too long');
  }

  /**
   * Handle API errors
   */
  static handleError(error) {
    if (error.response) {
      // API returned an error response
      const apiError = new Error(error.response.data.message || 'API request failed');
      apiError.status = error.response.status;
      apiError.code = error.response.data.error;
      return apiError;
    } else if (error.request) {
      // No response received
      return new Error('No response from API server - please check if API is running');
    } else {
      // Error setting up request
      return error;
    }
  }
}

module.exports = DiagramAPIClient;
