interface CloudflareCustomHostname {
  id: string;
  hostname: string;
  status: 'pending' | 'active' | 'moved' | 'deleted';
  ssl: {
    status: 'pending_validation' | 'pending_issuance' | 'pending_deployment' | 'active' | 'active_redeploying' | 'deleted';
    method: string;
    type: string;
    validation_errors?: Array<{
      message: string;
    }>;
  };
  ownership_verification?: {
    type: string;
    name: string;
    value: string;
  };
  ownership_verification_http?: {
    http_url: string;
    http_body: string;
  };
  created_at: string;
  verified_at?: string;
}

interface CloudflareResponse {
  success: boolean;
  errors: Array<{ message: string }>;
  result?: CloudflareCustomHostname;
}

export class CloudflareService {
  private apiToken: string;
  private zoneId: string;
  private baseUrl = 'https://api.cloudflare.com/client/v4';

  constructor() {
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;
    const zoneId = process.env.CLOUDFLARE_ZONE_ID;

    if (!apiToken || !zoneId) {
      throw new Error('CLOUDFLARE_API_TOKEN and CLOUDFLARE_ZONE_ID must be set');
    }

    this.apiToken = apiToken;
    this.zoneId = zoneId;
  }

  private async makeRequest(
    endpoint: string,
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
    body?: unknown
  ): Promise<CloudflareResponse> {
    const url = `${this.baseUrl}/zones/${this.zoneId}${endpoint}`;
    
    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(
        data.errors?.[0]?.message || `Cloudflare API error: ${response.status}`
      );
    }

    return data;
  }

  private mapStatus(cfStatus: string): 'pending' | 'active' | 'failed' | 'deleted' {
    if (cfStatus === 'active') return 'active';
    if (cfStatus === 'deleted') return 'deleted';
    if (cfStatus === 'moved') return 'failed';
    return 'pending';
  }

  private mapSslStatus(sslStatus: string): 'pending' | 'active' | 'failed' {
    if (sslStatus === 'active' || sslStatus === 'active_redeploying') return 'active';
    if (sslStatus.includes('pending')) return 'pending';
    return 'failed';
  }

  async createCustomHostname(hostname: string) {
    const response = await this.makeRequest('/custom_hostnames', 'POST', {
      hostname,
      ssl: {
        method: 'http',
        type: 'dv',
        settings: {
          min_tls_version: '1.0',
        },
      },
    });

    if (!response.success || !response.result) {
      throw new Error(response.errors?.[0]?.message || 'Failed to create custom hostname');
    }

    return {
      cloudflareId: response.result.id,
      status: this.mapStatus(response.result.status),
      sslStatus: this.mapSslStatus(response.result.ssl.status),
      verificationErrors: response.result.ssl.validation_errors?.map(e => e.message).join(', ') || null,
      ownershipVerification: response.result.ownership_verification 
        ? JSON.stringify(response.result.ownership_verification)
        : null,
      ownershipVerificationHttp: response.result.ownership_verification_http
        ? JSON.stringify(response.result.ownership_verification_http)
        : null,
      verifiedAt: response.result.verified_at ? new Date(response.result.verified_at) : null,
    };
  }

  async verifyCustomHostname(cloudflareId: string) {
    const response = await this.makeRequest(`/custom_hostnames/${cloudflareId}`, 'GET');

    if (!response.success || !response.result) {
      throw new Error(response.errors?.[0]?.message || 'Failed to verify custom hostname');
    }

    return {
      status: this.mapStatus(response.result.status),
      sslStatus: this.mapSslStatus(response.result.ssl.status),
      verificationErrors: response.result.ssl.validation_errors?.map(e => e.message).join(', ') || null,
      ownershipVerification: response.result.ownership_verification 
        ? JSON.stringify(response.result.ownership_verification)
        : null,
      ownershipVerificationHttp: response.result.ownership_verification_http
        ? JSON.stringify(response.result.ownership_verification_http)
        : null,
      verifiedAt: response.result.verified_at ? new Date(response.result.verified_at) : null,
    };
  }

  async deleteCustomHostname(cloudflareId: string) {
    const response = await this.makeRequest(`/custom_hostnames/${cloudflareId}`, 'DELETE');

    if (!response.success) {
      throw new Error(response.errors?.[0]?.message || 'Failed to delete custom hostname');
    }

    return true;
  }

  async listCustomHostnames() {
    const response = await this.makeRequest('/custom_hostnames', 'GET');

    if (!response.success) {
      throw new Error(response.errors?.[0]?.message || 'Failed to list custom hostnames');
    }

    return response;
  }
}
